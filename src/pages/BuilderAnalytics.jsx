import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import AnalyticsHeader from "@/components/builder-analytics/AnalyticsHeader";
import InstallTrendChart from "@/components/builder-analytics/InstallTrendChart";
import InstallBreakdown from "@/components/builder-analytics/InstallBreakdown";
import GeographicBreakdown from "@/components/builder-analytics/GeographicBreakdown";
import ChurnPanel from "@/components/builder-analytics/ChurnPanel";
import EarningsPanel from "@/components/builder-analytics/EarningsPanel";
import RetentionPanel from "@/components/builder-analytics/RetentionPanel";
import BobRecommendationsPanel from "@/components/builder-analytics/BobRecommendationsPanel";
import CollaborationPanel from "@/components/builder-analytics/CollaborationPanel";
import BobAdvisorWidget from "@/components/BobAdvisorWidget";
import useBuilderAnalytics from "@/hooks/useBuilderAnalytics";

export default function BuilderAnalytics() {
  const [selectedComponent, setSelectedComponent] = useState("all");
  const {
    loading, selectorOptions, earnings, retention, installTrend,
    breakdown, geo, churnReasons, totalChurned,
  } = useBuilderAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SharedNav mode="builder" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <AnalyticsHeader
          components={selectorOptions}
          selected={selectedComponent}
          onSelect={setSelectedComponent}
        />

        {/* Earnings + Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EarningsPanel earnings={earnings} />
          <RetentionPanel retention={retention} />
        </div>

        {/* Install Trend */}
        <InstallTrendChart data={installTrend} />

        {/* BOB Recommendations */}
        <BobRecommendationsPanel />

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InstallBreakdown breakdown={breakdown} />
          <GeographicBreakdown geo={geo} />
          <ChurnPanel reasons={churnReasons} totalChurned={totalChurned} />
        </div>

        {/* Collaboration */}
        <CollaborationPanel />
      </div>

      {/* BOB Floating Widget */}
      <BobAdvisorWidget />
    </div>
  );
}