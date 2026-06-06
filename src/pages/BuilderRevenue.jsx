import React from "react";
import SharedNav from "@/components/SharedNav";
import RevenueHeader from "@/components/builder-revenue/RevenueHeader";
import RevenueStatCards from "@/components/builder-revenue/RevenueStatCards";
import RevenueChart from "@/components/builder-revenue/RevenueChart";
import PayoutHistoryTable from "@/components/builder-revenue/PayoutHistoryTable";
import StripeConnectPanel from "@/components/builder-revenue/StripeConnectPanel";
import RevenueByComponent from "@/components/builder-revenue/RevenueByComponent";
import BobAdvisorWidget from "@/components/BobAdvisorWidget";
import useBuilderRevenue from "@/hooks/useBuilderRevenue";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function BuilderRevenue() {
  const { loading, stats, chartData, payouts, componentRevenue } = useBuilderRevenue();

  const handleStripeConnect = async () => {
    // Real Stripe Connect onboarding redirect
    const res = await base44.functions.invoke("stripeConnectOnboard", {});
    if (res?.data?.url) window.location.href = res.data.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SharedNav mode="builder" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <RevenueHeader builderTier="certified" />

        <RevenueStatCards
          stats={stats}
          stripeConnected={stats.stripeConnected}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <StripeConnectPanel
              connected={stats.stripeConnected}
              onConnect={handleStripeConnect}
            />
          </div>
        </div>

        {componentRevenue.length > 0 && (
          <RevenueByComponent components={componentRevenue} />
        )}

        {payouts.length > 0 ? (
          <PayoutHistoryTable payouts={payouts} />
        ) : (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <DollarSign className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium text-slate-500">No payouts yet</p>
              <p className="text-xs mt-1">Your payout history appears here once your components start earning revenue.</p>
            </CardContent>
          </Card>
        )}

      </div>
      <BobAdvisorWidget />
    </div>
  );
}