import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Loader2, Wallet, Pencil } from "lucide-react";

/**
 * PaypalPayoutSection — lets a builder save the PayPal email where payouts are sent.
 * Props:
 *   badge     — the BuilderBadge record (has paypal_payout_email)
 *   onSaved   — called after a successful save so the parent can reload
 */
export default function PaypalPayoutSection({ badge, onSaved }) {
  const saved = badge?.paypal_payout_email;
  const [editing, setEditing] = useState(!saved);
  const [email, setEmail] = useState(saved || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEmail(badge?.paypal_payout_email || "");
    setEditing(!badge?.paypal_payout_email);
  }, [badge?.paypal_payout_email]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await base44.functions.invoke("savePaypalPayoutEmail", { paypal_email: email });
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setEditing(false);
      if (onSaved) await onSaved();
    }
    setSaving(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#003087]" />
          PayPal Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {saved && !editing ? (
          <>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-[#003087] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#003087]">PayPal Connected</p>
                <p className="text-xs text-blue-600 truncate">{saved}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" /> Change PayPal Email
            </Button>
          </>
        ) : (
          <>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-600 font-semibold mb-1">Receive payouts via PayPal</p>
              <p className="text-xs text-slate-500">Enter the email tied to your PayPal account. Approved earnings are sent there directly.</p>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@paypal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button onClick={handleSave} disabled={saving || !email.trim()} className="w-full bg-[#003087] hover:bg-[#00256b] text-white text-sm gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Save PayPal Email
              </Button>
            </div>
          </>
        )}
        <div className="text-[10px] text-slate-400">
          Powered by PayPal Payouts. We never store your PayPal password.
        </div>
      </CardContent>
    </Card>
  );
}