import React, { useState, useEffect } from "react";
import { Trophy, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MEDAL = ["🥇", "🥈", "🥉"];

/**
 * A gentle "most generous & active members" board — recognition, not a ranked
 * competition leaderboard. Ordered by participation points, top 5 only.
 */
export default function CommunityHighlights() {
  const [top, setTop] = useState([]);

  useEffect(() => {
    base44.entities.ParticipationScore.list("-points", 5).then(setTop).catch(() => {});
  }, []);

  if (top.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 text-center">
        <Sparkles className="w-5 h-5 text-[#C8A95B] mx-auto mb-2" />
        <p className="text-xs text-[#9CA0A8]">Be the first to shape this room.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-[#C8A95B]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B]">Pillars of the Room</p>
      </div>
      <div className="space-y-2">
        {top.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2.5">
            <span className="w-5 text-center text-sm">{MEDAL[i] || <span className="text-[#6B6F76] text-xs">{i + 1}</span>}</span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D9DCE1]/30 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {(m.user_name || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{m.user_name || "Member"}</p>
              <p className="text-[9px] text-[#9CA0A8]">{m.level}</p>
            </div>
            <span className="text-xs font-bold text-[#C8A95B]">{(m.points || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}