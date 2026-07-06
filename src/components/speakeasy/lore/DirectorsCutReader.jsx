import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { getLore, FOUNDER_ORDER, SPEAKEASY_SHARE_URL } from "./founderLore";

const AMBER = "#E6A94B";

/**
 * FOUNDER-CINEMA-BLUEPRINT-1.0 — the Noir-Cyber "Comic Book Reader". A full
 * overlay that turns the founders' lore into storyboard panels: low light,
 * amber text, flickering CRT scanlines. Navigates founder-by-founder.
 *
 * `founders` — optional ordered subset (e.g. one wing's 6). Defaults to all 12.
 */
export default function DirectorsCutReader({ founders = FOUNDER_ORDER, onClose }) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const founder = founders[idx];
  const lore = getLore(founder);

  const go = (d) => { setIdx((i) => (i + d + founders.length) % founders.length); setCopied(false); };

  const copyRiddle = async () => {
    const text = `"${lore.riddle}"\n— ${founder}, one of the 12 founders of The Speakeasy.\nCrack the rest: ${SPEAKEASY_SHARE_URL}`;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(4,3,1,0.94)" }}>
      {/* CRT flicker + scanline layer */}
      <div className="absolute inset-0 pointer-events-none crt-scanlines crt-flicker" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />

      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-[1] w-full max-w-3xl">
        {/* Masthead */}
        <div className="text-center mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] crt-flicker" style={{ color: AMBER }}>Director's Cut · Issue #{idx + 1}</p>
          <h2 className="text-3xl font-black mt-1" style={{ color: AMBER, fontFamily: "'Playfair Display', serif", textShadow: `0 0 18px ${AMBER}66` }}>
            {founder}
          </h2>
          <p className="mt-2 text-sm italic max-w-xl mx-auto" style={{ color: `${AMBER}cc` }}>"{lore.riddle}"</p>
        </div>

        {/* Comic panels */}
        <div className="grid sm:grid-cols-3 gap-3">
          {lore.panels.map((p, i) => (
            <div key={i} className="relative rounded-md p-4 min-h-[9rem] flex flex-col"
              style={{ background: "linear-gradient(160deg, #16110a, #0a0705)", border: `1px solid ${AMBER}44`, boxShadow: `inset 0 0 30px rgba(0,0,0,0.6)` }}>
              <span className="text-[9px] font-black" style={{ color: `${AMBER}88` }}>PANEL {i + 1}</span>
              <p className="mt-2 text-[13px] leading-snug font-medium" style={{ color: "#EBD9B5", fontFamily: "'Playfair Display', serif" }}>{p}</p>
            </div>
          ))}
        </div>

        {/* Monologue caption */}
        <div className="mt-3 rounded-md px-4 py-3" style={{ background: "rgba(20,13,5,0.7)", border: `1px solid ${AMBER}33` }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "#EBD9B5" }}>{lore.monologue}</p>
        </div>

        {/* Nav */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => go(-1)} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full border" style={{ borderColor: `${AMBER}55`, color: AMBER }}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button onClick={copyRiddle} className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full border" style={{ borderColor: `${AMBER}55`, color: AMBER }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy Riddle"}
          </button>
          <button onClick={() => go(1)} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full border" style={{ borderColor: `${AMBER}55`, color: AMBER }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}