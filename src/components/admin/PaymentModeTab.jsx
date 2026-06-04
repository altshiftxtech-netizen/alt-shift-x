import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlaskConical, ShieldAlert, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Admin-only control to flip the whole platform's checkout between LIVE payments
// and TEST/Sandbox. Engaging the toggle does nothing until the admin types the
// confirmation code "mm" — a deliberate safeguard against accidental switches.
const CONFIRM_CODE = "mm";

export default function PaymentModeTab() {
  const [mode, setMode] = useState(null);       // current saved record
  const [loading, setLoading] = useState(true);
  const [pendingValue, setPendingValue] = useState(null); // the value the admin wants to switch to
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const rows = await base44.entities.PaymentMode.list("-updated_date", 1);
    setMode(rows[0] || null);
    setLoading(false);
  };

  const isTest = mode?.test_mode === true;

  // Clicking the toggle just *requests* a switch — it stays pending until "mm".
  const requestSwitch = (value) => {
    setPendingValue(value);
    setConfirm("");
    setSaved(false);
  };

  const applySwitch = async () => {
    if (confirm.trim().toLowerCase() !== CONFIRM_CODE) return;
    setSaving(true);
    const user = await base44.auth.me();
    const data = { test_mode: pendingValue, updated_by: user?.email || user?.full_name || "admin" };
    if (mode?.id) {
      await base44.entities.PaymentMode.update(mode.id, data);
    } else {
      await base44.entities.PaymentMode.create(data);
    }
    await load();
    setPendingValue(null);
    setConfirm("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Current status banner */}
      <Card className={isTest ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}>
        <CardContent className="py-5 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isTest ? "bg-amber-100" : "bg-emerald-100"}`}>
            {isTest ? <FlaskConical className="w-6 h-6 text-amber-600" /> : <CreditCard className="w-6 h-6 text-emerald-600" />}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide font-bold text-slate-500">Current Payment Mode</p>
            <p className={`text-xl font-black ${isTest ? "text-amber-700" : "text-emerald-700"}`}>
              {isTest ? "TEST / SANDBOX" : "LIVE — Real Payments"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isTest
                ? "Stripe test keys + PayPal Sandbox. No real money moves."
                : "Stripe live keys + PayPal Live. Real cards are charged."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Switch controls */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Switch Mode</p>
              <p className="text-xs text-slate-400">Choose a mode, then confirm with the code to apply it.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isTest ? "outline" : "default"}
                className={!isTest ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                size="sm"
                onClick={() => requestSwitch(false)}
                disabled={!isTest && pendingValue === null}
              >
                Live
              </Button>
              <Button
                variant={isTest ? "default" : "outline"}
                className={isTest ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                size="sm"
                onClick={() => requestSwitch(true)}
                disabled={isTest && pendingValue === null}
              >
                Test
              </Button>
            </div>
          </div>

          {/* Confirmation gate — appears only when a switch is pending */}
          {pendingValue !== null && pendingValue !== isTest && (
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  You're switching to <strong className={pendingValue ? "text-amber-700" : "text-emerald-700"}>
                    {pendingValue ? "TEST / SANDBOX" : "LIVE"}</strong>. This won't take effect until you type
                  the confirmation code <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">mm</code> below.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applySwitch(); }}
                  placeholder='Type "mm" to confirm'
                  className="max-w-[200px]"
                  autoFocus
                />
                <Button
                  onClick={applySwitch}
                  disabled={confirm.trim().toLowerCase() !== CONFIRM_CODE || saving}
                  className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                  size="sm"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Apply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setPendingValue(null); setConfirm(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {saved && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Payment mode updated.
            </p>
          )}

          {mode?.updated_by && (
            <p className="text-[10px] text-slate-400">Last changed by {mode.updated_by}</p>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-slate-400">
        Note: checkout only runs from the published app, not the preview. Use Stripe test cards (e.g. 4242 4242 4242 4242)
        and a PayPal Sandbox buyer account to validate the full flow.
      </p>
    </div>
  );
}