import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, Ticket } from "lucide-react";
import { base44 } from "@/api/base44Client";

const VESTED_LIMIT = 100;

export default function Vested100Tab() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupRunning, setSetupRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const loadCount = async () => {
    try {
      const vested = await base44.asServiceRole?.entities?.Subscription?.filter({ vested100: true });
      setCount((vested || []).length);
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCount(); }, []);

  const runSetup = async () => {
    setSetupRunning(true);
    setError(null);
    setResult(null);
    const res = await base44.functions.invoke("setupVested100", {});
    if (res.data?.coupon_id) {
      setResult(res.data);
    } else {
      setError(res.data?.error || "Setup failed. Make sure you're an admin.");
    }
    setSetupRunning(false);
  };

  const remaining = count != null ? Math.max(0, VESTED_LIMIT - count) : null;
  const full = count != null && count >= VESTED_LIMIT;

  return (
    <div className="space-y-4">
      {/* Program overview */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-100 rounded-xl"><Sparkles className="w-5 h-5 text-violet-600" /></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Vested100 Beta Program</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                The first <strong>100 paid builder subscriptions</strong> automatically get <strong>50% off for 1 year</strong>.
                Each beta builder is emailed the <code className="bg-slate-100 px-1 rounded">VESTED100</code> promo code on first purchase, which they can reuse on future builder plans. The promo code expires one year from setup. After 100 subscriptions, pricing returns to full.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live counter */}
      <Card>
        <CardContent className="py-5">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
            <>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-3xl font-black text-slate-900">{count}<span className="text-base font-semibold text-slate-400"> / {VESTED_LIMIT}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">{full ? "Beta is full — pricing back to full price" : `${remaining} beta slots remaining`}</p>
                </div>
                {full && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">FULL</span>}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.min(100, (count / VESTED_LIMIT) * 100)}%` }} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Setup */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm font-bold text-slate-900 mb-1">One-Time Stripe Setup</p>
          <p className="text-xs text-slate-500 mb-4">Creates the 50%-off coupon and the <code className="bg-slate-100 px-1 rounded">VESTED100</code> promo code in Stripe. Safe to run multiple times — it won't create duplicates.</p>
          <Button onClick={runSetup} disabled={setupRunning} className="bg-violet-600 hover:bg-violet-700 text-sm gap-2">
            {setupRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
            {setupRunning ? "Setting up…" : "Create / Verify Coupon + Promo Code"}
          </Button>

          {result && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Stripe is ready.</p>
              <p>Coupon: <code className="bg-white px-1 rounded">{result.coupon_id}</code></p>
              <p>Promo code: <code className="bg-white px-1 rounded">{result.promo_code}</code> · expires {new Date(result.expires_at * 1000).toLocaleDateString()}</p>
            </div>
          )}
          {error && <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}