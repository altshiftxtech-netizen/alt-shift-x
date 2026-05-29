import React from "react";
import { TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {sub && (
              <p className={`text-xs mt-1 font-medium ${subColor || "text-slate-400"}`}>{sub}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RevenueStatCards({ stats, stripeConnected }) {
  const fmt = (n) => `$${n.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={DollarSign}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        label="Lifetime Revenue"
        value={fmt(stats.lifetimeRevenue)}
        sub="Since first publish"
        subColor="text-slate-400"
      />
      <StatCard
        icon={TrendingUp}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        label="Current Month"
        value={fmt(stats.currentMonthRevenue)}
        sub={`+${stats.currentMonthChange}% from last month`}
        subColor="text-emerald-600"
      />
      <StatCard
        icon={Calendar}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        label="Next Payout"
        value={fmt(stats.nextPayoutEstimate)}
        sub={`Est. on ${stats.nextPayoutDate}`}
        subColor="text-slate-400"
      />
      <StatCard
        icon={AlertCircle}
        iconBg={stripeConnected ? "bg-emerald-50" : "bg-amber-50"}
        iconColor={stripeConnected ? "text-emerald-600" : "text-amber-600"}
        label="Payout Status"
        value={stripeConnected ? "Connected" : "Setup Required"}
        sub={stripeConnected ? "Stripe Connect active" : "Connect to receive payouts"}
        subColor={stripeConnected ? "text-emerald-600" : "text-amber-600"}
      />
    </div>
  );
}