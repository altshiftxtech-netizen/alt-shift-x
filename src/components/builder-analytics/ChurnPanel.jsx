import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

const barColors = ["bg-red-400", "bg-amber-400", "bg-violet-400", "bg-blue-400", "bg-slate-300"];

export default function ChurnPanel({ reasons, totalChurned }) {
  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <CardTitle className="text-sm font-semibold text-slate-800">Churn Reasons</CardTitle>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{totalChurned} churned</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(!reasons || reasons.length === 0) && (
          <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
            <TrendingDown className="w-7 h-7 mb-2 opacity-40" />
            <p className="text-xs">{totalChurned > 0 ? `${totalChurned} cancelled installs. Reason data isn't collected yet.` : "No churn yet."}</p>
          </div>
        )}
        {(reasons || []).map((r, i) => (
          <div key={r.reason}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{r.reason}</span>
              <span className="text-xs font-bold text-slate-800">{r.pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${barColors[i] || "bg-slate-300"}`} style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
        <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
          Bug-related churn carries a 2× Trust Score penalty. Keep it below 20% of total churn.
        </p>
      </CardContent>
    </Card>
  );
}