import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

export default function TwoFactorPanel() {
  const [step, setStep] = useState("idle"); // idle | verifying | enabled
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("verify2FA", { totp_code: code });
      if (res.data?.verified) {
        setStep("enabled");
      } else {
        setError("That code wasn't valid. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "enabled") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="w-4 h-4" /> Two-factor authentication is enabled.
      </div>
    );
  }

  if (step === "verifying") {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">Enter the 6-digit code from your authenticator app to confirm.</p>
        <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button className="text-sm h-9 gap-2" disabled={loading || code.length < 6} onClick={handleVerify}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Confirm & Enable
          </Button>
          <Button variant="ghost" className="text-sm h-9" onClick={() => { setStep("idle"); setCode(""); setError(""); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="outline" className="text-sm gap-2" onClick={() => setStep("verifying")}>
      <ShieldCheck className="w-4 h-4" /> Enable 2FA
    </Button>
  );
}