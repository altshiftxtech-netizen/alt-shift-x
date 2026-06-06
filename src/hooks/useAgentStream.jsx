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
const IDLE_TIMEOUT_MS = 15000;

export default function useAgentStream(convId, initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const unsubRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastSnapshotRef = useRef("");
  const doneRef = useRef(true); // latched "this turn is finished"
  // Optimistic user message shown instantly on send. Kept until the server's
  // message list actually contains it, so the stream can't wipe it mid-race.
  const pendingUserRef = useRef(null);

  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };

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
      // The turn is DONE the moment BOB's FINAL message has spoken text —
      // whether that's a real answer or a question awaiting feedback. This wins
      // over any lingering/stale tool status elsewhere in the tail, so a stuck
      // "in_progress" tool from an earlier step can never hang the Stop button
      // after BOB has clearly replied. (This is the awaiting-feedback case.)
      const hasText = typeof last.content === "string" && last.content.trim().length > 0;
      if (hasText) return false;

      // Last assistant message has NO text. Only now does a still-running tool
      // matter — BOB is mid-tool with nothing said yet, so we're working.
      const lastToolRunning = (last.tool_calls || []).some(
        (t) => t.status && RUNNING.includes(t.status)
      );
      if (lastToolRunning) return true;

      // No text on the last message and its tools are settled. If ANY earlier
      // assistant message already produced text, BOB has effectively replied —
      // treat as done so a trailing tool-only message can't hang the indicator.
      const anAssistantSpoke = msgs.some(
        (m) => m.role === "assistant" && typeof m.content === "string" && m.content.trim().length > 0
      );
      if (anAssistantSpoke) return false;

      // Nothing said anywhere yet and last tools settled — only "working" if the
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
        msgs = [...msgs, pending]; // not there yet — append so it doesn't vanish
      }
    }
    setMessages(msgs);

    // Once a turn is latched done, ignore generating signals until next send.
    if (doneRef.current) {
      setIsGenerating(false);
      clearIdleTimer();
      return;
    }

    const generating = detectGenerating(msgs);

    if (!generating) {
      // Reply finished (or nothing in flight) — latch done so stray late
      // updates for this turn can't bring the bubble back.
      doneRef.current = true;
      setIsGenerating(false);
      clearIdleTimer();
      return;
    }

    setIsGenerating(true);
    // Re-arm watchdog only when content actually changed, so a stalled stream
    // (no new tokens) still times out and clears the indicator.
    const snapshot = JSON.stringify(msgs[msgs.length - 1] || {});
    if (snapshot !== lastSnapshotRef.current) {
      lastSnapshotRef.current = snapshot;
      armIdleTimer();
    }
  }, [armIdleTimer]);

  const subscribe = useCallback(() => {
    if (!convId) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    unsubRef.current = base44.agents.subscribeToConversation(convId, handleUpdate);
  }, [convId, handleUpdate]);

  // (Re)subscribe whenever the conversation changes. Reset turn state for the
  // new conversation so we don't carry a stale generating indicator.
  useEffect(() => {
    doneRef.current = true;
    setIsGenerating(false);
    clearIdleTimer();
    lastSnapshotRef.current = "";
    pendingUserRef.current = null;
    subscribe();
    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      clearIdleTimer();
    };
  }, [subscribe]);

  const stop = useCallback(() => {
    doneRef.current = true;
    clearIdleTimer();
    setIsGenerating(false);
  }, []);

  // Call right after the user sends a message — opens a fresh turn.
  // Optionally pass the user message to show it instantly (optimistic), shown
  // until the server's stream confirms it.
  const onSent = useCallback((userMessage) => {
    doneRef.current = false;
    lastSnapshotRef.current = "";
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