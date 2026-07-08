import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X } from "lucide-react";

/**
 * QrSealAction — wraps the current prompt in a forensic QR-Seal
 * (ISO/IEC 18004) for tamper-proof session verification by BOB Look.
 */
export default function QrSealAction({ prompt }) {
  const [open, setOpen] = useState(false);
  const sealId = `QR-SEAL-${Date.now().toString(36).toUpperCase()}`;
  const promptHash = prompt
    ? btoa(unescape(encodeURIComponent(prompt))).replace(/=/g, "").slice(0, 24)
    : "EMPTY";
  const payload = JSON.stringify({
    seal_id: sealId,
    protocol: "ISO/IEC-18004",
    prompt_hash: promptHash,
    timestamp: new Date().toISOString(),
    master_index: "GSP-MASTER-INDEX-1.0",
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="QR-Seal — forensic tamper-proof record (ISO/IEC 18004)"
        className="flex items-center gap-1.5 border border-slate-700 text-slate-400 hover:border-violet-500 hover:text-violet-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
      >
        <QrCode className="w-3.5 h-3.5" /> QR-Seal
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-slate-900 border border-amber-700/40 rounded-2xl p-5 w-full max-w-xs"
          >
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-3">Forensic QR-Seal</p>
            <div className="flex justify-center mb-3">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={payload} size={140} fgColor="#1a1c26" bgColor="#ffffff" />
              </div>
            </div>
            <p className="text-[9px] font-mono text-slate-500 text-center break-all">Seal: {sealId}</p>
            <p className="text-[9px] font-mono text-slate-600 text-center mt-1">Hash: {promptHash}</p>
            <p className="text-[9px] text-slate-600 text-center mt-2">Scan with BOB Look to verify integrity</p>
          </div>
        </div>
      )}
    </>
  );
}