import React, { useState, useEffect } from "react";
import { Sunrise, PenLine, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * A gentle weekly recap — "here's the good you brought to the room this week."
 * Counts the member's posts and replies over the last 7 days. No streaks, no
 * pressure; just a warm reflection. Hidden when there's been no activity.
 */
export default function WeeklyRecap({ score }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString();
        const mine = await base44.entities.SpeakeasyPost.filter({ author_id: user.id }, "-created_date", 200);
        const recent = (mine || []).filter((p) => (p.created_date || "") >= weekAgo);
        const posts = recent.filter((p) => !p.parent_id).length;
        const replies = recent.filter((p) => p.parent_id).length;
        setStats({ posts, replies });
      } catch { setStats(null); }
    })();
  }, [score?.points]);

  if (!stats || (stats.posts === 0 && stats.replies === 0)) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#8B6FB8]/[0.08] to-transparent backdrop-blur-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sunrise className="w-4 h-4 text-[#C8A95B]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B]">This Week in the Room</p>
      </div>
      <p className="text-xs text-[#D2D5DA] leading-relaxed mb-3">
        You brought real presence this week — thank you for showing up. 🥂
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
          <PenLine className="w-4 h-4 text-[#9CA0A8] mx-auto mb-1" />
          <p className="text-lg font-bold text-white leading-none">{stats.posts}</p>
          <p className="text-[10px] text-[#6B6F76] mt-1">posts shared</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
          <MessageSquare className="w-4 h-4 text-[#9CA0A8] mx-auto mb-1" />
          <p className="text-lg font-bold text-white leading-none">{stats.replies}</p>
          <p className="text-[10px] text-[#6B6F76] mt-1">replies given</p>
        </div>
      </div>
    </div>
  );
}