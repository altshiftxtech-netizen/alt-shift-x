import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

function Stat({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
        <p className="text-lg font-black text-slate-900">{value}</p>
        {sub && <p className={`text-[11px] ${subColor || "text-slate-400"}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function EarningSummary({ summary, badge }) {
  const fmt = n => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const s = summary || {};

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate-800">Lifetime Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat
            icon={DollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Lifetime Gross"
            value={fmt(s.lifetime_gross)}
            sub="Total collected from subscribers"
          />
          <Stat
            icon={TrendingUp}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            label="Lifetime Payout"
            value={fmt(s.lifetime_payout)}
            sub={`${badge?.revenue_share_pct || 70}% avg revenue share`}
            subColor="text-violet-600"
          />
          <Stat
            icon={CheckCircle2}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Paid Out"
            value={fmt(s.paid_out)}
            sub="Successfully transferred"
          />
          <Stat
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="Approved & Ready"
            value={fmt(s.approved_total)}
            sub={`${s.approved_total > 0 ? "Ready to transfer now" : "No approved splits pending"}`}
            subColor={s.approved_total > 0 ? "text-amber-600 font-semibold" : "text-slate-400"}
          />
        </div>
        {(s.pending_total || 0) > 0 && (
          <div className="mt-3 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <span className="font-semibold text-slate-700">{fmt(s.pending_total)}</span> pending admin approval before it can be paid out.
          </div>
        )}
      </CardContent>
    </Card>
  );
}