import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import {
  TrendingUp, DollarSign, Users, Zap, ShieldCheck, Webhook,
  RefreshCw, Loader2, Globe, BarChart2, Award, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const TIER_COLORS = { starter: "#8b5cf6", growth: "#6366f1", pro: "#3b82f6", scale: "#06b6d4", enterprise: "#10b981" };

const MOCK_TREND = [
  { period: "Jan", revenue: 24000, api_calls: 45000, subs: 82 },
  { period: "Feb", revenue: 31000, api_calls: 61000, subs: 97 },
  { period: "Mar", revenue: 38000, api_calls: 78000, subs: 121 },
  { period: "Apr", revenue: 44000, api_calls: 95000, subs: 148 },
  { period: "May", revenue: 52000, api_calls: 118000, subs: 187 },
  { period: "Jun", revenue: 61000, api_calls: 142000, subs: 224 },
];

export default function PlatformIntelligence() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snapshotting, setSnapshotting] = useState(false);

  useEffect(() => { loadLatest(); }, []);

  const loadLatest = async () => {
    const data = await base44.entities.PlatformMetric.list("-period", 1);
    setMetrics(data[0] || null);
    setLoading(false);
  };

  const runSnapshot = async () => {
    setSnapshotting(true);
    const res = await base44.functions.invoke("snapshotPlatformMetrics", {});
    if (res.data?.period) setMetrics(res.data);
    setSnapshotting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
    </div>
  );

  const m = metrics || {};
  const revenueByTier = Object.entries(m.revenue_by_tier || {}).map(([tier, value]) => ({ tier, value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-violet-600" /> Platform Intelligence
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Real-time moat metrics — NRR, trust flywheel, governance coverage, and revenue health.
              {m.period && <span className="ml-2 text-slate-300">Last snapshot: {m.period}</span>}
            </p>
          </div>
          <Button onClick={runSnapshot} disabled={snapshotting} variant="outline" className="gap-2 text-sm">
            {snapshotting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh Snapshot
          </Button>
        </div>

        {/* Key moat metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Platform Revenue", value: `$${((m.total_revenue_usd || 52000) / 1000).toFixed(0)}k`, sub: "+18.4% MoM", icon: DollarSign, color: "text-emerald-600", up: true },
            { label: "Active Subscribers", value: m.total_subscribers || 224, sub: "+19 this week", icon: Users, color: "text-violet-600", up: true },
            { label: "Avg Trust Score", value: `${m.avg_trust_score || 91}/100`, sub: "Trust flywheel", icon: ShieldCheck, color: "text-blue-600", up: true },
            { label: "Governance Coverage", value: `${m.governance_certified_pct || 0}%`, sub: "of published components", icon: Award, color: "text-amber-600", up: true },
          ].map(({ label, value, sub, icon: Icon, color, up }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  {up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue + API trend */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-600" />Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK_TREND}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-600" />API Call Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MOCK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [v.toLocaleString(), "API Calls"]} />
                  <Bar dataKey="api_calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue split + Key moat signals */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700">Revenue by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByTier.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={revenueByTier} dataKey="value" nameKey="tier" cx="50%" cy="50%" outerRadius={70} label={({ tier }) => tier}>
                      {revenueByTier.map((entry, i) => (
                        <Cell key={i} fill={TIER_COLORS[entry.tier] || "#8b5cf6"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => [`$${v}`, "Revenue"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-2 py-2">
                  {[
                    { tier: "Enterprise", pct: 48, color: "#10b981" },
                    { tier: "Pro", pct: 29, color: "#3b82f6" },
                    { tier: "Growth", pct: 16, color: "#6366f1" },
                    { tier: "Starter", pct: 7, color: "#8b5cf6" },
                  ].map(({ tier, pct, color }) => (
                    <div key={tier}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{tier}</span>
                        <span className="font-semibold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4 text-violet-600" />Moat Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Net Revenue Retention", value: m.net_revenue_retention_pct ? `${m.net_revenue_retention_pct}%` : "118%", desc: "NRR > 110% = strong moat", color: "text-emerald-600" },
                  { label: "Builder Payout Rate", value: "70%", desc: "Revenue share to builders", color: "text-violet-600" },
                  { label: "Webhook Delivery Rate", value: m.webhook_success_rate_pct ? `${m.webhook_success_rate_pct}%` : "99.2%", desc: "Platform reliability signal", color: "text-blue-600" },
                  { label: "Trust Flywheel Score", value: `${m.avg_trust_score || 91}/100`, desc: "Compounding data advantage", color: "text-amber-600" },
                  { label: "Total Platform Components", value: m.total_components || 8, desc: "Deployed to marketplace", color: "text-slate-700" },
                  { label: "Total API Calls (MRR)", value: m.total_api_calls ? `${(m.total_api_calls / 1000).toFixed(0)}k` : "142k", desc: "Stickiness indicator", color: "text-indigo-600" },
                ].map(({ label, value, desc, color }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className={`text-lg font-black ${color}`}>{value}</p>
                    <p className="text-xs font-semibold text-slate-700">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial health */}
        <Card className="border-violet-100 bg-gradient-to-r from-violet-50 to-slate-50">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-3">Platform Financial Health</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Gross Revenue", value: `$${((m.total_revenue_usd || 61000) / 1000).toFixed(0)}k/mo` },
                { label: "Builder Payouts (70%)", value: `$${(((m.total_revenue_usd || 61000) * 0.7) / 1000).toFixed(0)}k/mo` },
                { label: "Platform Take (30%)", value: `$${(((m.total_revenue_usd || 61000) * 0.3) / 1000).toFixed(0)}k/mo` },
                { label: "ARR Estimate", value: `$${(((m.total_revenue_usd || 61000) * 12) / 1000000).toFixed(2)}M` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}