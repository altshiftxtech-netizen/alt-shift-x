import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, RefreshCw, Building2, Users, DollarSign, TrendingUp,
  ShieldCheck, CreditCard, AlertTriangle, ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import { base44 } from "@/api/base44Client";

const EM_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/70a65d41d_generated_image.png";

const usd = (n) => `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  pending_payment: "bg-amber-100 text-amber-700",
  pending_agreement: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
};
const PIE_COLORS = ["#10b981", "#f59e0b", "#64748b", "#dc2626", "#7c3aed"];

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
          <div className={`p-2 rounded-xl ${tones[tone]}`}><Icon className="w-4 h-4" /></div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        </div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * ExpertMindsEnterpriseTab (Admin) — platform-admin management + record-keeping
 * for ExpertMinds Enterprise orgs. Financial rollup, status graphs, and a full
 * org ledger. No gamification — finance & records only.
 */
export default function AdminExpertMindsEnterpriseTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("expertMindsOrgOps", { action: "admin_overview" });
      if (res.data?.ok) setData(res.data);
      else setError(res.data?.error || "Failed to load ExpertMinds data");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <p className="text-xs text-slate-400">Loading ExpertMinds Enterprise records…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-10 text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Couldn't load ExpertMinds data</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{String(error)}</p>
          <Button onClick={load} variant="outline" className="text-xs h-8 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const k = data.kpis || {};
  const orgRows = data.orgRows || [];
  const statusData = Object.entries(data.statusCounts || {}).map(([name, value]) => ({ name, value }));
  const mrrBars = [
    { name: "Core MRR", amount: k.coreMrr },
    { name: "Seat MRR", amount: k.seatMrr },
    { name: "Total MRR", amount: k.totalMrr },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={EM_LOGO} alt="ExpertMinds" className="h-10 w-10 object-contain rounded-lg bg-slate-900/90 p-1" draggable="false" />
          <div>
            <p className="text-sm font-bold text-slate-900">ExpertMinds Enterprise</p>
            <p className="text-xs text-slate-400">Financial &amp; record-keeping management for all orgs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/enterprise/expertminds" target="_blank" rel="noreferrer">
            <Button variant="outline" className="text-xs h-8 gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Open Page</Button>
          </a>
          <Button onClick={load} variant="outline" className="text-xs h-8 gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Total MRR" value={usd(k.totalMrr)} sub={`${usd(k.coreMrr)} core + ${usd(k.seatMrr)} seats`} tone="violet" />
        <KpiCard icon={TrendingUp} label="Projected ARR" value={usd(k.arr)} sub="MRR × 12" tone="emerald" />
        <KpiCard icon={Building2} label="Orgs" value={(k.totalOrgs || 0).toLocaleString()} sub={`${k.activeOrgs || 0} active`} tone="blue" />
        <KpiCard icon={Users} label="Member Seats" value={(k.totalSeats || 0).toLocaleString()} sub={`${k.chargedSeats || 0} charged`} tone="amber" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CreditCard} label="Charged Seats" value={(k.chargedSeats || 0).toLocaleString()} sub={`${usd(k.seatMrr)}/mo`} tone="emerald" />
        <KpiCard icon={ShieldCheck} label="Verified Seats" value={(k.verifiedSeats || 0).toLocaleString()} sub="Vana-Voice handshake" tone="slate" />
        <KpiCard icon={Building2} label="Active Core" value={(k.activeOrgs || 0).toLocaleString()} sub="$10k/mo each" tone="violet" />
        <KpiCard icon={DollarSign} label="Core MRR" value={usd(k.coreMrr)} sub="Org master licenses" tone="blue" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-bold text-slate-900 mb-4">Recurring Revenue</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mrrBars} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={usd} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(v) => usd(v)} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {mrrBars.map((_, i) => <Cell key={i} fill={["#7c3aed", "#2563eb", "#10b981"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-sm font-bold text-slate-900 mb-4">Org Status</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-xs text-slate-400">No orgs yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Org ledger */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-bold text-slate-900 mb-4">Organization Ledger</p>
          {orgRows.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No ExpertMinds Enterprise organizations yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-3 py-2">Organization</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Blackstone</th>
                    <th className="px-3 py-2 text-right">Seats</th>
                    <th className="px-3 py-2 text-right">Charged</th>
                    <th className="px-3 py-2 text-right">Verified</th>
                    <th className="px-3 py-2 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {orgRows.map((o) => (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-900">{o.org_name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{o.org_admin_email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.core_status] || "bg-slate-100 text-slate-600"}`}>
                          {(o.core_status || "—").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {o.blackstone_signed
                          ? <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Signed</span>
                          : <span className="text-[11px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-700">{o.seats}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{o.charged_seats}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{o.verified_seats}</td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900">{usd(o.mrr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}