import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Wrench } from "lucide-react";

/**
 * Persistent advisory monitoring — BOB and The Upkeeper are hard-coded into the
 * Sovereign page's data context as always-on advisors.
 */
export const SOVEREIGN_ADVISORS = [
  {
    key: "bob",
    name: "BOB",
    role: "Chief Build & Strategy Advisor",
    line: "Monitoring your enterprise stack for build, revenue, and deployment leverage.",
    to: "/builder/bob",
    icon: BrainCircuit,
    accent: "#39E6B0",
  },
  {
    key: "upkeeper",
    name: "The Upkeeper",
    role: "Operations & Continuity Steward",
    line: "Watching content, compliance, and platform hygiene across your domain.",
    to: "/admin/upkeeper",
    icon: Wrench,
    accent: "#C8A95B",
  },
];

export default function AdvisoryAgentsStrip() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {SOVEREIGN_ADVISORS.map((a) => (
        <Link
          key={a.key}
          to={a.to}
          className="group flex items-center gap-3 rounded-2xl border p-4 transition-colors"
          style={{ background: "rgba(12,14,20,0.6)", borderColor: `${a.accent}30` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${a.accent}1a`, border: `1px solid ${a.accent}40` }}>
            <a.icon className="w-5 h-5" style={{ color: a.accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">{a.name}</p>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: a.accent, boxShadow: `0 0 8px ${a.accent}` }} />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: a.accent }}>Live</span>
            </div>
            <p className="text-[11px] text-white/40">{a.role}</p>
            <p className="text-[11px] text-white/55 mt-0.5 truncate">{a.line}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}