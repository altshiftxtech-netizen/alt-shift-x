import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, RefreshCw, TrendingUp, DollarSign, Wallet, CreditCard,
  Package, ArrowUpRight, ArrowDownRight, ExternalLink, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import { base44 } from "@/api/base44Client";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1PVGiMsONomYCNnzFgRuiHbUOQsyF3nSZnK9L9Tz3jmg/edit";

const usd = (n) =>
  `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const usd2 = (n) =>
  `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PIE_COLORS = ["#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706"];
const EXPENSE_COLORS = ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#0891b2"];

function KpiCard({ icon: Icon, label, value, sub, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl ${tones[tone]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        </div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function FinanceAnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("financeDashboardData", {});
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.message || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <p className="text-xs text-slate-400">Pulling financial data from Google Sheets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-10 text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Couldn't load finance data</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <Button onClick={load} variant="outline" className="text-xs h-8 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const k = data.kpis || {};
  const netPositive = (k.netCashflow || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Financial Analytics</p>
          <p className="text-xs text-slate-400">Live from the Operations &amp; Finance workbook</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={SHEET_URL} target="_blank" rel="noreferrer">
            <Button variant="outline" className="text-xs h-8 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Open Sheet
            </Button>
          </a>
          <Button onClick={load} variant="outline" className="text-xs h-8 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Total MRR" value={usd(k.totalMRR)} sub="Monthly recurring" tone="violet" />
        <KpiCard icon={TrendingUp} label="Projected ARR" value={usd(k.arr)} sub="MRR × 12" tone="emerald" />
        <KpiCard
          icon={netPositive ? ArrowUpRight : ArrowDownRight}
          label="Net Cashflow"
          value={usd(k.netCashflow)}
          sub="This month"
          tone={netPositive ? "emerald" : "amber"}
        />
        <KpiCard icon={CreditCard} label="Active Subs" value={(k.activeSubs || 0).toLocaleString()} sub={`Avg ${usd2(k.avgSubValue)}`} tone="blue" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Wallet} label="Cash In" value={usd(k.cashIn)} tone="emerald" />
        <KpiCard icon={Wallet} label="Cash Out" value={usd(k.cashOut)} tone="amber" />
        <KpiCard icon={Package} label="Published" value={(k.publishedComponents || 0).toLocaleString()} sub={`${(k.totalInstalls || 0).toLocaleString()} installs`} tone="slate" />
        <KpiCard icon={DollarSign} label="Rev / Install" value={usd2(k.avgRevPerInstall)} sub="Average" tone="violet" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Cashflow" subtitle="Cash in, out, and net this month">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.cashflow} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={usd} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => usd2(v)} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {data.cashflow.map((entry, i) => (
                  <Cell key={i} fill={entry.amount >= 0 ? (entry.name === "Cash Out" ? "#f59e0b" : "#10b981") : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Mix" subtitle="MRR by source">
          {data.revenueMix && data.revenueMix.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.revenueMix}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.revenueMix.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => usd2(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs text-slate-400">No revenue data yet</div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Expense Breakdown" subtitle="Cash-out lines from the Cashflow sheet">
        {data.expenses && data.expenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(180, data.expenses.length * 48)}>
            <BarChart data={data.expenses} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tickFormatter={usd} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={180} />
              <Tooltip formatter={(v) => usd2(v)} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {data.expenses.map((entry, i) => (
                  <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-xs text-slate-400">
            No expense lines recorded yet — add them in the Cashflow sheet.
          </div>
        )}
      </ChartCard>
    </div>
  );
}