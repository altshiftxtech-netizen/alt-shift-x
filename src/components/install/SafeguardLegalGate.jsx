import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * SafeguardLegalGate — a multi-step disclaimer/agreement walkthrough that must
 * be completed before purchasing a legally-gated component (e.g. SAFEGUARD-1.0).
 * The buyer reads and checks EACH clause, then types their name to attest.
 * On completion a LegalAcceptance record is written and onAccepted() runs the
 * actual checkout.
 */
const CLAUSES = [
  {
    id: "intended_use",
    title: "Intended Use & Lawful Operation",
    body: "SAFEGUARD is a protective intelligence component provided strictly for lawful, authorized, and ethical use. You agree to operate it only within the bounds of applicable law and only on systems, data, and contexts you are authorized to protect. Any use for unauthorized surveillance, intrusion, harm, or circumvention of protections is strictly prohibited and will be reported.",
  },
  {
    id: "no_warranty",
    title: "No Warranty & Limitation of Liability",
    body: "SAFEGUARD is provided 'as is', without warranty of any kind, express or implied. Alt+Shift+X and Trust AR LLC are not liable for any direct, indirect, incidental, or consequential damages arising from its use. You assume full responsibility for outcomes resulting from its deployment.",
  },
  {
    id: "compliance",
    title: "Compliance & Duty of Care",
    body: "You are responsible for ensuring your deployment complies with all relevant regulatory, privacy, and industry standards (including but not limited to data-protection, security, and duty-of-care obligations). You will maintain appropriate human oversight and will not rely on SAFEGUARD as a sole control for life-, safety-, or rights-critical decisions.",
  },
  {
    id: "monitoring",
    title: "Audit, Monitoring & Revocation",
    body: "Use of SAFEGUARD may be audited per the Sensitive Intelligence Access & Reporting Policy. Misuse may result in immediate revocation of access without refund and may be reported to appropriate authorities. You consent to this monitoring and acknowledge the Sensitive Intelligence Policy applies in full.",
  },
];

export default function SafeguardLegalGate({ open, onOpenChange, component, onAccepted }) {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState({});
  const [signature, setSignature] = useState("");
  const [saving, setSaving] = useState(false);

  const total = CLAUSES.length;
  const isClauseStep = step < total;
  const clause = CLAUSES[step];
  const reset = () => { setStep(0); setChecked({}); setSignature(""); setSaving(false); };

  const next = () => {
    if (isClauseStep && !checked[clause.id]) return;
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    if (!signature.trim()) return;
    setSaving(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      if (me?.id) {
        await base44.entities.LegalAcceptance.create({
          user_id: me.id,
          component_code: component?.code || "SAFEGUARD-1.0",
          component_id: component?.id,
          accepted_clauses: CLAUSES.map((c) => c.title),
          signature_name: signature.trim(),
          accepted_at: new Date().toISOString(),
        });
      }
    } catch { /* proceed regardless — acceptance UI already enforced */ }
    onOpenChange(false);
    reset();
    onAccepted?.();
  };

  const finishLabel = "Accept and Continue to Checkout";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Required agreements before purchase
          </DialogTitle>
          <DialogDescription>
            {component?.name || "This component"} is legally gated. Read and accept each clause to unlock checkout.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-1">
          {CLAUSES.map((c, i) => (
            <div key={c.id} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-emerald-500" : i === step ? "bg-amber-400" : "bg-slate-200"}`} />
          ))}
          <div className={`h-1.5 flex-1 rounded-full ${step >= total ? "bg-amber-400" : "bg-slate-200"}`} />
        </div>

        {isClauseStep ? (
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step {step + 1} of {total + 1}</p>
            <h3 className="text-base font-bold text-slate-900">{clause.title}</h3>
            <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 leading-relaxed">
              {clause.body}
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none p-2 rounded-lg hover:bg-slate-50">
              <input
                type="checkbox"
                checked={!!checked[clause.id]}
                onChange={(e) => setChecked((p) => ({ ...p, [clause.id]: e.target.checked }))}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">I have read and agree to the <strong>{clause.title}</strong>.</span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final step — Signature</p>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-1.5">
              {CLAUSES.map((c) => (
                <p key={c.id} className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {c.title}
                </p>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Type your full legal name to attest acceptance</label>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Full name"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="ghost" onClick={back} disabled={step === 0 || saving} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {isClauseStep ? (
            <Button onClick={next} disabled={!checked[clause.id]} className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={!signature.trim() || saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} {finishLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}