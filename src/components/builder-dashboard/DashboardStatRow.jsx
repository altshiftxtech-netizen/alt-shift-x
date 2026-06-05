import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Download, ShieldCheck } from "lucide-react";

const stats = (s) => [
  { label: "Total Installs", value: s.totalInstalls.toLocaleString(), sub: "Across all components", icon: Download, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Monthly Recurring", value: `$${Math.round(s.currentMonthRevenue).toLocaleString()}`, sub: "price × active installs", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Published", value: `${s.activeComponents}`, sub: "live components", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Avg Trust Score", value: `${s.avgTrustScore} / 100`, sub: "Across scored components", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function DashboardStatRow({ stats: s }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats(s).map(({ label, value, sub, icon: Icon, color, bg }) => (
        <Card key={label} className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}