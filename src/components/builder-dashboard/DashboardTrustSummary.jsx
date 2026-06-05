import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X3: "bg-cyan-100 text-cyan-700", X4: "bg-amber-100 text-amber-700", X5: "bg-emerald-100 text-emerald-700" };

function scoreColor(s) {
  if (s >= 90) return "text-emerald-600";
  if (s >= 70) return "text-blue-600";
  return "text-amber-600";
}
function barColor(s) {
  if (s >= 90) return "bg-emerald-500";
  if (s >= 70) return "bg-blue-500";
  return "bg-amber-500";
}

export default function DashboardTrustSummary({ components }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-sm font-semibold text-slate-800">Trust Score Summary</CardTitle>
          </div>
          <Link to="/builder/trust" className="text-xs text-violet-600 hover:underline">Full Trust Engine →</Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {components.map(c => (
          <div key={c.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                <span className="text-sm font-semibold text-slate-700">{c.name}</span>
              </div>
              <span className={`text-sm font-black ${scoreColor(c.score)}`}>{c.score}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${barColor(c.score)}`} style={{ width: `${c.score}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}