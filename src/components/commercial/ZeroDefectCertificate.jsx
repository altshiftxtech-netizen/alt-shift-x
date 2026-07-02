import React from "react";
import { ShieldCheck, AlertTriangle, BadgeCheck } from "lucide-react";

// Honest Zero-Defect Certificate — shows only the checks that actually ran:
// live NetGood governance gate, brand-consistency & prompt-fidelity scoring,
// and AI disclosure. No fabricated 8K/OCR claims.
function Bar({ label, value }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  const color = v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-amber-200/60 mb-0.5">
        <span>{label}</span><span className="font-bold text-amber-100">{v}</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default function ZeroDefectCertificate({ certificate, governance }) {
  if (!certificate) return null;
  const passed = certificate.passed;
  return (
    <div className={`rounded-xl border p-3.5 ${passed ? "border-emerald-800/40 bg-emerald-950/20" : "border-amber-800/40 bg-amber-950/20"}`}>
      <div className="flex items-center gap-2 mb-3">
        {passed
          ? <BadgeCheck className="w-5 h-5 text-emerald-400" />
          : <AlertTriangle className="w-5 h-5 text-amber-400" />}
        <div>
          <p className="text-sm font-bold text-amber-50 leading-none">
            {passed ? "Zero-Defect Certificate" : "Held for Review"}
          </p>
          <p className="text-[10px] text-amber-200/50 mt-0.5">
            {passed ? "All governance & fidelity checks passed" : "Governance concerns flagged below"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Bar label="Brand consistency" value={certificate.brand_consistency} />
        <Bar label="Prompt fidelity" value={certificate.prompt_fidelity} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${certificate.governance_pass ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40" : "bg-red-950/60 text-red-300 border border-red-800/40"}`}>
          <ShieldCheck className="w-2.5 h-2.5" /> NetGood {certificate.governance_pass ? "pass" : "concern"}
        </span>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-800/40">
          AI disclosed
        </span>
        {governance?.score != null && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
            Governance {Math.round(governance.score)}/100
          </span>
        )}
      </div>

      {certificate.notes && <p className="text-[11px] text-amber-200/60 leading-relaxed">{certificate.notes}</p>}

      {governance?.answers?.length > 0 && (
        <details className="mt-2">
          <summary className="text-[10px] text-amber-300/70 cursor-pointer hover:text-amber-200">Seven-question governance gate</summary>
          <ul className="mt-1.5 space-y-1">
            {governance.answers.map((a, i) => {
              const concern = /concern/i.test(a);
              return (
                <li key={i} className={`text-[10px] leading-snug flex gap-1.5 ${concern ? "text-amber-300" : "text-amber-200/50"}`}>
                  <span>{concern ? "⚠" : "✓"}</span><span>{a.replace(/^(pass|concern):\s*/i, "")}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}