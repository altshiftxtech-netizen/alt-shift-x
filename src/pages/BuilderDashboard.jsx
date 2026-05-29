import React from "react";
import DashboardHeader from "@/components/builder-dashboard/DashboardHeader";
import DashboardStatRow from "@/components/builder-dashboard/DashboardStatRow";
import DashboardTrustSummary from "@/components/builder-dashboard/DashboardTrustSummary";
import DashboardActivityFeed from "@/components/builder-dashboard/DashboardActivityFeed";
import DashboardQuickLinks from "@/components/builder-dashboard/DashboardQuickLinks";

const mockStats = {
  totalInstalls: 1362,
  installsDelta: 8.3,
  lifetimeRevenue: 23312,
  currentMonthRevenue: 6918,
  revenueDelta: 12.4,
  activeComponents: 3,
  avgTrustScore: 90,
};

const mockTrust = [
  { name: "Ironclad Protocol", score: 91, type: "X1" },
  { name: "Estimator's Eye", score: 87, type: "X2" },
  { name: "The Site Board", score: 93, type: "X4" },
];

const mockActivity = [
  { id: 1, type: "install", message: "New enterprise install of Ironclad Protocol", time: "2 min ago", icon: "install" },
  { id: 2, type: "review", message: "New 5★ review on The Site Board", time: "18 min ago", icon: "review" },
  { id: 3, type: "payout", message: "Payout of $6,918 processed for May 2026", time: "1 hour ago", icon: "payout" },
  { id: 4, type: "flag", message: "Trust flag resolved on Estimator's Eye", time: "3 hours ago", icon: "flag" },
  { id: 5, type: "install", message: "47 new installs across all components today", time: "5 hours ago", icon: "install" },
  { id: 6, type: "review", message: "New 3★ review on Estimator's Eye — response recommended", time: "Yesterday", icon: "review" },
  { id: 7, type: "publish", message: "Ironclad Protocol v2.4.1 published successfully", time: "2 days ago", icon: "publish" },
];

export default function BuilderDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DashboardHeader builderName="Marcus Holloway" tier="certified" />
        <DashboardStatRow stats={mockStats} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardTrustSummary components={mockTrust} />
            <DashboardActivityFeed activity={mockActivity} />
          </div>
          <div className="lg:col-span-1">
            <DashboardQuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
}