import { useState, useEffect, useCallback } from "react";

// SOVEREIGN SESSION HANDOFF — <new session> trigger
// When the user types <new session>, BOB is asked to produce a CONTINUITY BRIEF
// (optionally asking clarifying questions first). Once the brief is detected
// (wrapped in [[CONTINUITY_BRIEF]] markers), the user clicks "Start Fresh
// Session" — the board wipes and a new conversation launches seeded with the
// brief, so full continuity is preserved across the session boundary.

const HANDOFF_PROMPT = `SOVEREIGN SESSION HANDOFF INITIATED.

The user typed <new session>. This is a controlled session transition for high-tier batch operations where ARR exposure can cross the $100M threshold.

YOUR JOB: Produce a CONTINUITY BRIEF that will seed the next fresh session so nothing critical is lost.

1. Review everything in this session — key decisions, component codes, framework settings, pricing, ARR context, open tasks, builder identity, and anything critical to carry forward.
2. If you need clarification on what to preserve, ask 1-2 focused questions. Do NOT produce the brief yet — just ask.
3. Once you have enough context, produce the brief wrapped in these EXACT markers:

[[CONTINUITY_BRIEF]]
<the full continuity brief — everything the next session needs to pick up exactly where this one left off>
[[/CONTINUITY_BRIEF]]

After the closing marker, tell the user: "Continuity brief locked. Click 'Start Fresh Session' to wipe the board and continue in a fresh session."

This is a forensic handoff — nothing critical can be lost. Be thorough but concise.`;

const BRIEF_REGEX = /\[\[CONTINUITY_BRIEF\]\]([\s\S]*?)\[\[\/CONTINUITY_BRIEF\]\]/;
const TRIGGER_REGEX = /^<\s*new\s+session\s*>([\s\S]*)$/i;

export function useSessionHandoff({ messages }) {
  const [handoffBrief, setHandoffBrief] = useState(null);
  const [handoffPending, setHandoffPending] = useState(false);

  // Scan the latest assistant message for the continuity brief marker.
  useEffect(() => {
    if (!handoffPending) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const content = typeof last.content === "string" ? last.content : "";
    const match = content.match(BRIEF_REGEX);
    if (match && match[1].trim()) {
      setHandoffBrief(match[1].trim());
      setHandoffPending(false);
    }
  }, [messages, handoffPending]);

  // Returns true if the message was a <new session> trigger (and thus consumed).
  const checkHandoffTrigger = useCallback(async (msg, dispatch) => {
    const m = msg.match(TRIGGER_REGEX);
    if (!m) return false;
    const direction = m[1].trim();
    setHandoffBrief(null);
    setHandoffPending(true);
    const prompt = direction
      ? `${HANDOFF_PROMPT}\n\nUSER DIRECTION FOR THE HANDOFF:\n${direction}`
      : HANDOFF_PROMPT;
    await dispatch(prompt);
    return true;
  }, []);

  // Wipe the board and launch a fresh session seeded with the continuity brief.
  const startFreshWithBrief = useCallback(async (launch) => {
    const brief = handoffBrief;
    if (!brief) return;
    setHandoffBrief(null);
    setHandoffPending(false);
    const seed =
      `CONTINUITY FROM PREVIOUS SESSION — SOVEREIGN HANDOFF\n\n` +
      `The previous session was bit-stamped and wiped. Here is the continuity brief carrying forward all critical context:\n\n` +
      `${brief}\n\n` +
      `You are now in a fresh session. Pick up exactly where the previous session left off. ` +
      `Acknowledge the continuity and ask what the user wants to work on next.`;
    await launch(seed);
  }, [handoffBrief]);

  const clearHandoff = useCallback(() => {
    setHandoffBrief(null);
    setHandoffPending(false);
  }, []);

  return { handoffBrief, handoffPending, checkHandoffTrigger, startFreshWithBrief, clearHandoff };
}