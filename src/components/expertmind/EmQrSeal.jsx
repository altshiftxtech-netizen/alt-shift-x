import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck } from "lucide-react";
import { EM } from "./emTokens";

/**
 * QR-Seal Integrity block (Handover Card §4). Renders the forensic evidence
 * hash as a scannable QR code so a court/clinician can verify the "unzipped"
 * verdict matches the original "zipped" Super-Token signature.
 */
export default function EmQrSeal({ hash }) {
  if (!hash) return null;
  const payload = `EM-QR-SEAL:${hash}`;

  return (
    <div
      className="flex items-center gap-3 mt-3 pt-3"
      style={{ borderTop: `1px solid ${EM.border}` }}
    >
      <div className="rounded-lg p-1.5 bg-white" style={{ border: `1px solid ${EM.border}` }}>
        <QRCodeSVG value={payload} size={52} level="M" fgColor={EM.primary} bgColor="#FFFFFF" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: EM.accent }} />
          <span className="text-[11px] font-bold" style={{ color: EM.text }}>QR-Seal Integrity</span>
        </div>
        <p className="text-[10px] mt-0.5 leading-snug" style={{ color: EM.muted }}>
          Scan to verify evidence signature
        </p>
        <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: EM.muted }}>…{hash}</p>
      </div>
    </div>
  );
}