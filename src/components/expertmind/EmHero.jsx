import React, { useState } from "react";
import { ShieldCheck, BadgeCheck, LayoutGrid, Lock, Building2 } from "lucide-react";
import { EM } from "./emTokens";
import { useEmLaunch } from "./EmLaunchContext";
import KnowledgeCockpit from "./KnowledgeCockpit";
import EmRequestEnterpriseModal from "./EmRequestEnterpriseModal";

const CHIPS = [
  { label: "Consent-based", icon: ShieldCheck },
  { label: "Expert-verified", icon: BadgeCheck },
  { label: "Structured", icon: LayoutGrid },
  { label: "Governed", icon: Lock },
  { label: "Enterprise-ready", icon: Building2 },
];

export default function EmHero() {
  const launch = useEmLaunch();
  const [requestOpen, setRequestOpen] = useState(false);
  return (
    <section id="hero">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left — 5/12 — seated on a frosted glass panel that pops off the video */}
          <div
            className="lg:col-span-5 rounded-3xl p-7 lg:p-9 backdrop-blur-md"
            style={{
              background: "linear-gradient(160deg, rgba(255,255,255,0.55), rgba(255,255,255,0.28))",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 20px 60px -20px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
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
                onClick={() => setRequestOpen(true)}
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
      <EmRequestEnterpriseModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </section>
  );
}