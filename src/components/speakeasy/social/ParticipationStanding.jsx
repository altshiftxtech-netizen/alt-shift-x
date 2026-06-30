import React from "react";
import { Award, Heart, MessageSquare, PenLine } from "lucide-react";

const LEVELS = ["Newcomer", "Regular", "Contributor", "Pillar", "Luminary"];
const NEXT_AT = { Newcomer: 40, Regular: 150, Contributor: 400, Pillar: 1000, Luminary: null };

/**
 * Wholesome standing card — celebrates genuine participation without streaks,
 * countdowns, or FOMO. Shows the member's level, points, and a gentle progress
 * bar toward the next recognition tier.
 */
export default function ParticipationStanding({ score }) {
  if (!score) return null;
  const points = score.points || 0;
  const level = score.level || "Newcomer";
  const nextAt = NEXT_AT[level];
  const levelIdx = LEVELS.indexOf(level);
  const prevAt = levelIdx > 0 ? NEXT_AT[LEVELS[levelIdx - 1]] : 0;
  const pct = nextAt ? Math.min(100, Math.round(((points - prevAt) / (nextAt - prevAt)) * 100)) : 100;

  return (
    <div className="rounded-2xl border border-[#C8A95B]/20 bg-gradient-to-b from-[#C8A95B]/[0.08] to-transparent backdrop-blur-xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9DCE1] to-[#C8A95B] flex items-center justify-center">
          <Award className="w-4 h-4 text-[#0A0A0C]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B]">Your Standing</p>
          <p className="text-sm font-bold text-white leading-none mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>{level}</p>
        </div>
        <span className="ml-auto text-sm font-bold text-[#C8A95B]">{points.toLocaleString()} <span className="text-[10px] text-[#9CA0A8] font-normal">pts</span></span>
      </div>

      {nextAt ? (
        <>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-[#9CA0A8] mt-1.5">{nextAt - points} pts to {LEVELS[levelIdx + 1]}</p>
        </>
      ) : (
        <p className="text-[10px] text-[#C8A95B]">You've reached the highest standing. Thank you for shaping this room. 🥂</p>
      )}

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
        <Stat icon={PenLine} label="Posts" value={score.posts_count || 0} />
        <Stat icon={MessageSquare} label="Replies" value={score.thoughtful_replies_count || 0} />
        <Stat icon={Heart} label="Given" value={score.appreciations_given || 0} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <Icon className="w-3.5 h-3.5 text-[#9CA0A8] mx-auto mb-1" />
      <p className="text-sm font-bold text-white leading-none">{value}</p>
      <p className="text-[9px] text-[#6B6F76] mt-0.5">{label}</p>
    </div>
  );
}