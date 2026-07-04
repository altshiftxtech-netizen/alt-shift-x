import React from "react";
import { Waves, Lock, TrendingUp } from "lucide-react";
import { EM } from "./emTokens";

const CARDS = [
  { icon: Waves, title: "Scraped data is noisy", body: "Scraped data is broad, unverified, and often disconnected from real-world expertise." },
  { icon: Lock, title: "Expert knowledge is trapped", body: "The most valuable knowledge still lives inside people — undocumented and unstructured." },
  { icon: TrendingUp, title: "Governed intelligence is the opportunity", body: "ExpertMind turns that human insight into a governed, AI-ready asset." },
];

export default function EmWhy() {
  return (
    <section id="why" style={{ background: EM.surfaceAlt }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight max-w-3xl" style={{ color: EM.primary }}>
          Scraped data is noisy. Expert knowledge is trapped.
        </h2>
        <p className="mt-4 text-[16px] max-w-2xl leading-relaxed" style={{ color: EM.muted }}>
          The most valuable knowledge still lives inside people. ExpertMind turns that human insight into a governed AI-ready asset.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {CARDS.map((c) => (
            <div key={c.title} className="rounded-2xl p-7" style={{ background: EM.surface, border: `1px solid ${EM.border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: EM.accentSoft }}>
                <c.icon className="w-5 h-5" strokeWidth={1.75} style={{ color: EM.accent }} />
              </div>
              <h3 className="text-[18px] font-semibold mb-2" style={{ color: EM.primary }}>{c.title}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: EM.muted }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}