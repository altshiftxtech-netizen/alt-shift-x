import React, { useState } from "react";
import { Users, Crown, Bot, ShieldCheck, GraduationCap, Check } from "lucide-react";
import { EM } from "./emTokens";

const CASES = [
  {
    key: "succession", icon: Crown, title: "Succession planning",
    lead: "Preserve leadership knowledge before turnover.",
    points: ["Capture executive judgment", "Reduce institutional memory loss", "Accelerate new leader onboarding"],
  },
  {
    key: "leadership", icon: Users, title: "Leadership capture",
    lead: "Turn your best operators into reusable intelligence.",
    points: ["Document decision frameworks", "Standardize high-trust judgment", "Scale expertise across teams"],
  },
  {
    key: "copilots", icon: Bot, title: "Internal copilots",
    lead: "Deploy expert-grounded assistants inside your org.",
    points: ["Ground answers in verified expertise", "Cut ramp time for new hires", "Keep knowledge in-house and governed"],
  },
  {
    key: "compliance", icon: ShieldCheck, title: "Compliance intelligence",
    lead: "Encode regulatory judgment into governed assets.",
    points: ["Capture interpretation, not just rules", "Maintain a consent-based audit trail", "Reduce compliance key-person risk"],
  },
  {
    key: "training", icon: GraduationCap, title: "Training systems",
    lead: "Build training programs from real expert insight.",
    points: ["Structure tacit knowledge into curricula", "Deliver consistent, verified guidance", "Update as expertise evolves"],
  },
];

export default function EmEnterprise() {
  const [active, setActive] = useState(CASES[0].key);
  const current = CASES.find((c) => c.key === active) || CASES[0];

  return (
    <section id="enterprise-use-cases" style={{ background: EM.surface }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight" style={{ color: EM.primary }}>Enterprise use cases</h2>
        <p className="mt-3 text-[16px] max-w-xl" style={{ color: EM.muted }}>Where governed knowledge capture creates operational leverage.</p>

        <div className="grid lg:grid-cols-12 gap-6 mt-12">
          {/* Left rail */}
          <div className="lg:col-span-4 space-y-2">
            {CASES.map((c) => {
              const isActive = c.key === active;
              return (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  className="w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl transition-colors"
                  style={{
                    background: isActive ? EM.primary : EM.bg,
                    border: `1px solid ${isActive ? EM.primary : EM.border}`,
                    color: isActive ? "#fff" : EM.primary,
                  }}
                >
                  <c.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} style={{ color: isActive ? EM.accentSoft : EM.accent }} />
                  <span className="text-[14px] font-semibold">{c.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl p-8 h-full" style={{ background: EM.bg, border: `1px solid ${EM.border}` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: EM.accentSoft }}>
                  <current.icon className="w-5 h-5" strokeWidth={1.75} style={{ color: EM.accent }} />
                </div>
                <h3 className="text-[22px] font-semibold" style={{ color: EM.primary }}>{current.title}</h3>
              </div>
              <p className="text-[16px] leading-relaxed mb-6" style={{ color: EM.muted }}>{current.lead}</p>
              <ul className="space-y-3">
                {current.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[15px]" style={{ color: EM.text }}>
                    <Check className="w-4 h-4 mt-1 shrink-0" strokeWidth={2.5} style={{ color: EM.accent }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}