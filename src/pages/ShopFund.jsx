import React, { useState, useEffect } from "react";
import { HeartHandshake, TrendingUp, Users, ShoppingCart, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { base44 } from "@/api/base44Client";
import ShopShell from "@/components/shop/ShopNav";
import useIsAdmin from "@/hooks/useIsAdmin";

const FALLBACK_COLORS = ["#FF9500", "#0066FF", "#9D4EDD", "#22C55E"];

export default function ShopFund() {
  const isAdmin = useIsAdmin();
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const rows = await base44.entities.CommunityFund.list("period", 24);
      setMonths(rows);
      setLoading(false);
    })();
  }, []);

  const current = months.find((m) => m.is_current) || months[months.length - 1] || null;
  const trend = months.map((m) => ({ name: m.month_label?.split(" ")[0] || m.period, value: m.total_raised || 0 }));
  const pie = (current?.allocations || []).map((a, i) => ({ ...a, color: a.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }));

  return (
    <ShopShell isAdmin={isAdmin}>
      <div className="relative text-white" style={{ background: "linear-gradient(135deg,#1A1A2E,#0066FF 160%)" }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
            <HeartHandshake className="w-8 h-8" /> Community Fund Tracker
          </h1>
          <p className="text-white/70 mt-2">Where your purchases go — 100% to community initiatives.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0066FF] rounded-full animate-spin" />
          </div>
        ) : !current ? (
          <p className="text-slate-400 text-center py-16">No fund data published yet.</p>
        ) : (
          <>
            {/* Monthly summary */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-1">{current.month_label}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[
                  { icon: HeartHandshake, label: "Total Raised", value: `$${current.total_raised?.toLocaleString()}` },
                  { icon: TrendingUp, label: "Growth vs last month", value: `↑ ${current.growth_pct}%` },
                  { icon: Users, label: "Contributors", value: current.contributors?.toLocaleString() },
                  { icon: ShoppingCart, label: "Purchases", value: current.purchases?.toLocaleString() },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-4">
                    <s.icon className="w-5 h-5 text-[#0066FF]" />
                    <p className="text-2xl font-extrabold text-slate-900 mt-2">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Allocation pie */}
              {pie.length > 0 && (
                <section className="rounded-2xl bg-white border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">How we're spending it</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pie} dataKey="pct" nameKey="label" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {pie.map((a, i) => <Cell key={i} fill={a.color} />)}
                        </Pie>
                        <Tooltip formatter={(v, n, p) => [`${v}% · $${(p.payload.amount || 0).toLocaleString()}`, p.payload.label]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    {pie.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="w-3 h-3 rounded-full" style={{ background: a.color }} /> {a.label}
                        </span>
                        <span className="font-medium text-slate-800">{a.pct}% · ${(a.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Revenue trend */}
              {trend.length > 1 && (
                <section className="rounded-2xl bg-white border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Monthly revenue trend</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ left: -10, right: 10, top: 10 }}>
                        <defs>
                          <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0066FF" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, "Raised"]} />
                        <Area type="monotone" dataKey="value" stroke="#0066FF" strokeWidth={2.5} fill="url(#fundGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </div>

            {/* What was funded */}
            {(current.funded_items || []).length > 0 && (
              <section>
                <h3 className="font-bold text-slate-900 mb-4">What was funded this month</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {current.funded_items.map((f, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900">{f.title}</p>
                        {f.detail && <p className="text-sm text-slate-500 mt-0.5">{f.detail}</p>}
                        {f.cost != null && <p className="text-sm font-medium text-slate-700 mt-1">${f.cost?.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Transparency */}
            <section className="rounded-2xl bg-slate-900 text-white p-8">
              <h3 className="font-bold text-lg mb-4">Transparency</h3>
              <div className="grid sm:grid-cols-3 gap-6 text-sm">
                <div><p className="font-semibold">How do you decide what to fund?</p><p className="text-white/60 mt-1">Community voting plus leadership review.</p></div>
                <div><p className="font-semibold">Do you take a cut?</p><p className="text-white/60 mt-1">No — 100% goes to community initiatives.</p></div>
                <div><p className="font-semibold">Can I see receipts?</p><p className="text-white/60 mt-1">Detailed receipts are shared with members each month.</p></div>
              </div>
            </section>
          </>
        )}
      </div>
    </ShopShell>
  );
}