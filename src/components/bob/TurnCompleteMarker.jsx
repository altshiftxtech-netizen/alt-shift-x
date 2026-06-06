import { CheckCircle2, MessageCircleQuestion } from "lucide-react";

// A clear, always-visible "this turn is finished" marker shown under BOB's last
// reply. Independent of any sound/timing logic so the user can NEVER be left
// unsure whether BOB is done. If BOB's reply ends with a question / asks for
// feedback, we say so explicitly.
export default function TurnCompleteMarker({ lastMessage }) {
  const text = (lastMessage?.content || "").trim();
  if (!text) return null;

  // Never show "your turn" if BOB's last message still has a running/pending
  // tool call — that means BOB hasn't actually finished yet.
  const RUNNING = ["pending", "in_progress", "running"];
  const hasRunningTool = (lastMessage?.tool_calls || []).some(
    (t) => t.status && RUNNING.includes(t.status)
  );
  if (hasRunningTool) return null;

  const lower = text.toLowerCase();
  const isAsking =
    /\?\s*$/.test(text) ||
    /\b(let me know|how (would|do) you|which|would you like|should i|tell me|what.s next|say "?go"?)\b/i.test(lower);

  return (
    <div className="flex items-center gap-2 pl-10 pt-0.5">
      {isAsking ? (
        <>
          <MessageCircleQuestion className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-amber-300">
            BOB is waiting on your answer — reply below.
          </span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-emerald-300">
            BOB finished — your turn.
          </span>
        </>
      )}
    </div>
  );
}