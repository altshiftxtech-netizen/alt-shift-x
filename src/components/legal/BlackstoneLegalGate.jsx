import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, X, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOLD = "#C8A95B";

// The Blackstone clauses a user must explicitly accept before release.
const CLAUSES = [
  "I have read and accept the Blackstone Legal Agreement governing this component.",
  "I accept full responsibility for the lawful, licensed, and ethical use of this component.",
  "I understand this component may capture, transmit, or retain data, and I accept those obligations.",
  "I understand this acceptance is permanently logged to the GSP-MASTER-INDEX-1.0 audit registry.",
];

/**
 * BlackstoneLegalGate — the Mandatory Legal Handoff modal.
 *
 * Shown BEFORE any purchase, download, or install of a component in the BIO-,
 * VANA-VOICE-, UNZIP-, or SOVEREIGN- clusters. The action stays blocked until
 * every clause is checked and a typed signature is provided. On acceptance it
 * calls logBlackstoneAcceptance, which writes the immutable acceptance_hash to
 * the master index, and only then fires onCleared(acceptance_hash) so the
 * caller can release the component.
 */
export default function BlackstoneLegalGate({
  open,
  componentCode,
  componentId,
  componentName,
  onCleared,
  onCancel,
}) {
  const [checked, setChecked] = useState({});
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const allChecked = CLAUSES.every((_, i) => checked[i]);
  const canProceed = allChecked && signature.trim().length >= 2;

  const accept = async () => {
    if (!canProceed) return;
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("logBlackstoneAcceptance", {
        component_code: componentCode,
        component_id: componentId || "",
        signature_name: signature.trim(),
        accepted_clauses: CLAUSES.filter((_, i) => checked[i]),
      });
      const hash = res.data?.acceptance_hash;
      if (hash) {
        onCleared?.(hash);
      } else {
        setError(res.data?.error || "Could not record acceptance. Please try again.");
      }
    } catch {
      setError("Could not record acceptance. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ background: "#0b0d14", borderColor: `${GOLD}55` }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10" style={{ background: "rgba(239,68,68,0.08)" }}>
          <ShieldAlert className="w-5 h-5" style={{ color: "#F87171" }} />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Blackstone Legal Handoff</p>
            <h3 className="text-base font-bold text-white">Legal Clearance Required</h3>
          </div>
          <button onClick={onCancel} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-white/70">
            Before <span className="font-semibold text-white">{componentName || componentCode || "this component"}</span> can be
            purchased, downloaded, or installed, you must accept the Blackstone terms. Your acceptance is sealed with a unique
            <span style={{ color: GOLD }} className="font-semibold"> acceptance hash</span> in the GSP-MASTER-INDEX-1.0 registry.
          </p>

          <div className="space-y-2">
            {CLAUSES.map((clause, i) => (
              <label key={i} className="flex items-start gap-2 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                  className="mt-0.5"
                  style={{ accentColor: GOLD }}
                />
                {clause}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/60 mb-1">Typed signature (full name)</label>
            <input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full legal name"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A95B]"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10">
          <Button variant="outline" onClick={onCancel} className="text-xs border-white/15 text-white/80 bg-transparent hover:bg-white/10">Cancel</Button>
          <Button
            disabled={!canProceed || busy}
            onClick={accept}
            className="text-xs font-bold text-[#0A0A0C]"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Sign &amp; Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}