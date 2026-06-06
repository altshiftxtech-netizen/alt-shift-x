import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingDown, TrendingUp } from "lucide-react";

export default function RetentionPanel({ retention = [] }) {
  const hasData = retention.length > 0;
  const avg = hasData
    ? Math.round(retention.reduce((s, c) => s + (c.retention || 0), 0) / retention.length)
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" /> User Retention Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
            <Users className="w-7 h-7 mb-2 opacity-40" />
            <p className="text-xs">No active installs yet. Retention rates appear once users install your components.</p>
          </div>
        ) : (
          <>
            {retention.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{c.name}</p>
                    {c.retention !== null && (
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {c.retention >= 90
                          ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                          : <TrendingDown className="w-3 h-3 text-amber-500" />}
                        <span className={`text-xs font-bold ${c.retention >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                          {c.retention}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.retention || 0}%`, backgroundColor: c.color }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{c.installs.toLocaleString()} active installs</p>
                </div>
              </div>
            ))}
            {avg !== null && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Your avg retention: {avg}%</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}