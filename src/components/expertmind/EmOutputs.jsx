import React from "react";
import { Boxes, Layers, IdCard, DatabaseZap } from "lucide-react";
import { EM } from "./emTokens";

const OUTPUTS = [
  { icon: Boxes, title: "Personal Knowledge Component (PKC)", tag: "deployable", body: "A deployable AI component representing the expert’s knowledge." },
  { icon: Layers, title: "Knowledge Book Tile (KBT)", tag: "structured", body: "A structured framework built from domain expertise." },
  { icon: IdCard, title: "Professional Profile", tag: "verified", body: "A mapped biography, expertise profile, and knowledge graph." },
  { icon: DatabaseZap, title: "Training Data Package", tag: "licensed", body: "Consent-based, high-quality data prepared for AI fine-tuning." },
];

export default function EmOutputs() {
  return (
    <section id="outputs" style={{ background: "#EAF1F7" }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
        <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight" style={{ color: EM.primary }}>Outputs</h2>
        <p className="mt-3 text-[16px] max-w-xl" style={{ color: EM.muted }}>Every extraction produces governed, deployable knowledge assets.</p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {OUTPUTS.map((o) => (
            <div key={o.title} className="rounded-2xl p-7" style={{ background: EM.surface, border: `1px solid ${EM.border}` }}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: EM.accentSoft }}>
                  <o.icon className="w-5 h-5" strokeWidth={1.75} style={{ color: EM.accent }} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md" style={{ background: EM.surfaceAlt, color: EM.primary2 }}>{o.tag}</span>
              </div>
              <h3 className="text-[19px] font-semibold mb-2" style={{ color: EM.primary }}>{o.title}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: EM.muted }}>{o.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}