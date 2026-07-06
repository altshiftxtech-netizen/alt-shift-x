import React from "react";
import { X, FileText } from "lucide-react";
import { getEmLegalDoc } from "./emLegalDocs";

const AMBER = "#E6A94B";

/**
 * EmLegalDocModal — Forensic Noir reader for a single legal document
 * (MSA / DPA / Payment Disclaimer). Deep-gray/black background, amber
 * mono-spaced record text, crisp borders.
 */
export default function EmLegalDocModal({ code, onClose }) {
  const doc = code ? getEmLegalDoc(code) : null;
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(3,3,4,0.9)" }}>
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
        style={{ background: "#0A0A0C", border: `1px solid ${AMBER}44`, boxShadow: `0 0 50px rgba(0,0,0,0.8)` }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: `${AMBER}22` }}>
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] truncate" style={{ color: `${AMBER}aa`, fontFamily: "'Courier New', monospace" }}>{doc.code}</p>
              <p className="text-sm font-bold text-white truncate">{doc.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <pre
            className="whitespace-pre-wrap text-[12px] leading-relaxed"
            style={{ color: "#E9D9B8", fontFamily: "'Courier New', 'JetBrains Mono', monospace" }}
          >
            {doc.body}
          </pre>
        </div>

        <div className="px-5 py-2.5 border-t text-[10px]" style={{ borderColor: `${AMBER}22`, color: `${AMBER}88`, fontFamily: "'Courier New', monospace" }}>
          Last updated {doc.updated} · Recorded under GSP-MASTER-INDEX-1.0
        </div>
      </div>
    </div>
  );
}