import React from "react";
import { EM } from "./emTokens";

export default function EmFinalCta() {
  return (
    <section id="final-cta" style={{ background: `linear-gradient(135deg, ${EM.primary} 0%, ${EM.primary2} 100%)` }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-24 text-center">
        <h2 className="text-[30px] lg:text-[44px] font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Capture the mind. Structure the knowledge. Deploy the intelligence.
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <button
            className="text-[15px] font-semibold px-6 py-3.5 rounded-lg transition-transform hover:-translate-y-px"
            style={{ background: "#fff", color: EM.primary }}
          >
            Launch ExpertMind Extraction
          </button>
          <button
            className="text-[15px] font-semibold px-6 py-3.5 rounded-lg text-white transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.4)" }}
          >
            Request Enterprise Access
          </button>
        </div>
      </div>
    </section>
  );
}