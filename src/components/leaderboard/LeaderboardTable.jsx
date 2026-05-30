import React, { useMemo, useState } from "react";
import { ShieldCheck, Trophy, Star, Medal } from "lucide-react";
import { TierBadge, AchievementBadge } from "@/components/BuilderTierBadge";

const RANK_STYLES = [
  "bg-amber-50 border-amber-300 text-amber-700",    // 1st
  "bg-slate-100 border-slate-300 text-slate-600",   // 2nd
  "bg-orange-50 border-orange-300 text-orange-700", // 3rd
];

const RANK_ICONS = [Trophy, Medal, Star];

export default function LeaderboardTable({ components, installedData, govScores, users, builderBadges = [] }) {
  const badgeMap = useMemo(() => {
    const m = {};
    for (const b of builderBadges) m[b.builder_id] = b;
    return m;
  }, [builderBadges]);
  const [sortBy, setSortBy] = useState("score");

  const userMap = useMemo(() => {
    const m = {};
    for (const u of users) m[u.id] = u;
    return m;
  }, [users]);

  const govMap = useMemo(() => {
    const m = {};
    for (const g of govScores) m[g.component_id] = g;
    return m;
  }, [govScores]);

  // Aggregate by builder
  const builderRows = useMemo(() => {
    const map = {};
    for (const comp of components.filter(c => c.status === "published")) {
      if (!map[comp.builder_id]) {
        map[comp.builder_id] = {
          builder_id: comp.builder_id,
          components: [],
          total_installs: 0,
          total_calls: 0,
          total_revenue: 0,
          avg_trust: 0,
          certified_count: 0,
        };
      }
      const installs = installedData.filter(i => i.component_id === comp.id);
      const calls = installs.reduce((s, i) => s + (i.calls_this_month || 0), 0);
      const revenue = (comp.price || 0) * installs.length;
      const gov = govMap[comp.id];

      map[comp.builder_id].components.push(comp.name);
      map[comp.builder_id].total_installs += installs.length;
      map[comp.builder_id].total_calls += calls;
      map[comp.builder_id].total_revenue += revenue;
      map[comp.builder_id].avg_trust += comp.trust_score || 0;
      if (gov?.certification_status === "certified") map[comp.builder_id].certified_count++;
    }

    return Object.values(map).map(b => {
      const count = b.components.length;
      b.avg_trust = count ? Math.round(b.avg_trust / count) : 0;
      // Composite leaderboard score: installs (40%) + revenue (30%) + trust (20%) + certification (10%)
      const maxInstalls = 100, maxRevenue = 5000, maxTrust = 100;
      b.leaderboard_score = Math.round(
        (Math.min(b.total_installs / maxInstalls, 1) * 40) +
        (Math.min(b.total_revenue / maxRevenue, 1) * 30) +
        ((b.avg_trust / maxTrust) * 20) +
        ((b.certified_count / Math.max(count, 1)) * 10)
      );
      b.component_count = count;
      b.builder = userMap[b.builder_id];
      return b;
    });
  }, [components, installedData, govMap, userMap]);

  const sorted = useMemo(() => {
    const copy = [...builderRows];
    if (sortBy === "score") return copy.sort((a, b) => b.leaderboard_score - a.leaderboard_score);
    if (sortBy === "revenue") return copy.sort((a, b) => b.total_revenue - a.total_revenue);
    if (sortBy === "installs") return copy.sort((a, b) => b.total_installs - a.total_installs);
    if (sortBy === "trust") return copy.sort((a, b) => b.avg_trust - a.avg_trust);
    return copy;
  }, [builderRows, sortBy]);

  const tabs = [
    { key: "score", label: "Overall Score" },
    { key: "revenue", label: "Revenue" },
    { key: "installs", label: "Installs" },
    { key: "trust", label: "Trust" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-900">Builder Rankings</h3>
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => setSortBy(t.key)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${sortBy === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            No published components found. Publish a component to appear on the leaderboard.
          </div>
        )}
        {sorted.map((row, idx) => {
          const RankIcon = RANK_ICONS[idx] || null;
          const rankStyle = RANK_STYLES[idx] || "bg-slate-50 border-slate-200 text-slate-500";
          const initials = row.builder?.full_name
            ? row.builder.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
            : row.builder_id.slice(0, 2).toUpperCase();

          return (
            <div key={row.builder_id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              {/* Rank badge */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 ${rankStyle}`}>
                {RankIcon && idx < 3 ? <RankIcon className="w-3.5 h-3.5" /> : `#${idx + 1}`}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                {initials}
              </div>

              {/* Name + components */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 truncate">
                    {row.builder?.full_name || `Builder ${row.builder_id.slice(0, 6)}`}
                  </span>
                  {badgeMap[row.builder_id]?.tier && <TierBadge tier={badgeMap[row.builder_id].tier} />}
                </div>
                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                  {(badgeMap[row.builder_id]?.badges_earned || []).map(k => <AchievementBadge key={k} badgeKey={k} />)}
                  {!(badgeMap[row.builder_id]?.badges_earned?.length) && (
                    <span className="text-[10px] text-slate-400">
                      {row.component_count} component{row.component_count !== 1 ? "s" : ""} — {row.components.slice(0, 2).join(", ")}{row.components.length > 2 ? ` +${row.components.length - 2}` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-5 shrink-0 text-center">
                <div>
                  <div className="text-sm font-bold text-emerald-700">${row.total_revenue.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Revenue</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-700">{row.total_installs}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Installs</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{row.avg_trust}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Trust</div>
                </div>
                <div className="flex items-center gap-1">
                  {row.certified_count > 0 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                  <div>
                    <div className="text-sm font-black text-amber-700">{row.leaderboard_score}</div>
                    <div className="text-[9px] text-slate-400 uppercase">Score</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}