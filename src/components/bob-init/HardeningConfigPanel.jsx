import React, { useState } from "react";
import { ShieldCheck, Gauge, FileText, Lock, ChevronDown, CheckSquare, Square } from "lucide-react";

// Default 110% Hardened Standard configuration — fail-closed foundation.
export const DEFAULT_HARDENING = {
  hallucination_guard: true,
  confidence_threshold: 0.85,
  audit_logging: true,
  regulatory_framework: "Blackstone Protocol",
  environment: "production",
  rollback_strategy: "automatic",
  x1_ledger: true,
  x2_sensor: true,
  x4_guard: true,
  x5_healing: true,
};

const FRAMEWORKS = ["Blackstone Protocol", "Forensic Parity", "HIPAA", "GDPR", "SOC 2"];

function Toggle({ label, desc, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${checked ? "border-cyan-500/40 bg-cyan-500/5" : "border-[#30363d] bg-[#010409]"}`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-mono ${checked ? "text-cyan-400" : "text-[#8b949e]"}`}>{label}</p>
        <p className="text-[10px] text-[#484f58]">{desc}</p>
      </div>
      <div className={`w-8 h-4 rounded-full shrink-0 ml-2 transition-colors ${checked ? "bg-cyan-500" : "bg-[#30363d]"}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform mt-0.5 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}

export default function HardeningConfigPanel({ hardening, onChange }) {
  const [open, setOpen] = useState(true);
  const h = { ...DEFAULT_HARDENING, ...hardening };
  const set = (key, val) => onChange({ ...h, [key]: val });

  // Regulatory frameworks are multi-select (checkboxes). Stored as a comma-joined
  // string in `regulatory_framework` to stay compatible with the existing schema.
  const frameworks = (h.regulatory_framework || "").split(",").map((s) => s.trim()).filter(Boolean);
  const toggleFramework = (f) => {
    const next = frameworks.includes(f) ? frameworks.filter((x) => x !== f) : [...frameworks, f];
    set("regulatory_framework", next.join(", "));
  };

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-1.5 text-xs font-mono text-[#8b949e] uppercase tracking-wider px-3 pt-3 pb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 110% Hardening
        <ChevronDown className={`w-3.5 h-3.5 ml-auto text-[#484f58] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
      <div className="px-3 pb-3 space-y-3">

      <Toggle label="Hallucination Guard" desc="Fail-closed — blocks low-confidence outputs" checked={h.hallucination_guard} onToggle={() => set("hallucination_guard", !h.hallucination_guard)} />
      <Toggle label="Audit Logging" desc="Immutable hash-chain of all decisions" checked={h.audit_logging} onToggle={() => set("audit_logging", !h.audit_logging)} />

      <div className="rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-[#8b949e] flex items-center gap-1"><Gauge className="w-3 h-3" /> Confidence Threshold</span>
          <span className="text-xs font-mono text-cyan-400 font-bold">{h.confidence_threshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.0"
          step="0.05"
          value={h.confidence_threshold}
          onChange={(e) => set("confidence_threshold", parseFloat(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-[#484f58] flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Regulatory Frameworks (select all that apply)</label>
        <div className="grid grid-cols-1 gap-1">
          {FRAMEWORKS.map((f) => {
            const on = frameworks.includes(f);
            return (
              <button key={f} type="button" onClick={() => toggleFramework(f)} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all ${on ? "border-cyan-500/40 bg-cyan-500/5" : "border-[#30363d] bg-[#010409]"}`}>
                {on ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Square className="w-3.5 h-3.5 text-[#484f58] shrink-0" />}
                <span className={`text-xs font-mono ${on ? "text-cyan-400" : "text-[#8b949e]"}`}>{f}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 pt-1 border-t border-[#30363d]">
        <p className="text-[10px] font-mono text-[#484f58] uppercase pt-1">Sovereign Triad Stack</p>
        <Toggle label="X1 — Forensic Ledger" desc="Immutable auditor — hashes every decision" checked={h.x1_ledger} onToggle={() => set("x1_ledger", !h.x1_ledger)} />
        <Toggle label="X2 — Friction Sensor" desc="Predicts failure via confidence + latency" checked={h.x2_sensor} onToggle={() => set("x2_sensor", !h.x2_sensor)} />
        <Toggle label="X4 — Logic Canary" desc="Peer-reviews high-stakes actions" checked={h.x4_guard} onToggle={() => set("x4_guard", !h.x4_guard)} />
        <Toggle label="X5 — Self-Healing Executive" desc="Autonomous recovery from logic drift" checked={h.x5_healing} onToggle={() => set("x5_healing", !h.x5_healing)} />
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400/70">
        <Lock className="w-3 h-3" /> Env: {h.environment} · Rollback: {h.rollback_strategy}
      </div>
      </div>
      )}
    </div>
  );
}