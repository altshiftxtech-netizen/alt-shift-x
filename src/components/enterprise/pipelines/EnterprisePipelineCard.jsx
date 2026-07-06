import React from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

/**
 * A single Sovereign exclusive pipeline card — sovereign dark framing with the
 * pipeline's own accent glow, strategic focus badge, and sales pitch.
 */
export default function EnterprisePipelineCard({ pipeline, onSelect }) {
  const { name, price, focus, pitch, accent, icon, forensic } = pipeline;

  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden transition-transform hover:-translate-y-1"
      style={{
        border: `1px solid ${accent}44`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(10,10,12,0.65) 100%)",
        boxShadow: `0 0 40px ${accent}22`,
      }}
    >
      <span
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${accent}33` }}
      />

      {forensic && (
        <span
          className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full"
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
        >
          Forensic-Ready
        </span>
      )}

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ background: `${accent}1a`, border: `1px solid ${accent}44` }}
        >
          {icon}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>
          {focus}
        </p>
        <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          {name}
        </h3>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black text-white">${price.toLocaleString()}</span>
          <span className="text-sm text-white/50">/mo</span>
        </div>

        <p className="text-sm text-white/70 leading-relaxed mb-6 italic">"{pitch}"</p>

        <ul className="space-y-2 mb-6 text-xs text-white/60">
          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" style={{ color: accent }} /> Gen-2 "Expertminds" lineage</li>
          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" style={{ color: accent }} /> Single secure pipeline key</li>
          <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5" style={{ color: accent }} /> Locked to the Sovereign registry</li>
        </ul>

        <Button
          onClick={() => onSelect(pipeline)}
          className="w-full font-bold hover:opacity-90"
          style={{ background: `linear-gradient(90deg, ${accent}, #C8A95B)`, color: "#0A0A0C" }}
        >
          License {name} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}