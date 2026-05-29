import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const typeColors = {
  X1: "bg-blue-50 text-blue-700 border-blue-200",
  X2: "bg-violet-50 text-violet-700 border-violet-200",
  X3: "bg-amber-50 text-amber-700 border-amber-200",
  X4: "bg-emerald-50 text-emerald-700 border-emerald-200",
  X5: "bg-rose-50 text-rose-700 border-rose-200",
};

const barColors = ["bg-violet-600", "bg-violet-400", "bg-violet-200"];

export default function RevenueByComponent({ components }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">Revenue by Component</CardTitle>
          <span className="text-xs text-slate-400">This month</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {components.map((comp, i) => (
            <div key={comp.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold px-1.5 py-0 flex-shrink-0 ${typeColors[comp.type] || "bg-slate-50 text-slate-600"}`}
                  >
                    {comp.type}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{comp.displayName}</p>
                    <p className="text-xs text-slate-400">{comp.name} · {comp.installs.toLocaleString()} installs</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-slate-900">${comp.revenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{comp.share}% of total</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${barColors[i] || "bg-slate-300"}`}
                  style={{ width: `${comp.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Total this month</span>
          <span className="text-base font-bold text-slate-900">
            ${components.reduce((s, c) => s + c.revenue, 0).toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">(gross)</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}