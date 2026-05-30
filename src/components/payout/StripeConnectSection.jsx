import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Loader2, Lock, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export default function StripeConnectSection({ stripeStatus, badge, loading, onConnect }) {
  const isActive = stripeStatus?.payouts_enabled;
  const isPending = badge?.stripe_connect_account_id && !isActive;
  const isUnlinked = !badge?.stripe_connect_account_id;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-500" />
          Payout Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {isActive && (
          <>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Stripe Connect Active</p>
                <p className="text-xs text-emerald-600">
                  {stripeStatus.email || "Account verified"} · {(stripeStatus.default_currency || "USD").toUpperCase()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Payout schedule", val: "Monthly, 1st" },
                { label: "Minimum threshold", val: "$50.00" },
                { label: "Currency", val: (stripeStatus.default_currency || "usd").toUpperCase() },
                { label: "Account ID", val: stripeStatus.account_id?.slice(0, 18) + "…" },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="font-medium text-slate-700">{r.val}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs gap-2" asChild>
              <a href={`https://dashboard.stripe.com/`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" /> Manage in Stripe Dashboard
              </a>
            </Button>
          </>
        )}

        {isPending && (
          <>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Onboarding Incomplete</p>
                <p className="text-xs text-amber-700 mt-0.5">Finish your Stripe account setup to enable payouts.</p>
              </div>
            </div>
            <Button onClick={onConnect} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Resume Stripe Onboarding
            </Button>
          </>
        )}

        {isUnlinked && (
          <>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-600 font-semibold mb-1">Setup Required</p>
              <p className="text-xs text-slate-500">Connect your bank account to receive monthly payouts. Payouts are held until setup is complete.</p>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: Zap, title: "~5 minute setup", desc: "Via Stripe Express onboarding" },
                { icon: ShieldCheck, title: "Bank-grade security", desc: "We never store banking details" },
                { icon: CheckCircle2, title: "Monthly deposits", desc: "Auto-paid on the 1st" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100"><Icon className="w-3.5 h-3.5 text-slate-500" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">{title}</p>
                    <p className="text-[11px] text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={onConnect} disabled={loading} className="w-full bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Set Up Payouts via Stripe
            </Button>
          </>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="w-3 h-3" />
          Powered by Stripe Connect. We never store your banking details.
        </div>
      </CardContent>
    </Card>
  );
}