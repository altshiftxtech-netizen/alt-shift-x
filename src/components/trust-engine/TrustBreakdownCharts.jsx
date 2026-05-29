import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Zap, Star, ShieldCheck, Users } from "lucide-react";

const sections = [
  {
    key: "performance",
    label: "Performance",
    icon: Zap,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    weight: "30%",
    metricLabels: {
      cycleTime: "Cycle Time",
      errorRate: "Error Rate",
      avgResponseTime: "Avg Response Time",
      benchmarkRegression: "Benchmark Regression",
    },
  },
  {
    key: "userSatisfaction",
    label: "User Satisfaction",
    icon: Star,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    weight: "25%",
    metricLabels: {
      avgRating: "Average Rating",
      ratingTrend: "Rating Trend",
      reviewVolume: "Review Volume",
      helpfulVoteRatio: "Helpful Vote Ratio",
    },
  },
  {
    key: "safety",
    label: "Safety",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    weight: "25%",
    metricLabels: {
      hallucinationRate: "Hallucination Rate",
      citationAccuracy: "Citation Accuracy",
      contradictionRate: "Contradiction Rate",
      adversarialResilience: "Adversarial Resilience",
    },
  },
  {
    key: "retention",
    label: "Retention",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    weight: "20%",
    metricLabels: {
      retention30d: "30-Day Retention",
      retention90d: "90-Day Retention",
      uninstallRate: "Uninstall Rate",
      churnReason: "Churn Reason",
    },
  },
];

function MetricRow({ label, value, target, ok }) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${ok ? "bg-slate-50" : "bg-red-50"}`}>
      <div className="flex items-center gap-2">
        {ok
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          : <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        }
        <span className="text-xs text-slate-600">{label}</span>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className={`text-xs font-bold ${ok ? "text-slate-800" : "text-red-600"}`}>{value}</p>
        <p className="text-[10px] text-slate-400">Target: {target}</p>
      </div>
    </div>
  );
}

export default function TrustBreakdownCharts({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {sections.map(({ key, label, icon: Icon, color, bg, border, weight, metricLabels }) => {
        const sectionMetrics = metrics[key] || {};
        const failCount = Object.values(sectionMetrics).filter(m => !m.ok).length;

        return (
          <Card key={key} className={`border ${border} shadow-sm`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-800">{label}</CardTitle>
                    <p className="text-[10px] text-slate-400">Weight: {weight}</p>
                  </div>
                </div>
                {failCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {failCount} issue{failCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {Object.entries(sectionMetrics).map(([metricKey, metric]) => (
                <MetricRow
                  key={metricKey}
                  label={metricLabels[metricKey] || metricKey}
                  value={metric.value}
                  target={metric.target}
                  ok={metric.ok}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}