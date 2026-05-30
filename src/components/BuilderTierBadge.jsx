import React from "react";
import { ShieldCheck, Star, Flame, Crown } from "lucide-react";

const TIERS = {
  bronze: {
    label: "Bronze Builder",
    icon: Star,
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    iconColor: "text-orange-500",
    dot: "bg-orange-400",
    req: "1+ component",
  },
  silver: {
    label: "Silver Builder",
    icon: ShieldCheck,
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-600",
    iconColor: "text-slate-500",
    dot: "bg-slate-400",
    req: "5+ installs · 4.0+ rating",
  },
  gold: {
    label: "Gold Builder",
    icon: Flame,
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    iconColor: "text-amber-500",
    dot: "bg-amber-400",
    req: "25+ installs · 4.5+ rating",
  },
  platinum: {
    label: "Platinum Builder",
    icon: Crown,
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-700",
    iconColor: "text-violet-500",
    dot: "bg-violet-500",
    req: "100+ installs · 4.8+ rating",
  },
};

const ACHIEVEMENT_BADGES = {
  top_seller:      { emoji: "💰", label: "Top Seller" },
  speed_builder:   { emoji: "⚡", label: "Speed Builder" },
  trust_champion:  { emoji: "🛡️", label: "Trust Champion" },
  governance_ace:  { emoji: "✅", label: "Governance Ace" },
  trending:        { emoji: "🔥", label: "Trending" },
};

export function TierBadge({ tier = "bronze", size = "sm" }) {
  const t = TIERS[tier] || TIERS.bronze;
  const Icon = t.icon;
  const isLg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-1 border font-bold rounded-full ${t.bg} ${t.border} ${t.text} ${isLg ? "text-xs px-3 py-1.5" : "text-[10px] px-2 py-0.5"}`}>
      <Icon className={`${isLg ? "w-3.5 h-3.5" : "w-3 h-3"} ${t.iconColor}`} />
      {t.label}
    </span>
  );
}

export function AchievementBadge({ badgeKey }) {
  const b = ACHIEVEMENT_BADGES[badgeKey];
  if (!b) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 rounded-full px-2 py-0.5">
      <span>{b.emoji}</span>{b.label}
    </span>
  );
}

export function BuilderTierCard({ badgeData }) {
  const tier = badgeData?.tier || "bronze";
  const t = TIERS[tier] || TIERS.bronze;
  const Icon = t.icon;

  return (
    <div className={`rounded-2xl border-2 p-5 ${t.bg} ${t.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white border ${t.border}`}>
          <Icon className={`w-5 h-5 ${t.iconColor}`} />
        </div>
        <div>
          <div className={`text-base font-black ${t.text}`}>{t.label}</div>
          <div className="text-[10px] text-slate-400">{t.req}</div>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-2xl font-black ${t.text}`}>{badgeData?.revenue_share_pct || 70}%</div>
          <div className="text-[10px] text-slate-400">rev share</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: "Installs", val: badgeData?.total_installs || 0 },
          { label: "Avg Rating", val: badgeData?.avg_rating ? `${badgeData.avg_rating}★` : "—" },
          { label: "Score", val: badgeData?.leaderboard_score || 0 },
        ].map(s => (
          <div key={s.label} className="bg-white/60 rounded-lg px-2 py-1.5 text-center">
            <div className={`text-sm font-black ${t.text}`}>{s.val}</div>
            <div className="text-[9px] text-slate-400 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {(badgeData?.badges_earned || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {(badgeData.badges_earned || []).map(b => <AchievementBadge key={b} badgeKey={b} />)}
        </div>
      )}
    </div>
  );
}

export default TIERS;