import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function RevenueTrendChart({ platformMetrics }) {
  // Build chart data ONLY from real platform metric snapshots — never synthesize.
  const sorted = [...platformMetrics].sort((a, b) => a.period?.localeCompare(b.period || "") || 0);
  const chartData = sorted.slice(-12).map(m => ({
    date: m.period ? m.period.slice(5) : "—",
    revenue: Math.round(m.total_revenue_usd || 0),
    payouts: Math.round(m.builder_payouts_usd || 0),
    subs: m.total_subscribers || 0,
  }));
  const hasData = chartData.length >= 2;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Revenue Trend</h3>
          <p className="text-[11px] text-slate-400">Builder payout vs gross revenue</p>
        </div>
      </div>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[220px] text-center text-slate-400">
          <TrendingUp className="w-7 h-7 mb-2 opacity-40" />
          <p className="text-xs">Revenue trends appear once monthly metric snapshots accumulate.</p>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v, name) => [`$${v}`, name === "revenue" ? "Gross Revenue" : "Your Payout"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
          <Area type="monotone" dataKey="payouts" stroke="#7c3aed" strokeWidth={2} fill="url(#payGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      )}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Gross Revenue
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />Your Payout (70%+)
        </div>
      </div>
    </div>
  );
}