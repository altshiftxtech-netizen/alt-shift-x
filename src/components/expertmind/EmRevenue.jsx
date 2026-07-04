import React from "react";
import { Receipt, Repeat, KeyRound } from "lucide-react";
import { EM } from "./emTokens";

const CARDS = [
  { icon: Receipt, title: "Extraction Fee", meta: "One-time", body: "One-time paid expert capture session." },
  { icon: Repeat, title: "Marketplace Revenue", meta: "Recurring", body: "PKCs generate recurring subscription income." },
  { icon: KeyRound, title: "AI Licensing", meta: "Consent-based", body: "Consent-based data packages licensed to training organizations." },
];

export default function EmRevenue() {
  return (
    <section id="revenue-model" style={{ background: EM.surfaceAlt }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight" style={{ color: EM.primary }}>Revenue model</h2>
        <p className="mt-3 text-[16px] max-w-xl" style={{ color: EM.muted }}>Three aligned paths from captured expertise to durable income.</p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {CARDS.map((c) => (
            <div key={c.title} className="rounded-2xl p-7 flex flex-col" style={{ background: EM.surface, border: `1px solid ${EM.border}` }}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: EM.accentSoft }}>
                  <c.icon className="w-5 h-5" strokeWidth={1.75} style={{ color: EM.accent }} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: EM.primary2 }}>{c.meta}</span>
              </div>
              <h3 className="text-[19px] font-semibold mb-2" style={{ color: EM.primary }}>{c.title}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: EM.muted }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}