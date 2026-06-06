import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function GeographicBreakdown({ geo }) {
  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <CardTitle className="text-sm font-semibold text-slate-800">Geographic Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(!geo || geo.length === 0) && (
          <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
            <MapPin className="w-7 h-7 mb-2 opacity-40" />
            <p className="text-xs">Geographic data isn't tracked for installs yet.</p>
          </div>
        )}
        {(geo || []).map(g => (
          <div key={g.country}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{g.flag}</span>
                <span className="text-xs text-slate-600">{g.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{g.installs} installs</span>
                <span className="text-xs font-bold text-slate-800">{g.pct}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${g.pct}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}