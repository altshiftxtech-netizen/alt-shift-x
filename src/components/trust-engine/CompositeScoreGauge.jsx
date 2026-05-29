import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

const subScores = [
  { key: "performance", label: "Performance", weight: "30%", color: "#6d28d9" },
  { key: "userSatisfaction", label: "User Satisfaction", weight: "25%", color: "#2563eb" },
  { key: "safety", label: "Safety", weight: "25%", color: "#059669" },
  { key: "retention", label: "Retention", weight: "20%", color: "#d97706" },
];

function scoreToBadge(score) {
  if (score >= 90) return { label: "Trusted", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" };
  if (score >= 70) return { label: "Good Standing", className: "bg-blue-100 text-blue-700 border border-blue-200" };
  if (score >= 50) return { label: "Warning", className: "bg-amber-100 text-amber-700 border border-amber-200" };
  return { label: "At Risk", className: "bg-red-100 text-red-700 border border-red-200" };
}

export default function CompositeScoreGauge({ composite, performance, userSatisfaction, safety, retention }) {
  const badge = scoreToBadge(composite);
  const scores = { performance, userSatisfaction, safety, retention };

  const gaugeData = [{ value: composite, fill: composite >= 90 ? "#059669" : composite >= 70 ? "#6d28d9" : composite >= 50 ? "#d97706" : "#dc2626" }];

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">Composite Trust Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gauge */}
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart
              cx="50%" cy="80%"
              innerRadius="70%" outerRadius="100%"
              startAngle={180} endAngle={0}
              data={gaugeData}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={6}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-2 text-center">
            <p className="text-4xl font-black text-slate-900">{composite}</p>
            <p className="text-xs text-slate-400 -mt-1">out of 100</p>
          </div>
        </div>

        <div className="flex justify-center">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Sub-score breakdown */}
        <div className="space-y-2.5 pt-2">
          {subScores.map(({ key, label, weight, color }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-600 font-medium">{label}</span>
                  <span className="text-[10px] text-slate-400">({weight})</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{scores[key]}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${scores[key]}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 text-center pt-1 leading-relaxed">
          Score = Performance(30%) + User Sat(25%) + Safety(25%) + Retention(20%)
        </p>
      </CardContent>
    </Card>
  );
}