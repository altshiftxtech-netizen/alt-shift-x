import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Users, TrendingDown, TrendingUp } from "lucide-react";

const retentionData = [
  { name: "Ironclad Protocol", retention: 94, color: "#7c3aed", installs: 2341, type: "X1" },
  { name: "The Site Board", retention: 91, color: "#3b82f6", installs: 612, type: "X4" },
  { name: "Estimator's Eye", retention: 82, color: "#f59e0b", installs: 890, type: "X2" },
];

export default function RetentionPanel() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> User Retention Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {retentionData.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-700 truncate">{c.name}</p>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {c.retention >= 90
                    ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                    : <TrendingDown className="w-3 h-3 text-amber-500" />
                  }
                  <span className={`text-xs font-bold ${c.retention >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                    {c.retention}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${c.retention}%`, backgroundColor: c.color }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{c.installs.toLocaleString()} active installs</p>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Platform avg: 84%</span>
            <span className="text-emerald-600 font-semibold">Your avg: 89% ↑</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}