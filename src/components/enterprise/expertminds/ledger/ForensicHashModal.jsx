import React from "react";
import { X, Fingerprint } from "lucide-react";

const GOLD = "#C8A95B";

/**
 * ForensicHashModal — clicking a Forensic Hash pops up the raw JSON "bit-stamp"
 * of the event. Forensic Noir styling, mono-spaced JSON dump.
 */
export default function ForensicHashModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border overflow-hidden"
        style={{ borderColor: `${GOLD}55`, background: "#0b0a07", boxShadow: `0 30px 80px -20px rgba(0,0,0,0.9)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${GOLD}33` }}>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Forensic Bit-Stamp</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 font-mono text-[11px] break-all" style={{ color: GOLD }}>
            {row.forensic_hash}
          </div>
          <pre
            className="rounded-lg p-4 text-[11px] leading-relaxed font-mono text-emerald-300/90 overflow-auto max-h-[50vh]"
            style={{ background: "#050503", border: "1px solid #ffffff12" }}
          >
{JSON.stringify(row.raw, null, 2)}
          </pre>
          <p className="text-[10px] text-white/35 text-center">Registered under GSP-MASTER-INDEX-1.0 · SOVEREIGN-MASTER-LEDGER-1.0</p>
        </div>
      </div>
    </div>
  );
}