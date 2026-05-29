import React, { useState } from "react";
import SharedNav from "@/components/SharedNav";
import TrustEngineHeader from "@/components/trust-engine/TrustEngineHeader";
import CompositeScoreGauge from "@/components/trust-engine/CompositeScoreGauge";
import TrustBreakdownCharts from "@/components/trust-engine/TrustBreakdownCharts";
import TrustFlagsPanel from "@/components/trust-engine/TrustFlagsPanel";
import TrustScoreTrend from "@/components/trust-engine/TrustScoreTrend";

// --- MOCK DATA ---
const mockComponents = [
  { id: "rp-construction", name: "RP-CONSTRUCTION-1.0", displayName: "Ironclad Protocol", type: "X1" },
  { id: "pm-construction", name: "PM-CONSTRUCTION-BID", displayName: "Estimator's Eye", type: "X2" },
  { id: "rc-construction", name: "RC-CONSTRUCTION", displayName: "The Site Board", type: "X4" },
];

const mockTrustData = {
  "rp-construction": {
    composite: 91,
    performance: 94,
    userSatisfaction: 89,
    safety: 96,
    retention: 84,
    trend: [
      { month: "Jan", score: 82 },
      { month: "Feb", score: 85 },
      { month: "Mar", score: 87 },
      { month: "Apr", score: 89 },
      { month: "May", score: 91 },
    ],
    metrics: {
      performance: {
        cycleTime: { value: "0.88s", target: "< 1.0s", ok: true },
        errorRate: { value: "0.3%", target: "< 1%", ok: true },
        avgResponseTime: { value: "0.91s", target: "< 1.2s", ok: true },
        benchmarkRegression: { value: "-2%", target: "< 5%", ok: true },
      },
      userSatisfaction: {
        avgRating: { value: "4.4 / 5", target: "> 4.0", ok: true },
        ratingTrend: { value: "Stable", target: "Stable/Improving", ok: true },
        reviewVolume: { value: "847", target: "> 50", ok: true },
        helpfulVoteRatio: { value: "71%", target: "> 75%", ok: false },
      },
      safety: {
        hallucinationRate: { value: "0.4%", target: "< 1%", ok: true },
        citationAccuracy: { value: "98.1%", target: "> 95%", ok: true },
        contradictionRate: { value: "0.8%", target: "< 2%", ok: true },
        adversarialResilience: { value: "96.2%", target: "> 95%", ok: true },
      },
      retention: {
        retention30d: { value: "88%", target: "> 75%", ok: true },
        retention90d: { value: "79%", target: "> 65%", ok: true },
        uninstallRate: { value: "12%", target: "< 15%", ok: true },
        churnReason: { value: "Low bug churn", target: "Mostly non-bug", ok: true },
      },
    },
  },
  "pm-construction": {
    composite: 87,
    performance: 80,
    userSatisfaction: 88,
    safety: 91,
    retention: 82,
    trend: [
      { month: "Jan", score: 80 },
      { month: "Feb", score: 82 },
      { month: "Mar", score: 84 },
      { month: "Apr", score: 86 },
      { month: "May", score: 87 },
    ],
    metrics: {
      performance: {
        cycleTime: { value: "1.1s", target: "< 1.0s", ok: false },
        errorRate: { value: "0.9%", target: "< 1%", ok: true },
        avgResponseTime: { value: "1.2s", target: "< 1.2s", ok: true },
        benchmarkRegression: { value: "-8%", target: "< 5%", ok: false },
      },
      userSatisfaction: {
        avgRating: { value: "4.2 / 5", target: "> 4.0", ok: true },
        ratingTrend: { value: "Declining", target: "Stable/Improving", ok: false },
        reviewVolume: { value: "312", target: "> 50", ok: true },
        helpfulVoteRatio: { value: "79%", target: "> 75%", ok: true },
      },
      safety: {
        hallucinationRate: { value: "0.7%", target: "< 1%", ok: true },
        citationAccuracy: { value: "96.4%", target: "> 95%", ok: true },
        contradictionRate: { value: "1.1%", target: "< 2%", ok: true },
        adversarialResilience: { value: "93.8%", target: "> 95%", ok: false },
      },
      retention: {
        retention30d: { value: "82%", target: "> 75%", ok: true },
        retention90d: { value: "68%", target: "> 65%", ok: true },
        uninstallRate: { value: "18%", target: "< 15%", ok: false },
        churnReason: { value: "Some bug churn", target: "Mostly non-bug", ok: false },
      },
    },
  },
  "rc-construction": {
    composite: 93,
    performance: 95,
    userSatisfaction: 94,
    safety: 97,
    retention: 91,
    trend: [
      { month: "Jan", score: 86 },
      { month: "Feb", score: 88 },
      { month: "Mar", score: 90 },
      { month: "Apr", score: 92 },
      { month: "May", score: 93 },
    ],
    metrics: {
      performance: {
        cycleTime: { value: "0.71s", target: "< 1.0s", ok: true },
        errorRate: { value: "0.1%", target: "< 1%", ok: true },
        avgResponseTime: { value: "0.74s", target: "< 1.2s", ok: true },
        benchmarkRegression: { value: "+1%", target: "< 5%", ok: true },
      },
      userSatisfaction: {
        avgRating: { value: "4.7 / 5", target: "> 4.0", ok: true },
        ratingTrend: { value: "Improving", target: "Stable/Improving", ok: true },
        reviewVolume: { value: "203", target: "> 50", ok: true },
        helpfulVoteRatio: { value: "88%", target: "> 75%", ok: true },
      },
      safety: {
        hallucinationRate: { value: "0.2%", target: "< 1%", ok: true },
        citationAccuracy: { value: "99.1%", target: "> 95%", ok: true },
        contradictionRate: { value: "0.3%", target: "< 2%", ok: true },
        adversarialResilience: { value: "97.4%", target: "> 95%", ok: true },
      },
      retention: {
        retention30d: { value: "91%", target: "> 75%", ok: true },
        retention90d: { value: "84%", target: "> 65%", ok: true },
        uninstallRate: { value: "9%", target: "< 15%", ok: true },
        churnReason: { value: "Minimal bug churn", target: "Mostly non-bug", ok: true },
      },
    },
  },
};

export default function TrustEngine() {
  const [selectedComponent, setSelectedComponent] = useState(mockComponents[0].id);
  const data = mockTrustData[selectedComponent];

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <TrustEngineHeader
          components={mockComponents}
          selectedComponent={selectedComponent}
          onSelectComponent={setSelectedComponent}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CompositeScoreGauge
              composite={data.composite}
              performance={data.performance}
              userSatisfaction={data.userSatisfaction}
              safety={data.safety}
              retention={data.retention}
            />
          </div>
          <div className="lg:col-span-2">
            <TrustScoreTrend trend={data.trend} />
          </div>
        </div>

        <TrustBreakdownCharts metrics={data.metrics} />

        <TrustFlagsPanel metrics={data.metrics} composite={data.composite} />

      </div>
    </div>
  );
}