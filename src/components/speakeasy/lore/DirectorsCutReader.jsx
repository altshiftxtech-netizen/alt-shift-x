import React, { useState, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Copy, Check, Volume2, VolumeX, Film } from "lucide-react";
import { getLore, FOUNDER_ORDER, SPEAKEASY_SHARE_URL } from "./founderLore";
import { getCinema } from "./cinemaBlueprint";
import { PORTRAITS_BY_FOUNDER } from "../hallway/portraitRegistry";
import CinemaPanel from "./CinemaPanel";
import useFoley from "./useFoley";

const AMBER = "#E6A94B";

/**
 * FOUNDER-CINEMA-BLUEPRINT-1.0 ($999) — the ELITE, high-density Director's Cut
 * "Cinema Reader". When active, each of the 12 issues renders as a 2-column
 * comic frame:
 *   Column 1 (The Visual) — the High-Density Visual Description as amber
 *     "concept art" (sketch filter), shifted by a scroll-driven parallax for a
 *     3D short-movie depth.
 *   Column 2 (The Script) — the Forensic Director's Note + Panel Text in a
 *     mono script file, each panel hover-revealing its Forensic Deltas.
 * Elite Noir theme: deep shadows, high contrast, flickering neon amber. Subtle
 * per-panel foley (server hum / key click / data whisper) when audio is on.
 */
export default function DirectorsCutReader({ founders = FOUNDER_ORDER, onClose }) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [parallax, setParallax] = useState(0);
  const scrollRef = useRef(null);
  const { play, toggle } = useFoley();

  const founder = founders[idx];
  const lore = getLore(founder);
  const cinema = getCinema(founder);
  const art = PORTRAITS_BY_FOUNDER?.[founder];

  const go = (d) => {
    setIdx((i) => (i + d + founders.length) % founders.length);
    setCopied(false);
    setParallax(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  // Scroll-driven parallax: the concept-art column drifts against the script.
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setParallax(el.scrollTop);
  }, []);

  const onToggleAudio = () => setAudioOn(toggle());

  const copyRiddle = async () => {
    const text = `"${lore.riddle}"\n— ${founder}, one of the 12 founders of The Speakeasy.\nCrack the rest: ${SPEAKEASY_SHARE_URL}`;
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" style={{ background: "rgba(3,2,1,0.97)" }}>
      {/* CRT flicker + scanline + vignette layers */}
      <div className="absolute inset-0 pointer-events-none crt-scanlines crt-flicker" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.92) 100%)" }} />

      {/* Top chrome */}
      <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4" style={{ color: AMBER }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] neon-amber" style={{ color: AMBER }}>
            Director's Cut · Elite · Issue #{idx + 1}/{founders.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleAudio} title={audioOn ? "Mute foley" : "Enable foley"}
            className="p-1.5 rounded-lg border transition-colors" style={{ borderColor: `${AMBER}44`, color: audioOn ? AMBER : `${AMBER}77` }}>
            {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The film frame */}
      <div className="relative z-[1] w-full max-w-5xl h-[82vh] rounded-lg overflow-hidden flex flex-col"
        style={{ border: `1px solid ${AMBER}55`, boxShadow: `0 0 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.7)`, background: "#050301" }}>

        {/* Masthead */}
        <div className="text-center py-3 border-b" style={{ borderColor: `${AMBER}33`, background: "linear-gradient(180deg, rgba(20,13,5,0.9), transparent)" }}>
          <h2 className="text-2xl sm:text-3xl font-black neon-amber" style={{ color: AMBER, fontFamily: "'Playfair Display', serif" }}>
            {founder}
          </h2>
          <p className="mt-1 text-xs italic" style={{ color: `${AMBER}bb` }}>"{lore.riddle}"</p>
        </div>

        {/* 2-column high-density body */}
        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto grid md:grid-cols-2">
          {/* ── Column 1 — THE VISUAL (concept art, sketch filter, parallax) ── */}
          <div className="relative min-h-[40vh] md:h-full overflow-hidden cinema-sketch-frame border-b md:border-b-0 md:border-r"
            style={{ borderColor: `${AMBER}33`, background: "#0a0603" }}>
            {art && (
              <img src={art} alt={founder}
                className="cinema-sketch absolute inset-0 w-full h-full object-cover will-change-transform"
                style={{ transform: `translateY(${parallax * -0.18}px) scale(1.18)` }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,3,1,0.2), rgba(5,3,1,0.85))" }} />
            {/* Visual description caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4"
              style={{ transform: `translateY(${parallax * 0.06}px)` }}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${AMBER}aa` }}>Concept Art · Frame</span>
              <p className="mt-1.5 text-[13px] leading-snug" style={{ color: "#F0E2C4", fontFamily: "'Playfair Display', serif", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                {cinema.visual}
              </p>
            </div>
            {/* flickering rack LED accent */}
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full neon-amber" style={{ background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />
          </div>

          {/* ── Column 2 — THE SCRIPT (mono raw script file) ── */}
          <div className="p-4 space-y-3" style={{ background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 26px), #060402" }}>
            {/* Forensic Director's Note */}
            <div className="rounded-sm px-3 py-2" style={{ background: "rgba(20,13,5,0.7)", border: `1px solid ${AMBER}44` }}>
              <p className="text-[11px] leading-relaxed" style={{ color: `${AMBER}dd`, fontFamily: "'Courier New', monospace" }}>
                {cinema.note}
              </p>
            </div>

            {/* Panels — each with hover Technical Breakdown + foley */}
            {lore.panels.map((p, i) => (
              <CinemaPanel key={i} index={i} text={p}
                delta={cinema.deltas[i] || cinema.deltas[cinema.deltas.length - 1]}
                onHover={() => play((cinema.foley && cinema.foley[i]) || cinema.foley?.[0])} />
            ))}

            {/* Monologue — the film's closing voiceover */}
            <div className="rounded-sm px-3 py-2.5" style={{ background: "rgba(10,7,3,0.6)", border: `1px solid ${AMBER}22` }}>
              <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: `${AMBER}88` }}>V.O. · Closing</span>
              <p className="mt-1 text-[12px] leading-relaxed italic" style={{ color: "#D9C7A0" }}>{lore.monologue}</p>
            </div>
          </div>
        </div>

        {/* Nav footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: `${AMBER}33`, background: "rgba(10,7,3,0.8)" }}>
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