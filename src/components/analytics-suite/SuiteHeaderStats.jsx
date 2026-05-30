import React from "react";
import { TrendingUp, Package, Zap, ShieldCheck } from "lucide-react";

export default function SuiteHeaderStats({ components, installedData, platformMetrics, performanceData }) {
  const publishedCount = components.filter(c => c.status === "published").length;
  const totalInstalls = installedData.filter(i =>
    components.some(c => c.id === i.component_id)
  ).length;

  const totalRevenue = components
    .filter(c => c.status === "published")
    .reduce((sum, c) => sum + (c.price || 0) * (installedData.filter(i => i.component_id === c.id).length || 0), 0);

  const latestMetric = platformMetrics[0];
  const avgTrust = components.length
    ? Math.round(components.reduce((s, c) => s + (c.trust_score || 0), 0) / components.length)
    : 0;

  const perfStatus = performanceData
    ? performanceData.critical_count === 0 ? "All Systems Healthy" : `${performanceData.critical_count} Critical`
    : "Collecting...";

  const stats = [
    {
      label: "Est. Monthly Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      sub: `${publishedCount} published components`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Total Installs",
      value: totalInstalls.toLocaleString(),
      sub: "Across all your components",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Avg Trust Score",
      value: avgTrust,
      sub: latestMetric ? `Platform NRR snapshot ${latestMetric.period}` : "No snapshot yet",
      icon: ShieldCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
    {
      label: "Platform Health",
      value: perfStatus,
      sub: performanceData ? `${performanceData.metrics_collected} metrics tracked` : "Running checks...",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
            <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900 leading-none mb-1">{s.value}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</div>
            <div className="text-[10px] text-slate-400 mt-1">{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}