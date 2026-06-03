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
export default function useAgentStream(convId, initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [isGenerating, setIsGenerating] = useState(false);
  const unsubRef = useRef(null);
  const stoppedRef = useRef(false);

  const detectGenerating = (msgs) => {
    if (!msgs || msgs.length === 0) return false;
    const last = msgs[msgs.length - 1];
    // Agent is mid-reply if the last message is an assistant message that's
    // still streaming (status pending/in_progress) or has pending tool calls.
    if (last.role !== "assistant") return last.role === "user"; // user just sent → awaiting reply
    const status = last.status;
    if (status && ["pending", "in_progress", "running"].includes(status)) return true;
    const tcRunning = (last.tool_calls || []).some(
      (t) => t.status && ["pending", "in_progress", "running"].includes(t.status)
    );
    return tcRunning;
  };

  const subscribe = useCallback(() => {
    if (!convId) return;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    stoppedRef.current = false;
    unsubRef.current = base44.agents.subscribeToConversation(convId, (data) => {
      if (stoppedRef.current) return; // ignore tokens after Stop
      setMessages(data.messages || []);
      setIsGenerating(detectGenerating(data.messages || []));
    });
  }, [convId]);

  useEffect(() => {
    subscribe();
    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } };
  }, [subscribe]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    setIsGenerating(false);
  }, []);

  // Re-arm the subscription after the user sends a new message.
  const onSent = useCallback(() => {
    setIsGenerating(true);
    if (stoppedRef.current || !unsubRef.current) subscribe();
  }, [subscribe]);

  return { messages, setMessages, isGenerating, stop, onSent };
}