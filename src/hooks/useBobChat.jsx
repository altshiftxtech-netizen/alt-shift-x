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
// done — prevents "your turn" flashing on a half-streamed sentence.
const SETTLE_MS = 1600;
// Absolute ceiling: even a dead stream clears the indicator after this.
const WATCHDOG_MS = 60000;

const hasText = (m) =>
  m && typeof m.content === "string" && m.content.trim().length > 0;

const isAssistantText = (m) => m && m.role === "assistant" && hasText(m);

export default function useBobChat() {
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isWorking, setIsWorking] = useState(false);

  const convRef = useRef(null);            // full conversation object (for addMessage)
  const unsubRef = useRef(null);
  const subscribedIdRef = useRef(null);
  const settleRef = useRef(null);
  const watchdogRef = useRef(null);
  const pendingUserRef = useRef(null);     // optimistic user bubble awaiting server echo
  const turnOpenRef = useRef(false);       // a user-initiated turn is in flight
  const lastTextRef = useRef("");          // last assistant text (settle tracking)
  const onDoneRef = useRef(null);          // optional completion callback (sounds, notify)

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
  }, []);

  // Is BOB still actively producing a reply for THIS turn?
  const detectWorking = (msgs) => {
    if (!turnOpenRef.current) return false;
    if (!msgs || msgs.length === 0) return true; // sent, nothing back yet
    const last = msgs[msgs.length - 1];

    if (last.role === "user") return true; // reply incoming

    // An assistant message exists. If ANY assistant message this turn has spoken
    // text, and the LAST message's tools have settled, we're done.
    const anySpoke = msgs.some(isAssistantText);
    const lastToolRunning = (last.tool_calls || []).some(
      (t) => t.status && RUNNING.includes(t.status)
    );
    if (lastToolRunning) return true;            // still running a tool
    if (last.status && RUNNING.includes(last.status)) return true;
    if (anySpoke) return false;                  // spoke + tools settled → done(ish)

    // Nothing spoken yet anywhere and no running tool on last — check earlier.
    const anyToolRunning = msgs.some(
      (m) => m.role === "assistant" && (m.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status))
    );
    return anyToolRunning || !anySpoke; // keep working until something is said
  };

  const handleUpdate = useCallback((data) => {
    let msgs = data.messages || [];

    // Reconcile the optimistic user bubble: keep it visible until the server
    // list actually contains it, inserting BEFORE any trailing assistant reply
    // so order is always history → your message → BOB's reply.
    const pending = pendingUserRef.current;
    if (pending) {
      const serverHasIt = msgs.some(
        (m) => m.role === "user" && (m.content || "") === pending.content
      );
      if (serverHasIt) {
        pendingUserRef.current = null;
      } else {
        let at = msgs.length;
        while (at > 0 && msgs[at - 1].role === "assistant") at--;
        msgs = [...msgs.slice(0, at), pending, ...msgs.slice(at)];
      }
    }
    setMessages(msgs);

    if (!turnOpenRef.current) { setIsWorking(false); return; }

    const working = detectWorking(msgs);
    if (!working) { finishTurn(msgs); return; }

    setIsWorking(true);

    // Settle: if the last message has spoken text, finish once it stops changing.
    const last = msgs[msgs.length - 1];
    if (isAssistantText(last)) {
      if (last.content !== lastTextRef.current) {
        lastTextRef.current = last.content;
        if (settleRef.current) clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => finishTurn(msgs), SETTLE_MS);
      }
    }
  }, [finishTurn]);

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

  // ── Public actions ─────────────────────────────────────────────────────────

  // Load an existing conversation object into the chat.
  const openConversation = useCallback((full) => {
    clearTimers();
    turnOpenRef.current = false;
    pendingUserRef.current = null;
    lastTextRef.current = "";
    setIsWorking(false);
    convRef.current = full;
    setConvId(full.id);
    setMessages(full.messages || []);
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
    setIsWorking(false);
    setConvId(null);
    setMessages([]);
  }, []);

  const initConv = useCallback(async (name = "New Project") => {
    const c = await base44.agents.createConversation({ agent_name: "bob_builder", metadata: { name } });
    convRef.current = c;
    setConvId(c.id);
    return c;
  }, []);

  // THE one and only send path. Returns the conversation used.
  const send = useCallback(async ({ content, file_urls } = {}) => {
    const text = (content || "").trim();
    if (!text && !(file_urls && file_urls.length)) return null;

    // Open the turn FIRST so the indicator shows instantly.
    turnOpenRef.current = true;
    lastTextRef.current = "";
    setIsWorking(true);
    clearTimers();
    watchdogRef.current = setTimeout(() => finishTurn(), WATCHDOG_MS);

    const c = convRef.current || await initConv();

    // Optimistic user bubble (reconciled by handleUpdate).
    if (text) {
      pendingUserRef.current = { role: "user", content, ...(file_urls ? { file_urls } : {}) };
      setMessages((prev) => [...prev, pendingUserRef.current]);
    }

    await base44.agents.addMessage(c, { role: "user", content, ...(file_urls ? { file_urls } : {}) });
    subscribe(c.id);
    return c;
  }, [finishTurn, initConv, subscribe]);

  const stop = useCallback(() => {
    clearTimers();
    turnOpenRef.current = false;
    setIsWorking(false);
  }, []);

  // Register a completion callback (sounds / notify). Called with (lastMsg, msgs).
  const setOnDone = useCallback((fn) => { onDoneRef.current = fn; }, []);

  return {
    convId,
    conv: convRef.current,
    messages,
    isWorking,
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