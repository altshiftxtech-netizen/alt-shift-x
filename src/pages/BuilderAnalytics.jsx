import React, { useState } from "react";
import AnalyticsHeader from "@/components/builder-analytics/AnalyticsHeader";
import InstallTrendChart from "@/components/builder-analytics/InstallTrendChart";
import InstallBreakdown from "@/components/builder-analytics/InstallBreakdown";
import GeographicBreakdown from "@/components/builder-analytics/GeographicBreakdown";
import ChurnPanel from "@/components/builder-analytics/ChurnPanel";

const COMPONENTS = [
  { id: "all", label: "All Components" },
  { id: "rp-construction", label: "Ironclad Protocol" },
  { id: "pm-construction", label: "Estimator's Eye" },
  { id: "rc-construction", label: "The Site Board" },
];

const installTrend = [
  { month: "Jan", installs: 187, churned: 22 },
  { month: "Feb", installs: 243, churned: 31 },
  { month: "Mar", installs: 318, churned: 28 },
  { month: "Apr", installs: 389, churned: 44 },
  { month: "May", installs: 225, churned: 19 },
];

const breakdown = {
  enterprise: 38,
  community: 62,
  activeInstalls: 1189,
  churnedInstalls: 173,
};

const geo = [
  { country: "Australia", flag: "🇦🇺", installs: 421, pct: 31 },
  { country: "New Zealand", flag: "🇳🇿", installs: 312, pct: 23 },
  { country: "United Kingdom", flag: "🇬🇧", installs: 218, pct: 16 },
  { country: "United States", flag: "🇺🇸", installs: 189, pct: 14 },
  { country: "Canada", flag: "🇨🇦", installs: 122, pct: 9 },
  { country: "Other", flag: "🌐", installs: 100, pct: 7 },
];

const churnReasons = [
  { reason: "Switched to competitor", pct: 34 },
  { reason: "Price too high", pct: 22 },
  { reason: "Bug / accuracy issue", pct: 19 },
  { reason: "Project ended", pct: 15 },
  { reason: "Other / unknown", pct: 10 },
];

export default function BuilderAnalytics() {
  const [selectedComponent, setSelectedComponent] = useState("all");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <AnalyticsHeader
          components={COMPONENTS}
          selected={selectedComponent}
          onSelect={setSelectedComponent}
        />
        <InstallTrendChart data={installTrend} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <InstallBreakdown breakdown={breakdown} />
          </div>
          <div className="lg:col-span-1">
            <GeographicBreakdown geo={geo} />
          </div>
          <div className="lg:col-span-1">
            <ChurnPanel reasons={churnReasons} totalChurned={breakdown.churnedInstalls} />
          </div>
        </div>
      </div>
    </div>
  );
}