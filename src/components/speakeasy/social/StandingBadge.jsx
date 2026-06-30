import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEVEL_COLOR = {
  Newcomer: "#9CA0A8",
  Regular: "#8B6FB8",
  Contributor: "#4169e1",
  Pillar: "#C8A95B",
  Luminary: "#e0719c",
};

/**
 * A compact participation-standing badge that can be dropped anywhere across
 * the app to carry a member's Speakeasy standing with them. Loads its own
 * score if one isn't passed in.
 */
export default function StandingBadge({ score: scoreProp, className = "" }) {
  const [score, setScore] = useState(scoreProp || null);

  useEffect(() => {
    if (scoreProp) { setScore(scoreProp); return; }
    (async () => {
      try {
        const user = await base44.auth.me();
        const rows = await base44.entities.ParticipationScore.filter({ user_id: user.id });
        if (rows[0]) setScore(rows[0]);
      } catch { /* not signed in / no score yet */ }
    })();
  }, [scoreProp]);

  if (!score || !score.level) return null;
  const color = LEVEL_COLOR[score.level] || "#C8A95B";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
      style={{ background: `${color}1f`, border: `1px solid ${color}55`, color }}>
      <Award className="w-3 h-3" />
      {score.level}
      <span className="opacity-70">· {(score.points || 0).toLocaleString()}</span>
    </span>
  );
}