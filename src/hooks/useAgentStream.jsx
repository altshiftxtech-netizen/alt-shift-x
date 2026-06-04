import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useAgentStream — shared streaming + stop control for any platform bot.
 *
 * Subscribes to an agent conversation and exposes:
 *  - messages: live message list
 *  - isGenerating: true while the agent is actively producing a reply
 *  - stop(): halts the local stream — unsubscribes so incoming tokens are
 *    ignored, freezes the last assistant message as-is, and clears the
 *    generating indicator. A fresh subscription is re-armed on the next
 *    conversation change / user send.
 *  - onSent(): call right after you addMessage() so the hook knows a reply
 *    is incoming and re-arms the subscription if it was stopped.
 */
// If no new streaming update arrives within this window, we assume the agent
// finished (or the stream died) and clear the "generating" indicator so the
// Stop button reverts to Send.
const IDLE_TIMEOUT_MS = 4000;

export default function useAgentStream(convId, initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const unsubRef = useRef(null);
  const stoppedRef = useRef(false);
  const idleTimerRef = useRef(null);
  const lastSnapshotRef = useRef("");

  const clearIdleTimer = () => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
  };

  // Arm a watchdog: if no further update comes in, force-stop the generating state.
  const armIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      setIsGenerating(false);
    }, IDLE_TIMEOUT_MS);
  }, []);

  const detectGenerating = (msgs) => {
    if (!msgs || msgs.length === 0) return false;
    const last = msgs[msgs.length - 1];
    if (last.role === "assistant") {
      const tcRunning = (last.tool_calls || []).some(
        (t) => t.status && ["pending", "in_progress", "running"].includes(t.status)
      );
      // A tool is actively running → still generating.
      if (tcRunning) return true;
      // If the assistant has already produced text and no tool is running, the
      // reply is DONE — ignore a lingering message-level status flag that some
      // streams leave set after the final token (the cause of the "stuck" Stop).
      const hasText = typeof last.content === "string" && last.content.trim().length > 0;
      if (hasText) return false;
      // No text yet and no running tool, but status says it's still working.
      const status = last.status;
      return !!(status && ["pending", "in_progress", "running"].includes(status));
    }
    // Last message is from the user → a reply is incoming.
    return last.role === "user";
  };

  const subscribe = useCallback(() => {
    if (!convId) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    stoppedRef.current = false;
    unsubRef.current = base44.agents.subscribeToConversation(convId, (data) => {
      if (stoppedRef.current) return; // ignore tokens after Stop
      const msgs = data.messages || [];
      setMessages(msgs);
      const generating = detectGenerating(msgs);
      setIsGenerating(generating);
      if (generating) {
        // Reset the watchdog only when content actually changed, so a stalled
        // stream (no new tokens) still times out.
        const snapshot = JSON.stringify(msgs[msgs.length - 1] || {});
        if (snapshot !== lastSnapshotRef.current) {
          lastSnapshotRef.current = snapshot;
          armIdleTimer();
        }
      } else {
        clearIdleTimer();
      }
    });
  }, [convId, armIdleTimer]);

  useEffect(() => {
    subscribe();
    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      clearIdleTimer();
    };
  }, [subscribe]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    clearIdleTimer();
    setIsGenerating(false);
  }, []);

  // Re-arm the subscription after the user sends a new message.
  const onSent = useCallback(() => {
    setIsGenerating(true);
    lastSnapshotRef.current = "";
    armIdleTimer();
    if (stoppedRef.current || !unsubRef.current) subscribe();
  }, [subscribe, armIdleTimer]);

  return { messages, setMessages, isGenerating, stop, onSent };
}