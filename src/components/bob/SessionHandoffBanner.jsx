import React from "react";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

// Shows a "Continuity Brief Locked" banner when the brief is ready, or a
// "handoff in progress" hint while BOB is asking questions / producing the brief.
export default function SessionHandoffBanner({ handoffBrief, handoffPending, onStartFresh }) {
  if (handoffBrief) {
    return (
      <div className="rounded-xl border border-[#E6C878]/40 bg-[#E6C878]/10 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-[#E6C878] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#E6C878]">Continuity Brief Locked</p>
            <p className="text-[10px] text-white/50 truncate">Wipe the board and continue in a fresh session with full continuity.</p>
          </div>
        </div>
        <button
          onClick={onStartFresh}
          className="flex items-center gap-1.5 bg-[#E6C878] hover:bg-[#D4B668] text-[#05060a] text-xs font-bold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          Start Fresh Session <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
  if (handoffPending) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-[#E6C878]/80 px-1">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span>Session handoff in progress — answer BOB's questions or give direction. The continuity brief will lock when ready.</span>
      </div>
    );
  }
  return null;
}