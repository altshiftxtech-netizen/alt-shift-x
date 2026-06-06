import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useAgentStream — shared streaming + stop control for any platform bot.
 *
 * Exposes:
 *  - messages: live message list
 *  - isGenerating: true while the agent is actively producing a reply
 *  - stop(): halts the local stream — freezes the last assistant message,
 *    clears the generating indicator, and latches "done" so no late update
 *    can re-raise the indicator until the next user send.
 *  - onSent(): call right after you addMessage() so the hook knows a reply is
 *    incoming and resets state for a fresh turn.
 *
 * Design notes (why this is robust against "stuck bubble" / "bubble returns"):
 *  - A `doneRef` latch is set the moment we see a complete assistant reply
 *    (has text, no running tools). Once latched, isGenerating stays false until
 *    the next onSent(), so a trailing/stray stream update can't flip it back on.
 *  - A watchdog ALWAYS force-clears generating after inactivity, regardless of
 *    what the stream reports — so a dead/stalled stream can never hang the UI.
 */
// Long enough to survive natural pauses between streamed tokens / model
// "thinking" gaps. A shorter value can kill a still-streaming reply.
const IDLE_TIMEOUT_MS = 8000;
// After BOB's reply text STOPS changing, wait this long before declaring the
// turn finished. This prevents the "BOB finished — your turn" marker from
// flashing on a half-streamed sentence (e.g. "...that the i"). If a new token
// arrives within this window, the settle timer resets and the turn stays live.
const SETTLE_MS = 1800;

export default function useAgentStream(convId, initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const unsubRef = useRef(null);
  const idleTimerRef = useRef(null);
  const settleTimerRef = useRef(null);     // fires when reply text stops changing
  const lastAssistantTextRef = useRef("");  // last seen assistant content (settle tracking)
  const lastSnapshotRef = useRef("");
  const doneRef = useRef(true); // latched "this turn is finished"
  // Optimistic user message shown instantly on send. Kept until the server's
  // message list actually contains it, so the stream can't wipe it mid-race.
  const pendingUserRef = useRef(null);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };
  const clearSettleTimer = () => {
    if (settleTimerRef.current) { clearTimeout(settleTimerRef.current); settleTimerRef.current = null; }
  };

  // Latch the current turn as finished and clear all working indicators/timers.
  const finishTurn = useCallback(() => {
    doneRef.current = true;
    setIsGenerating(false);
    clearIdleTimer();
    clearSettleTimer();
  }, []);

  // Watchdog: after a long silence with no new tokens, force the turn done so a
  // dead/stalled stream can't hang the Stop button forever. It latches done so
  // the indicator can't flip back on from a stray late update.
  const armIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      doneRef.current = true;
      setIsGenerating(false);
    }, IDLE_TIMEOUT_MS);
  }, []);

  // Is the agent still actively producing a reply for the current turn?
  const detectGenerating = (msgs) => {
    if (!msgs || msgs.length === 0) return false;

    const RUNNING = ["pending", "in_progress", "running"];
    const last = msgs[msgs.length - 1];

    // If the last message is from the user, a reply is incoming.
    if (last.role === "user") return true;

    if (last.role === "assistant") {
      // NOTE: We intentionally do NOT declare "done" the instant the final
      // assistant message has text. During streaming the text arrives in chunks,
      // so a half-streamed sentence would wrongly look finished. The settle
      // logic in handleUpdate handles "text present" → waits for it to stop
      // changing before finishing. Here we only report whether BOB is clearly
      // still working (tools running, nothing settled).
      const hasText = typeof last.content === "string" && last.content.trim().length > 0;
      if (hasText) return true; // text is in flight — let the settle timer finish it

      // CRITICAL (awaiting-feedback fix): if ANY assistant message this turn has
      // already produced spoken text, BOB has effectively replied — treat the
      // turn as DONE even if a trailing tool-only / empty assistant message tails
      // it. This is checked BEFORE the running-tool check so a lingering
      // "in_progress" tool on the trailing message can't keep the Stop button up
      // after BOB has clearly answered and asked a question.
      const anAssistantSpoke = msgs.some(
        (m) => m.role === "assistant" && typeof m.content === "string" && m.content.trim().length > 0
      );
      if (anAssistantSpoke) return false;

      // Nothing said yet anywhere. Only now does a still-running tool on the last
      // message matter — BOB is mid-tool with nothing said, so we're working.
      const lastToolRunning = (last.tool_calls || []).some(
        (t) => t.status && RUNNING.includes(t.status)
      );
      if (lastToolRunning) return true;

      // Nothing said anywhere and last tools settled — only "working" if the
      // message status explicitly says so. A tool running on an EARLIER message
      // (but not the last) with no text yet also counts as still working.
      const status = last.status;
      if (status && RUNNING.includes(status)) return true;
      const anyToolRunning = msgs.some(
        (m) =>
          m.role === "assistant" &&
          (m.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status))
      );
      return anyToolRunning;
    }

    return false;
  };

  const handleUpdate = useCallback((data) => {
    let msgs = data.messages || [];

    // Keep the optimistic user bubble visible until the server list includes it.
    const pending = pendingUserRef.current;
    if (pending) {
      const serverHasIt = msgs.some(
        (m) => m.role === "user" && (m.content || "") === pending.content
      );
      if (serverHasIt) {
        pendingUserRef.current = null; // reconciled — drop the optimistic copy
      } else {
        // Not on the server list yet. The server may have ALREADY started
        // streaming BOB's assistant reply for this turn — if we blindly append
        // the pending user bubble to the end, it wrongly renders BELOW BOB's
        // reply ("BOB replies first, then your query pops in"). Instead, insert
        // the pending user message BEFORE any trailing assistant reply, so the
        // order is always: …prior history → your message → BOB's reply.
        let insertAt = msgs.length;
        while (insertAt > 0 && msgs[insertAt - 1].role === "assistant") insertAt--;
        msgs = [...msgs.slice(0, insertAt), pending, ...msgs.slice(insertAt)];
      }
    }
    setMessages(msgs);

    // Once a turn is latched done, ignore generating signals until next send.
    if (doneRef.current) {
      setIsGenerating(false);
      clearIdleTimer();
      clearSettleTimer();
      return;
    }

    const generating = detectGenerating(msgs);

    if (!generating) {
      // Reply finished (or nothing in flight) — latch done so stray late
      // updates for this turn can't bring the bubble back.
      finishTurn();
      return;
    }

    // Still working. Keep the indicator up.
    setIsGenerating(true);

    // SETTLE LOGIC: if BOB's final message has spoken text, we treat the turn as
    // finished only once that text STOPS changing for SETTLE_MS. Every time the
    // text grows (a new streamed chunk), we reset the settle timer — so the
    // "BOB finished" marker never appears on a half-streamed sentence.
    const last = msgs[msgs.length - 1];
    const lastHasText =
      last && last.role === "assistant" &&
      typeof last.content === "string" && last.content.trim().length > 0;

    if (lastHasText) {
      const text = last.content;
      if (text !== lastAssistantTextRef.current) {
        // Text changed → still streaming. Reset the settle countdown.
        lastAssistantTextRef.current = text;
        clearSettleTimer();
        settleTimerRef.current = setTimeout(() => finishTurn(), SETTLE_MS);
      }
      // If text is unchanged, the existing settle timer keeps running and will
      // finish the turn when it elapses.
    }

    // Re-arm watchdog only when content actually changed, so a stalled stream
    // (no new tokens) still times out and clears the indicator.
    const snapshot = JSON.stringify(msgs[msgs.length - 1] || {});
    if (snapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = snapshot;
      armIdleTimer();
    }
  }, [armIdleTimer, finishTurn]);

  const subscribe = useCallback(() => {
    if (!convId) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    unsubRef.current = base44.agents.subscribeToConversation(convId, handleUpdate);
  }, [convId, handleUpdate]);

  // Mobile browsers (Chrome/Safari on iOS & Android) suspend timers, sockets and
  // SSE connections when the tab is backgrounded, the screen locks, or the
  // network blips. When that happens the realtime subscription silently dies and
  // the chat appears to "freeze" until a manual refresh. To keep the chat alive
  // WITHOUT a page refresh, whenever the page becomes visible / regains focus /
  // the network comes back online, we re-fetch the latest conversation snapshot
  // and re-open the subscription.
  const resync = useCallback(async () => {
    if (!convId) return;
    try {
      const full = await base44.agents.getConversation(convId);
      if (full?.messages) handleUpdate({ messages: full.messages });
    } catch {
      // best-effort — the resubscribe below will catch up anyway
    }
    subscribe();
  }, [convId, handleUpdate, subscribe]);

  // (Re)subscribe whenever the conversation changes. Reset turn state for the
  // new conversation so we don't carry a stale generating indicator.
  useEffect(() => {
    doneRef.current = true;
    setIsGenerating(false);
    clearIdleTimer();
    clearSettleTimer();
    lastSnapshotRef.current = "";
    lastAssistantTextRef.current = "";
    pendingUserRef.current = null;
    subscribe();

    // Keep the live chat alive across mobile tab-suspend / lock / network drops.
    const onVisible = () => { if (document.visibilityState === "visible") resync(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", resync);
    window.addEventListener("online", resync);
    window.addEventListener("pageshow", resync); // iOS Safari bfcache restore

    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      clearIdleTimer();
      clearSettleTimer();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", resync);
      window.removeEventListener("online", resync);
      window.removeEventListener("pageshow", resync);
    };
  }, [subscribe, resync]);

  const stop = useCallback(() => {
    doneRef.current = true;
    clearIdleTimer();
    clearSettleTimer();
    setIsGenerating(false);
  }, []);

  // Call right after the user sends a message — opens a fresh turn.
  // Optionally pass the user message to show it instantly (optimistic), shown
  // until the server's stream confirms it.
  const onSent = useCallback((userMessage) => {
    doneRef.current = false;
    lastSnapshotRef.current = "";
    lastAssistantTextRef.current = "";
    clearSettleTimer();
    if (userMessage && (userMessage.content || "").trim()) {
      pendingUserRef.current = { role: "user", ...userMessage };
      setMessages((prev) => [...prev, pendingUserRef.current]);
    }
    setIsGenerating(true);
    armIdleTimer();
    if (!unsubRef.current) subscribe();
  }, [subscribe, armIdleTimer]);

  return { messages, setMessages, isGenerating, stop, onSent };
}