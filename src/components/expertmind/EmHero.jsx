import React from "react";
import { ShieldCheck, BadgeCheck, LayoutGrid, Lock, Building2 } from "lucide-react";
import { EM } from "./emTokens";
import { useEmLaunch } from "./EmLaunchContext";
import KnowledgeCockpit from "./KnowledgeCockpit";

const CHIPS = [
  { label: "Consent-based", icon: ShieldCheck },
  { label: "Expert-verified", icon: BadgeCheck },
  { label: "Structured", icon: LayoutGrid },
  { label: "Governed", icon: Lock },
  { label: "Enterprise-ready", icon: Building2 },
];

export default function EmHero() {
  const launch = useEmLaunch();
  return (
    <section id="hero" style={{ background: EM.bg }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left — 5/12 */}
          <div className="lg:col-span-5">
            <img
              src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b0a6e86d1_Copilot_20260705_193928.png"
              alt="expertminds"
              className="h-24 w-auto object-contain mb-6 -ml-1"
              draggable="false"
            />
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: EM.accent }}>
              Human Contribution AI Training Component
            </p>
            <h1
              className="font-bold tracking-tight leading-[1.05] text-[42px] lg:text-[60px]"
              style={{ color: EM.primary }}
            >
              Turn Human Expertise Into Deployable Intelligence
            </h1>
            <p className="mt-6 text-[16px] lg:text-[17px] leading-relaxed max-w-xl" style={{ color: EM.muted }}>
              <span className="font-semibold" style={{ color: EM.primary }}>expertminds</span>™ uses structured AI interviews to capture professional judgment, tacit knowledge, and lived
              experience — then transforms it into structured, monetizable assets.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={launch}
                className="text-[14px] font-semibold px-5 py-3 rounded-lg text-white transition-transform hover:-translate-y-px"
                style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})`, boxShadow: `0 1px 2px ${EM.shadow}` }}
              >
                Launch expertminds Extraction
              </button>
              <button
                className="text-[14px] font-semibold px-5 py-3 rounded-lg transition-colors hover:bg-white"
                style={{ color: EM.primary, border: `1px solid ${EM.border}`, background: "transparent" }}
              >
                Request Enterprise Access
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-8">
              {CHIPS.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full"
                  style={{ background: EM.surface, border: `1px solid ${EM.border}`, color: EM.primary2 }}
                >
                  <c.icon className="w-3.5 h-3.5" strokeWidth={1.75} style={{ color: EM.accent }} />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 7/12 : Knowledge Cockpit */}
          <div className="lg:col-span-7">
            <KnowledgeCockpit />
          </div>
        </div>
      </div>
    </section>
  );
}