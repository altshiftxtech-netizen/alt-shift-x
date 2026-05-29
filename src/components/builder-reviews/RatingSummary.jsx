import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function RatingSummary({ avg, dist, total }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-800">Rating Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-4xl font-black text-slate-900">{avg.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">{total} reviews</p>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(s => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-4">{s}★</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-amber-400"
                  style={{ width: `${total > 0 ? ((dist[s] || 0) / total) * 100 : 0}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 w-4">{dist[s] || 0}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}