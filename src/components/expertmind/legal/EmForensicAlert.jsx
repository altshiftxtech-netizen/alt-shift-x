import React from "react";
import { AlertTriangle } from "lucide-react";
import { EM_AI_NOTICE_TEXT } from "./emLegalDocs";

const AMBER = "#E6A94B";

/**
 * EmForensicAlert — the small italicized "Forensic Alert" that sits at the very
 * top of the billing summary. Amber icon + AI-protocol notice.
 */
export default function EmForensicAlert({ className = "" }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-md px-3 py-2 ${className}`}
      style={{ background: "rgba(230,169,75,0.06)", border: `1px solid ${AMBER}33` }}
    >
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: AMBER }} />
      <p
        className="text-[11px] italic leading-snug"
        style={{ color: AMBER, fontFamily: "'Courier New', 'JetBrains Mono', monospace" }}
      >
        {EM_AI_NOTICE_TEXT}
      </p>
    </div>
  );
}