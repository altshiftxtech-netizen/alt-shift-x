import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

const passes = [
  { key: "pass1", label: "Pass 1", sublabel: "Classification" },
  { key: "pass2", label: "Pass 2", sublabel: "Extraction" },
  { key: "pass3", label: "Pass 3", sublabel: "Validation" },
  { key: "pass4", label: "Pass 4", sublabel: "Audit" },
];

function getBarColor(ms) {
  if (ms < 200) return "bg-emerald-500";
  if (ms < 400) return "bg-violet-500";
  return "bg-amber-500";
}

function getTotalBadge(total) {
  if (total < 800) return { label: "Fast", className: "bg-emerald-100 text-emerald-700" };
  if (total < 1100) return { label: "Good", className: "bg-violet-100 text-violet-700" };
  return { label: "Slow", className: "bg-amber-100 text-amber-700" };
}

export default function LatencyPanel({ metrics }) {
  const maxMs = Math.max(metrics.pass1, metrics.pass2, metrics.pass3, metrics.pass4);
  const badge = getTotalBadge(metrics.total);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-sm font-semibold text-slate-800">Latency Breakdown</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
            <span className="text-sm font-black text-slate-900">{metrics.total}ms</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {passes.map(({ key, label, sublabel }) => {
          const ms = metrics[key];
          const pct = Math.round((ms / maxMs) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-700">{label}</span>
                  <span className="text-[10px] text-slate-400">({sublabel})</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{ms}ms</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${getBarColor(ms)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="text-[10px] text-slate-400 pt-1">
          Target: total &lt; 1,000ms for Certified tier compliance.
        </p>
      </CardContent>
    </Card>
  );
}