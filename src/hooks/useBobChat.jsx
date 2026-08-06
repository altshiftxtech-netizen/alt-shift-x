import { useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useBobChat — the SINGLE, authoritative chat engine for BOB.
 *
 * This replaces the old split between useAgentStream + a parallel page latch
 * (which caused: stuck "working" indicator, premature "your turn", ghost
 * messages like an un-typed "continue", and a frozen Send button).
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

export default function useBobChat() {
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [queued, setQueued] = useState([]);  // follow-ups waiting for the current turn to finish

  const queuedRef = useRef([]);            // mirror of `queued` for use inside callbacks
  const messagesRef = useRef([]);          // mirror of `messages` for stale-free reads in callbacks
  const convRef = useRef(null);            // full conversation object (for addMessage)
  const unsubRef = useRef(null);
  const subscribedIdRef = useRef(null);
  const settleRef = useRef(null);
  const watchdogRef = useRef(null);
  const pendingUserRef = useRef(null);     // optimistic user bubble awaiting server echo
  const turnOpenRef = useRef(false);       // a user-initiated turn is in flight
  const lastTextRef = useRef("");          // last assistant text (settle tracking)
  const lastLenRef = useRef(0);            // last rendered message count (anti-flicker guard)
  const onDoneRef = useRef(null);          // optional completion callback (sounds, notify)

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const clearTimers = () => {
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
  };

  // Finish the current turn exactly once. Fires the completion callback only if
  // the turn was user-initiated and ended on a real spoken reply.
  const finishTurn = useCallback((msgs) => {
    clearTimers();
    setIsWorking(false);
    const wasOpen = turnOpenRef.current;
    turnOpenRef.current = false;
    if (wasOpen && typeof onDoneRef.current === "function") {
      const last = (msgs || [])[(msgs || []).length - 1];
      if (isAssistantText(last)) onDoneRef.current(last, msgs);
    }
    // The turn is done — flush the NEXT queued follow-up (if any). Each queued
    // message opens its own turn, so they're delivered one at a time, in order:
    // BOB answers the original, then picks up the follow-up.
    if (queuedRef.current.length > 0) {
      const next = queuedRef.current[0];
      queuedRef.current = queuedRef.current.slice(1);
      setQueued([...queuedRef.current]);
      // Slight defer so React settles the "done" state before the next turn opens.
      setTimeout(() => {
        // Guard: if the user sent a NEW message during the 80ms defer, that
        // message opened its own turn (turnOpenRef = true). Delivering the
        // queued follow-up now would put two messages in-flight at once —
        // BOB's responses interleave and land out of sequence. Re-queue at
        // the front instead; the user's new turn will flush it when it ends.
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
    // turn closes, and any straggler reply is lost forever ("long stall, no
    // reply").
    const id = subscribedIdRef.current;
    if (id && handleUpdateRef.current) {
      base44.agents.getConversation(id).then((full) => {
        if (full?.messages) handleUpdateRef.current?.({ messages: full.messages });
      }).catch(() => {});
    }
  }, []);

  // Bound late (after `send` is defined) to avoid a TDZ cycle.
  const flushRef = useRef(null);
  // Bound late so finishTurn can trigger a final sync without a circular dep.
  const handleUpdateRef = useRef(null);

  // Is BOB still actively producing a reply for THIS turn?
  //
  // IMPORTANT: spoken text alone does NOT mean the turn is done. BOB often narrates
  // mid-batch ("Building now…", "1 of 16 ✅ — continuing in parallel") while tools
  // keep running. Returning "not working" the instant any text appeared made the
  // amber indicator flash off while BOB was clearly still working. Instead we treat
  // the turn as ongoing whenever ANY tool (on the last message OR earlier this turn)
  // is still running, and otherwise hand off to the settle timer — which only
  // finishes once the reply text has actually stopped changing.
  const detectWorking = (msgs) => {
    if (!turnOpenRef.current) return false;
    if (!msgs || msgs.length === 0) return true; // sent, nothing back yet
    const last = msgs[msgs.length - 1];

    if (last.role === "user") return true; // reply incoming

    // Any tool still running anywhere this turn → definitely working.
    const anyToolRunning = msgs.some(
      (m) => m.role === "assistant" && (m.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status))
    );
    if (anyToolRunning) return true;
    if (last.status && RUNNING.includes(last.status)) return true;

    // Tools settled. If BOB has spoken, stay "working" and let the settle timer
    // (driven by handleUpdate) close the turn once the text stops changing — this
    // keeps the amber indicator on through the whole stream instead of blinking off.
    // If nothing has been spoken yet, keep working until something is said.
    return true;
  };

  const handleUpdate = useCallback((data) => {
    let msgs = data.messages || [];

    // CRITICAL: Never let a shorter/staler message list wipe the visible
    // messages — this is what caused BOB's replies to vanish. The stall
    // detector (10s poll) and focus/visibility resync both call
    // getConversation, which can return a stale snapshot (server read-after-
    // write lag) that's BEHIND what the WebSocket stream already delivered.
    // The old guard only blocked this when no turn was open, but the stall
    // detector runs DURING a turn — exactly when the guard was disabled — so
    // the stale snapshot replaced the streamed reply and the stream (having
    // already sent those messages) never re-delivered them. Now we block ANY
    // update whose message count is below the last server count we saw.
    if (msgs.length < (lastLenRef.current || 0)) return;

    // Anti-stale: block same-count snapshots whose last assistant message lost
    // text. The stall detector (10s poll) and focus/visibility resync both call
    // getConversation, which can return a stale snapshot (server read-after-write
    // lag) with the SAME message count but older content — the last assistant
    // message is a shorter version of what the WebSocket stream already
    // delivered. Without this, the stale snapshot overwrites the streamed reply
    // and BOB's response appears to vanish mid-stream ("not responding").
    if (msgs.length === (lastLenRef.current || 0) && msgs.length > 0 && lastTextRef.current) {
      const newLast = msgs[msgs.length - 1];
      if (newLast?.role === "assistant" && typeof newLast.content === "string" &&
          newLast.content.length < lastTextRef.current.length) {
        return;
      }
    }

    lastLenRef.current = msgs.length;

    // The server conversation is the authoritative record. We ALWAYS render
    // server messages in server order and never reorder them — that guarantees
    // the exchange is an accurate, factual transcript.
    //
    // The only local addition is the optimistic user bubble for the message we
    // just sent, shown until the server echoes it back. We APPEND it at the end
    // (never inserted back into history), and only while the server's user-turn
    // count hasn't yet caught up to what we sent — so it can never land ahead of
    // an earlier assistant reply or duplicate a repeated message.
    const pending = pendingUserRef.current;
    if (pending) {
      const serverUserCount = msgs.reduce((n, m) => n + (m.role === "user" ? 1 : 0), 0);
      // The server's most recent user message already carries our pending text →
      // the echo has landed, so drop the optimistic copy to avoid a duplicate
      // bubble (the flash the user saw before it "went back to the right order").
      const lastServerUser = [...msgs].reverse().find((m) => m.role === "user");
      const echoed =
        lastServerUser &&
        typeof lastServerUser.content === "string" &&
        lastServerUser.content === (pending.content || "");
      if (serverUserCount >= (pending._expectedUserCount || 0) || echoed) {
        // Server has caught up to (or past) our optimistic message → trust it.
        pendingUserRef.current = null;
      } else {
        msgs = [...msgs, pending];
      }
    }
    setMessages(msgs);

    if (!turnOpenRef.current) {
      // The settle timer closed the turn, but if new assistant text is still
      // arriving, BOB was mid-response — a natural streaming pause triggered
      // the settle timer prematurely. Re-open the turn so the working indicator
      // and stall detector resume; without this, the response freezes mid-
      // sentence and the stall detector (which only runs while isWorking) can't
      // catch a subsequent stream death. Skip when there are queued follow-ups —
      // those mean the turn intentionally closed for the next send.
      const last = msgs[msgs.length - 1];
      const lastRunning = last && last.status && RUNNING.includes(last.status);
      // Re-open if new text arrived OR the server says the last message is
      // still being generated (status: pending/in_progress/running). The
      // "still running" check is critical: without it, a mid-reply stall where
      // the text hasn't changed YET (but the server is still generating) closes
      // the turn permanently — the stall detector stops and the rest of the
      // reply is lost.
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

    const working = detectWorking(msgs);
    if (!working) { finishTurn(msgs); return; }

    setIsWorking(true);

    // Settle: once BOB has spoken AND no tool is still running, start (or restart)
    // the settle timer. While the text keeps changing we push the timer out; the
    // moment it stops changing for SETTLE_MS the turn closes and the indicator
    // flips green. A still-running tool keeps the timer cleared so we never finish
    // mid-batch.
    const last = msgs[msgs.length - 1];
    const anyToolRunning = msgs.some(
      (m) => m.role === "assistant" && (m.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status))
    );
    if (isAssistantText(last) && !anyToolRunning) {
      if (last.content !== lastTextRef.current) {
        // Text still changing → reset the settle window.
        lastTextRef.current = last.content;
        if (settleRef.current) clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => finishTurn(msgs), SETTLE_MS);
      } else if (!settleRef.current) {
        // Text already stable and no timer pending (e.g. tools just finished after
        // the last text update) → arm the settle window so the turn can close.
        settleRef.current = setTimeout(() => finishTurn(msgs), SETTLE_MS);
      }
    } else if (anyToolRunning && settleRef.current) {
      // A new tool started after text settled → cancel the pending finish; we're
      // still working. The amber indicator stays on.
      clearTimeout(settleRef.current);
      settleRef.current = null;
    }
  }, [finishTurn]);

  // Wire handleUpdateRef so finishTurn can trigger a final sync without a
  // circular dependency (handleUpdate → finishTurn → handleUpdate).
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
  // Without this, BOB appears stalled until the user tabs away/back — and when
  // resync finally fires, the stalled reply + the next reply land together
  // ("two responses at once").
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

  // Load an existing conversation object into the chat.
  const openConversation = useCallback((full) => {
    clearTimers();
    turnOpenRef.current = false;
    pendingUserRef.current = null;
    // Seed lastTextRef with the last assistant reply so the subscription's
    // first update doesn't look like "new text arrived" and re-open the turn —
    // which would flash the "Deep-Path Reasoning" indicator on a restored
    // conversation that has no active query.
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

  // Blank slate — a fresh conversation is created lazily on the next send.
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
    // Fresh conversation — reset the anti-shrink guard so the old conversation's
    // message count doesn't block the first server updates on the new conv.
    lastLenRef.current = 0;
    return c;
  }, []);

  // Low-level deliver: actually opens a turn and posts the message to BOB.
  // Used both for a normal send AND when a queued follow-up is flushed.
  const deliver = useCallback(async ({ content, file_urls } = {}) => {
    const text = (content || "").trim();
    if (!text && !(file_urls && file_urls.length)) return null;

    // Open the turn FIRST so the indicator shows instantly.
    turnOpenRef.current = true;
    lastTextRef.current = "";
    setIsWorking(true);
    clearTimers();
    watchdogRef.current = setTimeout(() => finishTurn(), WATCHDOG_MS);

    const c = convRef.current || await initConv();

    // Optimistic user bubble (reconciled by handleUpdate). Record how many user
    // messages should exist on the server once this one lands — that's the exact
    // point at which we can stop showing the optimistic copy without reordering.
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

  // Keep finishTurn's flush wired to the real deliver fn.
  useEffect(() => { flushRef.current = deliver; }, [deliver]);

  // THE one and only send path used by the UI.
  // If BOB is mid-turn, the follow-up is QUEUED (shown as a stacked pending
  // bubble) and delivered automatically the moment the current turn finishes —
  // so builders can keep typing without interrupting BOB's work.
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

  // Remove a still-waiting queued follow-up before it's delivered.
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

  // Register a completion callback (sounds / notify). Called with (lastMsg, msgs).
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