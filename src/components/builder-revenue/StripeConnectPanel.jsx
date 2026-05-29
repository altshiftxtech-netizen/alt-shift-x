import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck, Zap, Lock } from "lucide-react";

export default function StripeConnectPanel({ connected, onConnect }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    onConnect();
    setTimeout(() => setLoading(false), 1600);
  };

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-800">Payout Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <ConnectedState />
        ) : (
          <DisconnectedState loading={loading} onConnect={handleConnect} />
        )}
      </CardContent>
    </Card>
  );
}

function ConnectedState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Stripe Connect Active</p>
          <p className="text-xs text-emerald-600">Bank account ••••4242 verified</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Payout schedule</span>
          <span className="font-medium text-slate-700">Monthly, 1st</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Minimum threshold</span>
          <span className="font-medium text-slate-700">$50.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Currency</span>
          <span className="font-medium text-slate-700">USD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Platform fee</span>
          <span className="font-medium text-slate-700">30% (Certified)</span>
        </div>
      </div>

      <div className="pt-1 space-y-2">
        <Button variant="outline" className="w-full text-sm border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <ExternalLink className="w-3.5 h-3.5" />
          Manage in Stripe Dashboard
        </Button>
        <Button variant="ghost" className="w-full text-sm text-slate-400 hover:text-slate-600">
          Update bank account
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe Connect. We never store your banking details.</span>
      </div>
    </div>
  );
}

function DisconnectedState({ loading, onConnect }) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm font-semibold text-amber-800 mb-0.5">Setup Required</p>
        <p className="text-xs text-amber-700">
          Connect your bank account to receive monthly payouts. Payouts are held until setup is complete.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { icon: Zap, title: "Instant activation", desc: "Takes ~5 minutes via Stripe" },
          { icon: ShieldCheck, title: "Bank-grade security", desc: "Stripe handles all sensitive data" },
          { icon: CheckCircle2, title: "Monthly deposits", desc: "Paid on the 1st of each month" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-slate-100 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{title}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={onConnect}
        disabled={loading}
        className="w-full bg-violet-700 hover:bg-violet-800 text-white font-semibold text-sm h-10 rounded-xl flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Set Up Payouts via Stripe
          </>
        )}
      </Button>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Lock className="w-3 h-3" />
        <span>Powered by Stripe Connect. We never store your banking details.</span>
      </div>
    </div>
  );
}