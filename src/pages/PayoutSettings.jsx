import React, { useState, useEffect } from "react";
import SharedNav from "@/components/SharedNav";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TierBadge, AchievementBadge } from "@/components/BuilderTierBadge";
import StripeConnectSection from "@/components/payout/StripeConnectSection";
import PaypalPayoutSection from "@/components/payout/PaypalPayoutSection";
import EarningSummary from "@/components/payout/EarningSummary";
import ApprovedSplitsTable from "@/components/payout/ApprovedSplitsTable";
import ReferralPortal from "@/components/payout/ReferralPortal";
import { Loader2, RefreshCw } from "lucide-react";

function isInIframe() {
  try { return window.self !== window.top; } catch { return true; }
}

export default function PayoutSettings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payoutResult, setPayoutResult] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke("getBuilderPayoutStatus", {});
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Handle return from Stripe onboarding
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") || params.get("refresh")) {
      load();
    }
  }, []);

  const handleConnectStripe = async () => {
    if (isInIframe()) {
      alert("Stripe Connect onboarding only works from the published app URL.");
      return;
    }
    setConnectLoading(true);
    const res = await base44.functions.invoke("stripeConnectOnboard", {
      return_url: window.location.href + "?connected=true",
      refresh_url: window.location.href + "?refresh=true",
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert(res.data?.error || "Failed to start Stripe onboarding.");
      setConnectLoading(false);
    }
  };

  const payoutMethod = data?.badge?.payout_method || "stripe";
  const paypalReady = !!data?.badge?.paypal_payout_email;
  const stripeReady = !!data?.stripe_status?.payouts_enabled;
  const payoutReady = payoutMethod === "paypal" ? paypalReady : stripeReady;

  const handlePayout = async (splitIds) => {
    if (isInIframe()) {
      alert("Payouts only work from the published app URL.");
      return;
    }
    setPayoutLoading(true);
    setPayoutResult(null);
    const fn = payoutMethod === "paypal" ? "paypalBuilderPayout" : "initiateBuilderPayout";
    const res = await base44.functions.invoke(fn, splitIds ? { split_ids: splitIds } : {});
    setPayoutResult(res.data);
    if (!res.data?.error) await load();
    setPayoutLoading(false);
  };

  const handleSelectMethod = async (method) => {
    await base44.functions.invoke("savePaypalPayoutEmail", { payout_method: method });
    await load();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Payout Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your bank account, initiate payouts, and track referral earnings.</p>
          </div>
          <div className="flex items-center gap-2">
            {data?.badge?.tier && <TierBadge tier={data.badge.tier} size="lg" />}
            {(data?.badge?.badges_earned || []).map(b => <AchievementBadge key={b} badgeKey={b} />)}
            <Button variant="outline" size="sm" onClick={load} className="gap-1.5 text-xs">
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Payout result toast */}
        {payoutResult && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${payoutResult.error ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
            {payoutResult.error
              ? `Payout failed: ${payoutResult.error}`
              : `✓ Transferred $${payoutResult.total_transferred?.toFixed(2)} across ${payoutResult.processed} payout(s).${payoutResult.failed > 0 ? ` ${payoutResult.failed} failed.` : ""}`
            }
          </div>
        )}

        {/* Payout method selector */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600 mr-1">Payout method:</span>
          {[
            { key: "stripe", label: "Stripe (Bank)" },
            { key: "paypal", label: "PayPal" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => handleSelectMethod(m.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                payoutMethod === m.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Top section: Connect + Earnings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {payoutMethod === "paypal" ? (
              <PaypalPayoutSection badge={data?.badge} onSaved={load} />
            ) : (
              <StripeConnectSection
                stripeStatus={data?.stripe_status}
                badge={data?.badge}
                loading={connectLoading}
                onConnect={handleConnectStripe}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <EarningSummary summary={data?.summary} badge={data?.badge} />
          </div>
        </div>

        {/* Approved splits ready for payout */}
        <ApprovedSplitsTable
          splits={data?.splits || []}
          stripeReady={payoutReady}
          payoutMethod={payoutMethod}
          payoutLoading={payoutLoading}
          onPayout={handlePayout}
        />

        {/* Referral portal */}
        <ReferralPortal badge={data?.badge} onRefresh={load} />

      </div>
    </div>
  );
}