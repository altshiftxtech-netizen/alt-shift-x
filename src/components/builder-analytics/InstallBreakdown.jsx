import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function InstallBreakdown({ breakdown }) {
  const pieData = [
    { name: "Enterprise", value: breakdown.enterprise },
    { name: "Community", value: breakdown.community },
  ];
  const activePie = [
    { name: "Active", value: breakdown.activeInstalls },
    { name: "Churned", value: breakdown.churnedInstalls },
  ];

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-800">Install Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Enterprise vs Community</p>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value" paddingAngle={3}>
                <Cell fill="#6d28d9" />
                <Cell fill="#e2e8f0" />
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? "#6d28d9" : "#e2e8f0" }} />
                <span className="text-[10px] text-slate-500">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">Active vs Churned</p>
          {activePie.map((d, i) => (
            <div key={d.name} className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{d.name}</span>
                <span className="font-bold text-slate-800">{d.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${(d.value / (breakdown.activeInstalls + breakdown.churnedInstalls)) * 100}%`, background: i === 0 ? "#059669" : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}