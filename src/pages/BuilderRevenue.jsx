import React, { useState } from "react";
import SharedNav from "@/components/SharedNav";
import RevenueHeader from "@/components/builder-revenue/RevenueHeader";
import RevenueStatCards from "@/components/builder-revenue/RevenueStatCards";
import RevenueChart from "@/components/builder-revenue/RevenueChart";
import PayoutHistoryTable from "@/components/builder-revenue/PayoutHistoryTable";
import StripeConnectPanel from "@/components/builder-revenue/StripeConnectPanel";
import RevenueByComponent from "@/components/builder-revenue/RevenueByComponent";

// --- MOCK DATA ---
const mockStats = {
  lifetimeRevenue: 23312,
  currentMonthRevenue: 6918,
  currentMonthChange: 12.4,
  nextPayoutDate: "June 1, 2026",
  nextPayoutEstimate: 4843,
  stripeConnected: false,
};

const mockChartData = [
  { month: "Jan", revenue: 2100 },
  { month: "Feb", revenue: 3400 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 6918 },
  { month: "Jun", revenue: null },
];

const mockPayouts = [
  {
    id: "PAY-2026-05",
    period: "May 2026",
    gross: 9883,
    platformFee: 2965,
    net: 6918,
    status: "completed",
    paidAt: "Jun 1, 2026",
    lineItems: [
      { component: "RP-CONSTRUCTION-1.0 'Ironclad Protocol'", installs: 847, revenue: 4235, fee: 1271, net: 2964 },
      { component: "PM-CONSTRUCTION-BID 'The Estimator's Eye'", installs: 312, revenue: 1872, fee: 562, net: 1310 },
      { component: "RC-CONSTRUCTION 'The Site Board'", installs: 203, revenue: 811, fee: 243, net: 568 },
    ],
  },
  {
    id: "PAY-2026-04",
    period: "Apr 2026",
    gross: 8714,
    platformFee: 2614,
    net: 6100,
    status: "completed",
    paidAt: "May 1, 2026",
    lineItems: [
      { component: "RP-CONSTRUCTION-1.0 'Ironclad Protocol'", installs: 763, revenue: 3815, fee: 1145, net: 2670 },
      { component: "PM-CONSTRUCTION-BID 'The Estimator's Eye'", installs: 289, revenue: 1734, fee: 520, net: 1214 },
      { component: "RC-CONSTRUCTION 'The Site Board'", installs: 190, revenue: 760, fee: 228, net: 532 },
    ],
  },
  {
    id: "PAY-2026-03",
    period: "Mar 2026",
    gross: 6857,
    platformFee: 2057,
    net: 4800,
    status: "completed",
    paidAt: "Apr 1, 2026",
    lineItems: [
      { component: "RP-CONSTRUCTION-1.0 'Ironclad Protocol'", installs: 612, revenue: 3060, fee: 918, net: 2142 },
      { component: "PM-CONSTRUCTION-BID 'The Estimator's Eye'", installs: 234, revenue: 1404, fee: 421, net: 983 },
      { component: "RC-CONSTRUCTION 'The Site Board'", installs: 147, revenue: 588, fee: 176, net: 412 },
    ],
  },
  {
    id: "PAY-2026-02",
    period: "Feb 2026",
    gross: 4857,
    platformFee: 1457,
    net: 3400,
    status: "completed",
    paidAt: "Mar 1, 2026",
    lineItems: [
      { component: "RP-CONSTRUCTION-1.0 'Ironclad Protocol'", installs: 445, revenue: 2225, fee: 668, net: 1557 },
      { component: "PM-CONSTRUCTION-BID 'The Estimator's Eye'", installs: 189, revenue: 1134, fee: 340, net: 794 },
      { component: "RC-CONSTRUCTION 'The Site Board'", installs: 104, revenue: 416, fee: 125, net: 291 },
    ],
  },
  {
    id: "PAY-2026-01",
    period: "Jan 2026",
    gross: 3000,
    platformFee: 900,
    net: 2100,
    status: "completed",
    paidAt: "Feb 1, 2026",
    lineItems: [
      { component: "RP-CONSTRUCTION-1.0 'Ironclad Protocol'", installs: 298, revenue: 1490, fee: 447, net: 1043 },
      { component: "PM-CONSTRUCTION-BID 'The Estimator's Eye'", installs: 132, revenue: 792, fee: 238, net: 554 },
      { component: "RC-CONSTRUCTION 'The Site Board'", installs: 74, revenue: 296, fee: 89, net: 207 },
    ],
  },
  {
    id: "PAY-2025-12",
    period: "Dec 2025",
    gross: 1428,
    platformFee: 428,
    net: 1000,
    status: "completed",
    paidAt: "Jan 1, 2026",
    lineItems: [
      { component: "RP-CONSTRUCTION-1.0 'Ironclad Protocol'", installs: 128, revenue: 640, fee: 192, net: 448 },
      { component: "PM-CONSTRUCTION-BID 'The Estimator's Eye'", installs: 88, revenue: 528, fee: 158, net: 370 },
    ],
  },
];

const mockComponentRevenue = [
  { name: "RP-CONSTRUCTION-1.0", displayName: "Ironclad Protocol", type: "X1", installs: 847, revenue: 4235, share: 61 },
  { name: "PM-CONSTRUCTION-BID", displayName: "Estimator's Eye", type: "X2", installs: 312, revenue: 1872, share: 27 },
  { name: "RC-CONSTRUCTION", displayName: "The Site Board", type: "X4", installs: 203, revenue: 811, share: 12 },
];

export default function BuilderRevenue() {
  const [stripeConnected, setStripeConnected] = useState(mockStats.stripeConnected);

  const handleStripeConnect = () => {
    // Simulates the Stripe Connect onboarding redirect
    setTimeout(() => setStripeConnected(true), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <RevenueHeader builderTier="certified" />

        <RevenueStatCards
          stats={mockStats}
          stripeConnected={stripeConnected}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={mockChartData} />
          </div>
          <div className="lg:col-span-1">
            <StripeConnectPanel
              connected={stripeConnected}
              onConnect={handleStripeConnect}
            />
          </div>
        </div>

        <RevenueByComponent components={mockComponentRevenue} />

        <PayoutHistoryTable payouts={mockPayouts} />

      </div>
    </div>
  );
}