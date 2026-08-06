import { useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useBobChat — the SINGLE, authoritative chat engine for BOB.
 *
 * ONE source of truth, ONE send path. Everything funnels through `send()`.
 *
 * Responsibilities:
 *  - Owns the conversation id, the live message list, and the `isWorking` flag.
 *  - Subscribes to the active conversation and reconciles streamed updates.
 *  - Shows an optimistic user bubble that is reconciled (never duplicated, never
 *    leaks into the next turn).
 *  - A watchdog guarantees `isWorking` can never hang forever.
 *
 * Public API:
 *  - messages, isWorking, convId
 *  - send({ content, file_urls })  → handles conv creation + add + stream
 *  - stop()                        → halt the current turn
 *  - openConversation(full)        → load an existing conversation
 *  - resetBoard()                  → blank slate (new conv created lazily on send)
 *  - setConversation(id, messages) → low-level setter for restores
 */

const RUNNING = ["pending", "in_progress", "running"];
// After the reply text stops changing, wait this long before calling the turn
// done. 2500ms covers natural LLM streaming pauses (token gaps, inter-paragraph
// breaks, tool-call handoffs) without feeling sluggish; if it fires prematurely
// anyway, handleUpdate re-opens the turn when new text arrives or the server
// reports the message is still generating, so the response never freezes.
const SETTLE_MS = 2500;
// Absolute ceiling: even a dead stream clears the indicator after this.
const WATCHDOG_MS = 60000;

const hasText = (m) =>
  m && typeof m.content === "string" && m.content.trim().length > 0;

const isAssistantText = (m) => m && m.role === "assistant" && hasText(m);

const isToolRunning = (m) =>
  m.role === "assistant" && (m.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status));

export default function useBobChat() {
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [queued, setQueued] = useState([]);

  const queuedRef = useRef([]);
  const messagesRef = useRef([]);
  const convRef = useRef(null);
  const unsubRef = useRef(null);
  const subscribedIdRef = useRef(null);
  const settleRef = useRef(null);
  const watchdogRef = useRef(null);
  const pendingUserRef = useRef(null);
  const turnOpenRef = useRef(false);
  const lastTextRef = useRef("");
  const lastLenRef = useRef(0);
  const onDoneRef = useRef(null);
  // Late-bound refs (set after the functions they point to are defined) to
  // break circular dependency chains without sacrificing stable callbacks.
  const flushRef = useRef(null);
  const handleUpdateRef = useRef(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const clearTimers = () => {
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
  };

  // ── Turn lifecycle ──────────────────────────────────────────────────────────

  // Finish the current turn exactly once. Fires the completion callback only if
  // the turn was user-initiated and ended on a real spoken reply, then flushes
  // the next queued follow-up and does a final sync to catch straggler replies
  // the WebSocket may have failed to deliver.
  const finishTurn = useCallback((msgs) => {
    clearTimers();
    setIsWorking(false);
    const wasOpen = turnOpenRef.current;
    turnOpenRef.current = false;
    if (wasOpen && typeof onDoneRef.current === "function") {
      const last = (msgs || [])[(msgs || []).length - 1];
      if (isAssistantText(last)) onDoneRef.current(last, msgs);
    }
    // Flush the next queued follow-up (if any). Each queued message opens its
    // own turn, so they're delivered one at a time, in order.
    if (queuedRef.current.length > 0) {
      const next = queuedRef.current[0];
      queuedRef.current = queuedRef.current.slice(1);
      setQueued([...queuedRef.current]);
      // Slight defer so React settles the "done" state before the next turn opens.
      setTimeout(() => {
        // Guard: if the user sent a NEW message during the 80ms defer, that
        // message opened its own turn. Delivering the queued follow-up now would
        // put two messages in-flight at once — BOB's responses interleave and
        // land out of sequence. Re-queue at the front instead; the user's new
        // turn will flush it when it ends.
        if (turnOpenRef.current) {
          queuedRef.current = [next, ...queuedRef.current];
          setQueued([...queuedRef.current]);
        } else {
          flushRef.current?.(next);
        }
      }, 80);
    }
    // Final sync: the WebSocket stream may have silently died mid-turn, leaving
    // the last few messages undelivered. Do one last fetch — if the server has
    // new messages, handleUpdate re-opens the turn automatically. Without this,
    // the stall detector (which only runs while isWorking) stops the moment the
    // turn closes, and any straggler reply is lost forever.
    const id = subscribedIdRef.current;
    if (id && handleUpdateRef.current) {
      base44.agents.getConversation(id).then((full) => {
        if (full?.messages) handleUpdateRef.current?.({ messages: full.messages });
      }).catch(() => {});
    }
  }, []);

  // ── Stream reconciliation ────────────────────────────────────────────────────

  // The single handler for ALL conversation updates (WebSocket stream, stall
  // detector poll, visibility resync, and the final sync in finishTurn).
  const handleUpdate = useCallback((data) => {
    let msgs = data.messages || [];

    // CRITICAL: Never let a shorter/staler message list wipe the visible
    // messages. The stall detector (10s poll) and focus/visibility resync both
    // call getConversation, which can return a stale snapshot (server read-after-
    // write lag) that's BEHIND what the WebSocket stream already delivered.
    if (msgs.length < (lastLenRef.current || 0)) return;

    // Anti-stale: block same-count snapshots whose last assistant message lost
    // text (same read-after-write lag, but content shrank instead of count).
    if (msgs.length === (lastLenRef.current || 0) && msgs.length > 0 && lastTextRef.current) {
      const newLast = msgs[msgs.length - 1];
      if (newLast?.role === "assistant" && typeof newLast.content === "string" &&
          newLast.content.length < lastTextRef.current.length) {
        return;
      }
    }
    lastLenRef.current = msgs.length;

    // The server conversation is the authoritative record. We ALWAYS render
    // server messages in server order and never reorder them. The only local
    // addition is the optimistic user bubble, shown until the server echoes it.
    const pending = pendingUserRef.current;
    if (pending) {
      const serverUserCount = msgs.reduce((n, m) => n + (m.role === "user" ? 1 : 0), 0);
      const lastServerUser = [...msgs].reverse().find((m) => m.role === "user");
      const echoed =
        lastServerUser &&
        typeof lastServerUser.content === "string" &&
        lastServerUser.content === (pending.content || "");
      if (serverUserCount >= (pending._expectedUserCount || 0) || echoed) {
        pendingUserRef.current = null;
      } else {
        msgs = [...msgs, pending];
      }
    }
    setMessages(msgs);

    const last = msgs[msgs.length - 1];

    // ── Turn closed: check if we should re-open ──────────────────────────────
    if (!turnOpenRef.current) {
      // Re-open if new assistant text arrived OR the server says the last
      // message is still being generated. The "still running" check is critical:
      // without it, a mid-reply stall where the text hasn't changed YET (but the
      // server is still generating) closes the turn permanently — the stall
      // detector stops and the rest of the reply is lost. Skip when there are
      // queued follow-ups — those mean the turn intentionally closed for the
      // next send.
      const lastRunning = last && last.status && RUNNING.includes(last.status);
      if (
        queuedRef.current.length === 0 &&
        (lastRunning || (isAssistantText(last) && last.content !== lastTextRef.current))
      ) {
        turnOpenRef.current = true;
        setIsWorking(true);
        lastTextRef.current = last.content || lastTextRef.current;
        clearTimers();
        settleRef.current = setTimeout(() => finishTurn(msgs), SETTLE_MS);
        watchdogRef.current = setTimeout(() => finishTurn(), WATCHDOG_MS);
      } else {
        setIsWorking(false);
      }
      return;
    }

    // ── Turn open: track settle / tool state ──────────────────────────────────
    setIsWorking(true);

    const anyToolRunning = msgs.some(isToolRunning);

    // Settle: once BOB has spoken AND no tool is still running, start (or reset)
    // the settle timer. While the text keeps changing we push the timer out; the
    // moment it stops changing for SETTLE_MS the turn closes. A still-running
    // tool keeps the timer cleared so we never finish mid-batch.
    if (isAssistantText(last) && !anyToolRunning) {
      if (last.content !== lastTextRef.current) {
        lastTextRef.current = last.content;
        if (settleRef.current) clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => finishTurn(msgs), SETTLE_MS);
      } else if (!settleRef.current) {
        settleRef.current = setTimeout(() => finishTurn(msgs), SETTLE_MS);
      }
    } else if (anyToolRunning && settleRef.current) {
      clearTimeout(settleRef.current);
      settleRef.current = null;
    }
  }, [finishTurn]);

  // Wire the late-bound refs.
  useEffect(() => { handleUpdateRef.current = handleUpdate; }, [handleUpdate]);

  const subscribe = useCallback((id) => {
    if (!id) return;
    if (subscribedIdRef.current === id && unsubRef.current) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    subscribedIdRef.current = id;
    unsubRef.current = base44.agents.subscribeToConversation(id, handleUpdate);
  }, [handleUpdate]);

  // Keep the live stream alive across mobile tab-suspend / lock / network drops.
  const resync = useCallback(async () => {
    const id = subscribedIdRef.current;
    if (!id) return;
    try {
      const full = await base44.agents.getConversation(id);
      if (full?.messages) handleUpdate({ messages: full.messages });
    } catch { /* resubscribe below catches up */ }
    subscribe(id);
  }, [handleUpdate, subscribe]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") resync(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", resync);
    window.addEventListener("online", resync);
    window.addEventListener("pageshow", resync);
    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      clearTimers();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", resync);
      window.removeEventListener("online", resync);
      window.removeEventListener("pageshow", resync);
    };
  }, [resync]);

  // Stall detector: while working, periodically poll the conversation to catch
  // responses the WebSocket stream failed to deliver (silent stream death).
  const stallRef = useRef(null);
  useEffect(() => {
    if (!isWorking) {
      if (stallRef.current) { clearInterval(stallRef.current); stallRef.current = null; }
      return;
    }
    stallRef.current = setInterval(async () => {
      const id = subscribedIdRef.current;
      if (!id) return;
      try {
        const full = await base44.agents.getConversation(id);
        if (full?.messages) handleUpdate({ messages: full.messages });
      } catch { /* stream will catch up */ }
    }, 10000);
    return () => { if (stallRef.current) clearInterval(stallRef.current); stallRef.current = null; };
  }, [isWorking, handleUpdate]);

  // ── Public actions ─────────────────────────────────────────────────────────

  const openConversation = useCallback((full) => {
    clearTimers();
    turnOpenRef.current = false;
    pendingUserRef.current = null;
    // Seed lastTextRef with the last assistant reply so the subscription's
    // first update doesn't look like "new text arrived" and re-open the turn.
    const msgs = full.messages || [];
    const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
    lastTextRef.current = typeof lastAssistant?.content === "string" ? lastAssistant.content : "";
    queuedRef.current = [];
    setQueued([]);
    setIsWorking(false);
    convRef.current = full;
    lastLenRef.current = msgs.length;
    setConvId(full.id);
    setMessages(msgs);
    subscribe(full.id);
  }, [subscribe]);

  const resetBoard = useCallback(() => {
    clearTimers();
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    subscribedIdRef.current = null;
    convRef.current = null;
    pendingUserRef.current = null;
    turnOpenRef.current = false;
    lastTextRef.current = "";
    lastLenRef.current = 0;
    queuedRef.current = [];
    setQueued([]);
    setIsWorking(false);
    setConvId(null);
    setMessages([]);
  }, []);

  const initConv = useCallback(async (name = "New Project") => {
    const c = await base44.agents.createConversation({ agent_name: "bob_builder", metadata: { name } });
    convRef.current = c;
    setConvId(c.id);
    lastLenRef.current = 0;
    return c;
  }, []);

  // Low-level deliver: opens a turn and posts the message to BOB. Used both for
  // a normal send and when a queued follow-up is flushed.
  const deliver = useCallback(async ({ content, file_urls } = {}) => {
    const text = (content || "").trim();
    if (!text && !(file_urls && file_urls.length)) return null;

    turnOpenRef.current = true;
    lastTextRef.current = "";
    setIsWorking(true);
    clearTimers();
    watchdogRef.current = setTimeout(() => finishTurn(), WATCHDOG_MS);

    const c = convRef.current || await initConv();

    // Optimistic user bubble (reconciled by handleUpdate).
    if (text || (file_urls && file_urls.length)) {
      const priorUserCount = messagesRef.current.reduce(
        (n, m) => n + (m.role === "user" && m !== pendingUserRef.current ? 1 : 0), 0
      );
      pendingUserRef.current = {
        role: "user",
        content,
        ...(file_urls ? { file_urls } : {}),
        _expectedUserCount: priorUserCount + 1,
      };
      setMessages((prev) => [...prev, pendingUserRef.current]);
    }

    await base44.agents.addMessage(c, { role: "user", content, ...(file_urls ? { file_urls } : {}) });
    // Force a fresh subscription — the previous stream may have silently died,
    // and `subscribe` would skip re-subscribing on the same conversation id.
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    subscribedIdRef.current = null;
    subscribe(c.id);
    return c;
  }, [finishTurn, initConv, subscribe]);

  useEffect(() => { flushRef.current = deliver; }, [deliver]);

  // THE one and only send path used by the UI. If BOB is mid-turn, the follow-up
  // is QUEUED and delivered automatically when the current turn finishes.
  const send = useCallback(async ({ content, file_urls } = {}) => {
    const text = (content || "").trim();
    if (!text && !(file_urls && file_urls.length)) return null;

    if (turnOpenRef.current) {
      const item = { content, ...(file_urls ? { file_urls } : {}) };
      queuedRef.current = [...queuedRef.current, item];
      setQueued([...queuedRef.current]);
      return convRef.current;
    }

    return deliver({ content, file_urls });
  }, [deliver]);

  const removeQueued = useCallback((index) => {
    queuedRef.current = queuedRef.current.filter((_, i) => i !== index);
    setQueued([...queuedRef.current]);
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    turnOpenRef.current = false;
    setIsWorking(false);
    queuedRef.current = [];
    setQueued([]);
  }, []);

  const setOnDone = useCallback((fn) => { onDoneRef.current = fn; }, []);

  return {
    convId,
    conv: convRef.current,
    messages,
    isWorking,
    queued,
    removeQueued,
    send,
    stop,
    openConversation,
    resetBoard,
    initConv,
    setConvId,
    setMessages,
    setOnDone,
  };
}