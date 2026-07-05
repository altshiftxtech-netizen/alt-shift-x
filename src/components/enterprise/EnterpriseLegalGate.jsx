import React, { useState } from "react";
import { ShieldCheck, ScrollText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ENT-LEGAL-SAFEGUARD-1.0 — the Master Service Agreement + high-stakes
 * disclaimer gate. Must be accepted before any key is revealed or ingested.
 */
export default function EnterpriseLegalGate({ open, onAccept, onClose }) {
  const [scrolledEnd, setScrolledEnd] = useState(false);
  if (!open) return null;

  const onScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setScrolledEnd(true);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[86vh] flex flex-col rounded-2xl border overflow-hidden"
        style={{ background: "linear-gradient(180deg,#0c0e14,#07080c)", borderColor: "#C8A95B44" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white z-10"><X className="w-5 h-5" /></button>
        <div className="px-7 pt-7 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#C8A95B] mb-1">
            <ScrollText className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em]">ENT-LEGAL-SAFEGUARD-1.0</span>
          </div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Master Service Agreement & High-Stakes Disclosures
          </h2>
        </div>

        <div onScroll={onScroll} className="px-7 py-5 overflow-y-auto text-[13px] leading-relaxed text-white/70 space-y-4">
          <p><strong className="text-white">1. Master Service Agreement (MSA).</strong> This Sovereign Tier engagement is governed by the Alt+Shift+X Master Service Agreement. By accepting, the executing party warrants it has authority to bind its organization to these enterprise terms, including confidentiality, sub-processor, and security commitments incorporated by reference in the DPA.</p>
          <p><strong className="text-white">2. Air-Gapped Sovereignty.</strong> Keys transmitted via the BT-SECURE-KEY-TRANS-1.0 Secure Handshake are single-issue secrets. The plaintext key is displayed to the recipient exactly once upon ingest and is never recoverable thereafter. You are solely responsible for the custody, rotation, and revocation of ingested keys.</p>
          <p><strong className="text-white">3. High-Stakes Use Disclaimer.</strong> Sovereign intelligence outputs are decision-support instruments, not guarantees. They must not be the sole basis for legal, financial, medical, safety-critical, or life-impacting decisions. Human review by a qualified operator is mandatory before any high-consequence action.</p>
          <p><strong className="text-white">4. Forensic Read-Receipt.</strong> Every key ingest generates a cryptographic forensic receipt hash recording delivery integrity. This receipt constitutes the agreed evidentiary record of transfer and is admissible between the parties for audit and dispute resolution.</p>
          <p><strong className="text-white">5. Builder Seats.</strong> SOVEREIGN-DEV-SEAT-1.0 licenses are per-engineer and non-transferable. Seat holders may manage keys and access system-level SRE dashboards; misuse results in immediate seat revocation without refund.</p>
          <p><strong className="text-white">6. Confidentiality.</strong> The existence, contents, and telemetry of the Sovereign environment are Confidential Information. No disclosure to third parties without prior written consent.</p>
          <p><strong className="text-white">7. Limitation of Liability & Governing Law.</strong> Liability is capped and disclaimed to the maximum extent permitted by law under the terms of the MSA. Governing law and venue are as set forth in the executed MSA.</p>
          <p className="text-white/40 italic">Scroll to the end to enable acceptance. Acceptance is logged with your account identity and timestamp.</p>
        </div>

        <div className="px-7 py-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-xs text-white/50 hover:text-white">Decline</button>
          <Button
            disabled={!scrolledEnd}
            onClick={onAccept}
            className="font-semibold text-[#0A0A0C] disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            {scrolledEnd ? "Accept MSA & Proceed" : "Read to the end to accept"}
          </Button>
        </div>
      </div>
    </div>
  );
}