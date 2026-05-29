import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <p className="font-semibold mb-0.5">{label}</p>
        {val != null ? (
          <p className="text-emerald-400 font-bold">${val.toLocaleString()}</p>
        ) : (
          <p className="text-slate-400 italic">Pending</p>
        )}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }) {
  const maxRevenue = Math.max(...data.filter(d => d.revenue != null).map(d => d.revenue));

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">Monthly Revenue</CardTitle>
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Last 6 months</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.revenue == null ? "#e2e8f0" : entry.revenue === maxRevenue ? "#6d28d9" : "#a78bfa"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-700" />
            <span className="text-xs text-slate-500">Peak month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-300" />
            <span className="text-xs text-slate-500">Previous months</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span className="text-xs text-slate-500">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}