import React from "react";
import { MessageSquareText, ScanLine, Share2, Download, ChevronRight } from "lucide-react";
import { EM } from "./emTokens";

const STEPS = [
  { icon: MessageSquareText, title: "Interview", body: "AI conducts a structured, adaptive conversation." },
  { icon: ScanLine, title: "Extract", body: "Captures explicit knowledge and tacit judgment." },
  { icon: Share2, title: "Structure", body: "Organizes responses into usable knowledge components." },
  { icon: Download, title: "Deploy", body: "Assets can be published, licensed, or used internally." },
];

export default function EmProcess() {
  return (
    <section id="how-it-works" style={{ background: EM.surface }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight" style={{ color: EM.primary }}>How it works</h2>
        <p className="mt-3 text-[16px]" style={{ color: EM.muted }}>Interview → Extract → Structure → Deploy</p>

        <div className="grid md:grid-cols-4 gap-4 mt-12">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="rounded-2xl p-6 h-full" style={{ background: EM.bg, border: `1px solid ${EM.border}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: EM.surface, border: `1px solid ${EM.border}` }}>
                    <s.icon className="w-5 h-5" strokeWidth={1.75} style={{ color: EM.accent }} />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: EM.muted }}>0{i + 1}</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-2" style={{ color: EM.primary }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: EM.muted }}>{s.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 z-10" style={{ color: EM.border }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}