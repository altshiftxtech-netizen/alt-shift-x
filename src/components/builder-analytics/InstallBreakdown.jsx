import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstallBreakdown({ breakdown }) {
  const activePie = [
    { name: "Active", value: breakdown.activeInstalls },
    { name: "Churned", value: breakdown.churnedInstalls },
  ];

  const totalInstalls = breakdown.activeInstalls + breakdown.churnedInstalls;

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-800">Install Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {totalInstalls === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center text-slate-400">
            <p className="text-xs">No installs yet. Breakdown appears once your components are installed.</p>
          </div>
        ) : (
        <div className="pt-1">
          <p className="text-xs text-slate-500 mb-2 font-medium">Active vs Churned</p>
          {activePie.map((d, i) => (
            <div key={d.name} className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{d.name}</span>
                <span className="font-bold text-slate-800">{d.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${(d.value / totalInstalls) * 100}%`, background: i === 0 ? "#059669" : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}