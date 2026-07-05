import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight, X } from "lucide-react";
import { GEN2_LAYERS } from "./gen2Lineage";

const TYPE_LABEL = {
  X1: "Reading Protocol", X2: "Prophecy Model", X3: "Speed Profile",
  X4: "Reason Council", X5: "Complete Agent",
};

/**
 * The Gen-2 Vault panel — surfaces the Speakeasy & Barkeep component lineage
 * inside the Ballroom. A brass drawer that slides up from the ballroom floor,
 * grouping the stack by its lore layers; each tile links to its marketplace page.
 */
export default function Gen2LineagePanel({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div
            className="relative w-full max-w-3xl max-h-[82%] overflow-y-auto rounded-t-3xl border-t border-x p-6 pb-10"
            style={{ background: "linear-gradient(180deg, rgba(24,18,12,0.98), rgba(12,9,6,0.99))", borderColor: "#C8A95B44" }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A95B]">Infused · July 5, 2026</p>
              <h2 className="text-2xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                The ExpertMinds Gen-2 Vault
              </h2>
              <p className="text-xs text-white/50 mt-1 max-w-lg mx-auto italic">
                “If I wasn't this good, you wouldn't be so great.” 🥂
              </p>
            </div>

            <div className="space-y-6">
              {GEN2_LAYERS.map((layer) => (
                <div key={layer.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{layer.emoji}</span>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: layer.accent }}>{layer.title}</h3>
                      <p className="text-[11px] text-white/45">{layer.blurb}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {layer.components.map((c) => (
                      <Link
                        key={c.code}
                        to={`/marketplace/${c.id}`}
                        className="group flex flex-col gap-1.5 rounded-xl border p-3 transition-colors hover:border-[#C8A95B]"
                        style={{ background: "rgba(255,255,255,0.03)", borderColor: "#ffffff14" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${layer.accent}22`, color: layer.accent }}>
                              {c.type}
                            </span>
                            <span className="text-xs font-bold text-white leading-tight">{c.name}</span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-[#C8A95B] flex-shrink-0" />
                        </div>
                        <p className="text-[10px] font-mono text-white/35">{c.code} · {TYPE_LABEL[c.type]}</p>
                        <p className="text-[11px] text-white/55 leading-snug">{c.logic}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link to="/marketplace" className="text-[11px] font-semibold text-[#C8A95B] hover:underline">
                Browse the full marketplace →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}