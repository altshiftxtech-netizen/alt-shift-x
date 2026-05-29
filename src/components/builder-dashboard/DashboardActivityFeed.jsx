import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Star, DollarSign, ShieldCheck, Package, Activity } from "lucide-react";

const iconMap = {
  install: { icon: Download, bg: "bg-blue-100", color: "text-blue-600" },
  review: { icon: Star, bg: "bg-amber-100", color: "text-amber-600" },
  payout: { icon: DollarSign, bg: "bg-emerald-100", color: "text-emerald-600" },
  flag: { icon: ShieldCheck, bg: "bg-violet-100", color: "text-violet-600" },
  publish: { icon: Package, bg: "bg-slate-100", color: "text-slate-600" },
};

export default function DashboardActivityFeed({ activity }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-800">Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0 divide-y divide-slate-100">
          {activity.map(item => {
            const cfg = iconMap[item.icon] || iconMap.install;
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <div className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700">{item.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}