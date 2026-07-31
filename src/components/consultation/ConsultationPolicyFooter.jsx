import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, X, Loader2 } from "lucide-react";

const POLICY_CODES = [
  "SOV-LEGAL-CONSULT-TERMS-1.0",
  "SOV-PRIVACY-CONSULT-1.0",
  "SOV-RESIDENT-CONSULTANT-NDA-1.0",
  "SOV-SHELL-DISCLAIMER-1.0",
  "SOV-APEX-CONSULTATION-EXECUTIVE-1.0",
];

export default function ConsultationPolicyFooter() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.Component.filter({ code: { $in: POLICY_CODES } });
        // Preserve canonical order
        const ordered = POLICY_CODES.map((c) => (rows || []).find((r) => r.code === c)).filter(Boolean);
        setPolicies(ordered);
      } catch {
        setPolicies([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-3">
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-[#484f58]" />
        ) : (
          policies.map((p, i) => (
            <React.Fragment key={p.id}>
              <button
                onClick={() => setActive(p)}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8b949e] hover:text-[#C8A95B] transition-colors"
              >
                <FileText className="w-2.5 h-2.5" />
                {p.name || p.code}
              </button>
              {i < policies.length - 1 && <span className="text-[#30363d] text-[10px]">·</span>}
            </React.Fragment>
          ))
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70" onClick={() => setActive(null)}>
          <div
            className="max-w-xl w-full max-h-[80vh] rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
              <div>
                <p className="text-[9px] font-mono text-[#C8A95B] uppercase tracking-[0.2em]">{active.code}</p>
                <h3 className="text-sm font-bold text-white mt-0.5">{active.name}</h3>
              </div>
              <button onClick={() => setActive(null)} className="p-1.5 rounded-lg text-[#8b949e] hover:bg-[#0d1117] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 text-xs text-[#c9d1d9] leading-relaxed whitespace-pre-line">
              {active.long_description || "No description available."}
            </div>
            <div className="px-5 py-3 border-t border-[#30363d] bg-[#161b22] flex justify-end">
              <button onClick={() => setActive(null)} className="text-[11px] font-mono text-[#8b949e] hover:text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}