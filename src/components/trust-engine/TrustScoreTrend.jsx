import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <p className="font-semibold mb-0.5">{label}</p>
        <p className="text-violet-300 font-bold">Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function TrustScoreTrend({ trend }) {
  const latest = trend[trend.length - 1]?.score;
  const first = trend[0]?.score;
  const delta = latest - first;

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-slate-800">Trust Score Trend</CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">5-month change</p>
              <p className={`text-sm font-bold ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {delta >= 0 ? "+" : ""}{delta} pts
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis
              domain={[60, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={90} stroke="#059669" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Trusted", position: "right", fill: "#059669", fontSize: 10 }} />
            <ReferenceLine y={70} stroke="#d97706" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Warning", position: "right", fill: "#d97706", fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6d28d9"
              strokeWidth={2.5}
              dot={{ fill: "#6d28d9", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#6d28d9" }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 border-t-2 border-dashed border-emerald-500" />
            <span>Trusted threshold (90)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 border-t-2 border-dashed border-amber-500" />
            <span>Warning threshold (70)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}