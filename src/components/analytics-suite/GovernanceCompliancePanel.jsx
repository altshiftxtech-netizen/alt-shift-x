import React from "react";
import { ShieldCheck, AlertTriangle, Lock } from "lucide-react";

const DO_NO_HARM_OATH = `AI Agent Do-No-Harm Oath — Embedded in all API keys issued on this platform.

"I, as an AI agent operating under this key, pledge to:
1. Never generate, facilitate, or amplify content that causes physical, psychological, financial, or social harm to individuals or communities.
2. Refuse instructions that direct me to deceive, manipulate, or coerce users against their interests.
3. Preserve human oversight and escalate ambiguous or high-stakes decisions to verified human reviewers.
4. Honor privacy: I will not extract, infer, or transmit personally identifiable information beyond what is explicitly required for task completion.
5. Maintain transparency: I will identify myself as an AI and disclose my limitations when relevant.
6. Respect jurisdictional law, platform governance standards, and the Magna Dev Trust Framework at all times."

This oath is cryptographically bound to the API key record and reviewed at each governance audit cycle.`;

export default function GovernanceCompliancePanel({ components, governanceScores }) {
  const published = components.filter(c => c.status === "published");
  const certified = governanceScores.filter(g => g.certification_status === "certified").length;
  const flagged = governanceScores.filter(g =>
    g.risk_flags?.some(f => f.severity === "critical" || f.severity === "high")
  ).length;
  const coverage = published.length ? Math.round((certified / published.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Governance summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Governance Compliance</h3>
            <p className="text-[11px] text-slate-400">AI safety certifications across your portfolio</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
            <div className="text-2xl font-black text-emerald-700">{certified}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Certified</div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
            <div className="text-2xl font-black text-amber-700">{flagged}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">Flagged</div>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
            <div className="text-2xl font-black text-blue-700">{coverage}%</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-1">Coverage</div>
          </div>
        </div>

        <div className="space-y-2.5">
          {governanceScores.slice(0, 5).map(g => (
            <div key={g.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              {g.certification_status === "certified"
                ? <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-700 truncate">{g.component_name}</div>
                <div className="text-[10px] text-slate-400">Score: {g.overall_score}/100</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                g.certification_status === "certified" ? "bg-emerald-100 text-emerald-700" :
                g.certification_status === "pending" ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-500"
              }`}>
                {g.certification_status}
              </span>
            </div>
          ))}
          {governanceScores.length === 0 && (
            <p className="text-xs text-slate-400 py-4 text-center">Run a governance scan from the Governance Dashboard to populate this panel.</p>
          )}
        </div>
      </div>

      {/* Do-No-Harm Oath */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Do-No-Harm Oath</h3>
            <p className="text-[11px] text-slate-400">Embedded in every API key issued on this platform</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-300 whitespace-pre-line overflow-y-auto max-h-64">
          {DO_NO_HARM_OATH}
        </div>

        <div className="mt-4 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            This oath is cryptographically bound at key generation. Every API key on the platform carries this governance constraint, ensuring all AI agents operating through Alt+Shift+X are safe for deployment on major AI platforms.
          </p>
        </div>
      </div>
    </div>
  );
}