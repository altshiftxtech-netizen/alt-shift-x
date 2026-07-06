import React, { useState } from "react";
import { Loader2, Building2, ShieldCheck, Lock, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmForensicAlert from "./EmForensicAlert";
import EmLegalDocModal from "./EmLegalDocModal";
import {
  EM_MSA_CODE, EM_DPA_CODE, EM_PAYMENT_DISCLAIMER_CODE,
  EM_PAYMENT_DISCLAIMER_TEXT, EM_CLICKWRAP_TEXT,
} from "./emLegalDocs";

const AMBER = "#E6A94B";
const MONO = "'Courier New', 'JetBrains Mono', monospace";

/**
 * EmPaymentGate — the Forensic Noir checkout gate for ExpertMinds Enterprise.
 *
 * Renders: a "Forensic Alert" AI-output notice atop the billing summary, an
 * amber PAYMENT-DISCLAIMER box, a mandatory clickwrap checkbox with a scan-line
 * animation, and the "Activate Enterprise Tier" button which stays disabled
 * until the box is checked. On activate it logs the time-stamped consent
 * (legal_hash) under GSP-MASTER-INDEX-1.0 then calls onActivate(legal_hash).
 */
export default function EmPaymentGate({ priceLabel = "$10,000 / month", onActivate }) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openCode, setOpenCode] = useState(null);

  const activate = async () => {
    if (!checked || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("expertMindsOrgOps", {
        action: "accept_legal",
        accepted_codes: [EM_MSA_CODE, EM_DPA_CODE, EM_PAYMENT_DISCLAIMER_CODE],
        clickwrap_text: EM_CLICKWRAP_TEXT,
      });
      const hash = res.data?.legal_hash;
      if (!hash) { setError(res.data?.error || "Could not record consent."); setBusy(false); return; }
      await onActivate?.(hash);
    } catch {
      setError("Could not record consent. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: "#0A0A0C", border: `1px solid ${AMBER}44`, boxShadow: `0 20px 60px -24px rgba(0,0,0,0.8)` }}
    >
      {/* Forensic Alert — top of the billing summary */}
      <EmForensicAlert className="mb-4" />

      {/* Billing summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: `${AMBER}aa`, fontFamily: MONO }}>Enterprise Tier</p>
          <p className="text-lg font-bold text-white">ExpertMinds Enterprise Core</p>
        </div>
        <span className="text-sm font-bold" style={{ color: AMBER, fontFamily: MONO }}>{priceLabel}</span>
      </div>

      {/* Amber PAYMENT-DISCLAIMER box */}
      <div
        className="forensic-scanbox rounded-lg px-4 py-3 mb-4"
        style={{ background: "rgba(230,169,75,0.05)", border: `1px solid ${AMBER}55` }}
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: `${AMBER}cc`, fontFamily: MONO }}>
          {EM_PAYMENT_DISCLAIMER_CODE}
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: "#E9D9B8", fontFamily: MONO }}>
          {EM_PAYMENT_DISCLAIMER_TEXT}
        </p>
      </div>

      {/* Mandatory clickwrap — scan-line checkbox */}
      <button
        type="button"
        onClick={() => setChecked((v) => !v)}
        className={`forensic-scanbox w-full flex items-start gap-3 text-left rounded-lg px-4 py-3 mb-4 transition-colors ${checked ? "is-checked" : ""}`}
        style={{
          background: checked ? "rgba(230,169,75,0.1)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${checked ? AMBER : `${AMBER}44`}`,
        }}
      >
        <span
          className="mt-0.5 w-5 h-5 rounded shrink-0 flex items-center justify-center transition-all"
          style={{ background: checked ? AMBER : "transparent", border: `1.5px solid ${AMBER}` }}
        >
          {checked && <Check className="w-3.5 h-3.5" style={{ color: "#0A0A0C" }} strokeWidth={3} />}
        </span>
        <span className="text-[12px] leading-relaxed" style={{ color: checked ? "#F0E2C4" : "#C9BCA0", fontFamily: MONO }}>
          {EM_CLICKWRAP_TEXT}
        </span>
      </button>

      {/* Doc links */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[11px]">
        <button onClick={() => setOpenCode(EM_MSA_CODE)} className="hover:opacity-80" style={{ color: AMBER, fontFamily: MONO, textDecoration: "underline", textUnderlineOffset: "3px" }}>&gt; Read MSA</button>
        <button onClick={() => setOpenCode(EM_DPA_CODE)} className="hover:opacity-80" style={{ color: AMBER, fontFamily: MONO, textDecoration: "underline", textUnderlineOffset: "3px" }}>&gt; Read DPA</button>
      </div>

      {/* Activate — disabled until clickwrap checked */}
      <button
        onClick={activate}
        disabled={!checked || busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all disabled:cursor-not-allowed"
        style={{
          background: checked ? `linear-gradient(90deg, ${AMBER}, #D9B96B)` : "rgba(255,255,255,0.06)",
          color: checked ? "#0A0A0C" : "rgba(255,255,255,0.35)",
          border: `1px solid ${checked ? AMBER : "rgba(255,255,255,0.1)"}`,
        }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : checked ? <Building2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        {busy ? "Recording consent…" : "Activate Enterprise Tier"}
      </button>

      {error && <p className="text-xs text-red-400 text-center mt-3">{error}</p>}
      <p className="text-[10px] text-center mt-3 flex items-center justify-center gap-1.5" style={{ color: `${AMBER}88`, fontFamily: MONO }}>
        <ShieldCheck className="w-3 h-3" /> Consent time-stamped & hashed under GSP-MASTER-INDEX-1.0
      </p>

      <EmLegalDocModal code={openCode} onClose={() => setOpenCode(null)} />
    </div>
  );
}