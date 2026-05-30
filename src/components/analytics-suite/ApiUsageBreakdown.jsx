import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap } from "lucide-react";

export default function ApiUsageBreakdown({ components, installedData }) {
  const published = components.filter(c => c.status === "published");

  const chartData = published.map(comp => {
    const installs = installedData.filter(i => i.component_id === comp.id);
    const calls = installs.reduce((sum, i) => sum + (i.calls_this_month || 0), 0);
    return {
      name: comp.name.length > 16 ? comp.name.slice(0, 16) + "…" : comp.name,
      calls,
      installs: installs.length,
      type: comp.type,
    };
  }).sort((a, b) => b.calls - a.calls).slice(0, 8);

  const TYPE_COLORS = { X1: "#3b82f6", X2: "#7c3aed", X4: "#f59e0b" };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">API Usage Per Component</h3>
          <p className="text-[11px] text-slate-400">Calls this month — most active first</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-slate-400">
          No published components yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v, name) => [v, name === "calls" ? "API Calls" : "Installs"]}
            />
            <Bar dataKey="calls" radius={[0, 4, 4, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="flex items-center gap-4 mt-3">
        {Object.entries(TYPE_COLORS).map(([t, color]) => (
          <div key={t} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />{t}
          </div>
        ))}
      </div>
    </div>
  );
}