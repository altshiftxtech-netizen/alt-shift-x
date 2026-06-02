import React, { useState, useEffect } from "react";
import SharedNav from "@/components/SharedNav";
import { base44 } from "@/api/base44Client";
import { TierBadge, AchievementBadge } from "@/components/BuilderTierBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RefreshCw, DollarSign, Loader2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

export default function GamificationAdmin() {
  const [badges, setBadges] = useState([]);
  const [splits, setSplits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [splitLoading, setSplitLoading] = useState(false);
  const [splitPeriod, setSplitPeriod] = useState("");
  const [lastSplitResult, setLastSplitResult] = useState(null);
  const [expandedBuilder, setExpandedBuilder] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.BuilderBadge.list("-leaderboard_score", 200),
      base44.entities.RevenueSplit.list("-created_date", 200),
      base44.entities.User.list("-created_date", 500),
    ]).then(([b, s, u]) => {
      setBadges(b);
      setSplits(s);
      setUsers(u);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const userMap = {};
  for (const u of users) userMap[u.id] = u;

  const handleRecalc = async () => {
    setRecalcLoading(true);
    try {
      await base44.functions.invoke("computeBuilderBadges", {});
      await load();
    } catch (err) {
      console.error("Recalculate badges failed:", err);
      alert("Could not recalculate tiers & badges. Please try again.");
    } finally {
      setRecalcLoading(false);
    }
  };

  const handleRunSplits = async () => {
    setSplitLoading(true);
    try {
      const res = await base44.functions.invoke("processRevenueSplits", splitPeriod ? { period: splitPeriod } : {});
      setLastSplitResult(res.data);
      await load();
    } catch (err) {
      console.error("Run revenue splits failed:", err);
      alert("Could not run revenue splits. Please try again.");
    } finally {
      setSplitLoading(false);
    }
  };

  const totalPending = splits.filter(s => s.status === "pending").reduce((a, s) => a + (s.builder_payout || 0), 0);
  const totalPaid = splits.filter(s => s.status === "paid").reduce((a, s) => a + (s.builder_payout || 0), 0);

  const byTier = TIER_ORDER.reduce((acc, t) => { acc[t] = badges.filter(b => b.tier === t); return acc; }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-black text-slate-900">Gamification Admin</h1>
          </div>
          <p className="text-sm text-slate-500">Manage builder tiers, badges, and revenue splits.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIER_ORDER.map(t => (
            <Card key={t}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TierBadge tier={t} />
                </div>
                <div className="text-3xl font-black text-slate-900">{byTier[t].length}</div>
                <div className="text-xs text-slate-400">builders</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap gap-4">
          {/* Recalculate badges */}
          <Card className="flex-1 min-w-[280px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 text-violet-500" />Recalculate Tiers & Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-3">Re-scores all builders based on current installs, ratings, and governance data. Runs automatically nightly.</p>
              <Button onClick={handleRecalc} disabled={recalcLoading} className="gap-2 bg-violet-700 hover:bg-violet-800 text-white text-xs">
                {recalcLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Run Now
              </Button>
            </CardContent>
          </Card>

          {/* Revenue splits */}
          <Card className="flex-1 min-w-[280px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" />Run Revenue Splits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-3">Computes builder payouts by tier for a billing period. Defaults to previous month.</p>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="month"
                  value={splitPeriod}
                  onChange={e => setSplitPeriod(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <Button onClick={handleRunSplits} disabled={splitLoading} className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs">
                  {splitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
                  Process
                </Button>
              </div>
              {lastSplitResult && (
                <div className="text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 space-y-0.5">
                  <div className="font-bold text-emerald-800">Period: {lastSplitResult.period}</div>
                  <div className="text-emerald-700">Gross: ${(lastSplitResult.total_gross_revenue || 0).toLocaleString()}</div>
                  <div className="text-emerald-700">Builder payouts: ${(lastSplitResult.total_builder_payouts || 0).toLocaleString()}</div>
                  <div className="text-emerald-700">Platform: ${(lastSplitResult.total_platform_take || 0).toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout totals */}
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Payout Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-2xl font-black text-amber-700">${totalPending.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Pending payouts</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-700">${totalPaid.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Paid out</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Builder roster */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">All Builders — Current Tier & Badges</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            )}
            {!loading && badges.length === 0 && (
              <div className="text-center py-12 text-sm text-slate-400">No builder data yet. Click "Run Now" to compute tiers.</div>
            )}
            <div className="divide-y divide-slate-50">
              {badges.map(b => {
                const u = userMap[b.builder_id];
                const builderSplits = splits.filter(s => s.builder_id === b.builder_id);
                const isExpanded = expandedBuilder === b.builder_id;
                return (
                  <div key={b.builder_id}>
                    <button
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                      onClick={() => setExpandedBuilder(isExpanded ? null : b.builder_id)}
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                        {u?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                      </div>
                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{u?.full_name || b.builder_id}</div>
                        <div className="text-[10px] text-slate-400">{u?.email || ""}</div>
                      </div>
                      {/* Tier */}
                      <TierBadge tier={b.tier} />
                      {/* Achievement badges */}
                      <div className="hidden md:flex items-center gap-1">
                        {(b.badges_earned || []).map(k => <AchievementBadge key={k} badgeKey={k} />)}
                      </div>
                      {/* Rev share */}
                      <div className="text-xs font-bold text-emerald-700 shrink-0">{b.revenue_share_pct}%</div>
                      {/* Score */}
                      <div className="text-xs font-black text-amber-700 shrink-0 w-8 text-right">{b.leaderboard_score}</div>
                      {/* Expand */}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {[
                            { l: "Total Installs", v: b.total_installs },
                            { l: "Monthly Installs", v: b.monthly_installs },
                            { l: "Avg Rating", v: b.avg_rating ? `${b.avg_rating}★` : "—" },
                            { l: "Certified Components", v: `${b.certified_count} / ${b.component_count}` },
                          ].map(s => (
                            <div key={s.l} className="bg-white rounded-xl border border-slate-100 px-3 py-2 text-center">
                              <div className="text-sm font-bold text-slate-900">{s.v}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{s.l}</div>
                            </div>
                          ))}
                        </div>
                        {b.referral_code && (
                          <div className="text-[11px] text-slate-500 mb-3">Referral code: <code className="bg-slate-200 rounded px-1">{b.referral_code}</code></div>
                        )}
                        {builderSplits.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Revenue Splits</p>
                            <div className="space-y-1">
                              {builderSplits.slice(0, 5).map(s => (
                                <div key={s.id} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 rounded-lg px-3 py-1.5">
                                  <span className="text-slate-500">{s.period} · {s.component_name}</span>
                                  <span className="font-bold text-emerald-700">${(s.builder_payout || 0).toFixed(2)}</span>
                                  <span className={`font-semibold px-1.5 py-0.5 rounded-full text-[9px] uppercase ${s.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{s.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tier requirements reference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-500" />Tier Requirements & Revenue Share Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Tier", "Min Installs", "Min Rating", "Base Share", "Cert Bonus", "Volume Rebate", "Max Share"].map(h => (
                      <th key={h} className="text-left py-2 pr-4 text-slate-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { tier: "platinum", installs: "100+", rating: "4.8+", base: "70%", cert: "+10%", volume: "+5% >$50k/mo", max: "85%" },
                    { tier: "gold",     installs: "25+",  rating: "4.5+", base: "70%", cert: "+5%",  volume: "+2.5% >$10k/mo", max: "77%" },
                    { tier: "silver",   installs: "5+",   rating: "4.0+", base: "70%", cert: "+2%",  volume: "—", max: "72%" },
                    { tier: "bronze",   installs: "1+",   rating: "—",    base: "70%", cert: "—",    volume: "—", max: "70%" },
                  ].map(r => (
                    <tr key={r.tier}>
                      <td className="py-2.5 pr-4"><TierBadge tier={r.tier} /></td>
                      <td className="py-2.5 pr-4 text-slate-600">{r.installs}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{r.rating}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{r.base}</td>
                      <td className="py-2.5 pr-4 text-emerald-700 font-semibold">{r.cert}</td>
                      <td className="py-2.5 pr-4 text-blue-700">{r.volume}</td>
                      <td className="py-2.5 font-black text-emerald-700">{r.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}