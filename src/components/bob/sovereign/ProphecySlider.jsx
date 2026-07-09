import React from "react";
import { Eye, Sparkles, ShieldOff } from "lucide-react";

/**
 * ProphecySlider — segmented triad toggle between Reality (X1/X3 standard
 * execution), Prophecy (X2/X35 Prophecy Engines projecting civilizational
 * outcomes), and Privacy (Sovereign Privacy Veil — scrambles, encrypts, and
 * redacts all drafted content for vault-only sessions).
 *
 * Clean three-segment pill — no sliding handle that can overlap labels.
 */
export default function ProphecySlider({ mode, onChange }) {
  const isReality = mode === "reality";
  const isProphecy = mode === "prophecy";
  const isPrivacy = mode === "privacy";

  return (
    <div className="flex items-center gap-2 px-0.5 py-1">
      <button
        type="button"
        onClick={() => onChange("reality")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-l-lg text-[10px] font-bold transition-colors ${
          isReality
            ? "bg-cyan-600 text-white"
            : "bg-slate-800 text-slate-500 hover:text-slate-300"
        }`}
        title="Reality Mode — standard X1/X3 execution"
      >
        <Eye className="w-3 h-3" /> REALITY
      </button>
      <button
        type="button"
        onClick={() => onChange("prophecy")}
        className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold transition-colors border-l border-slate-700/50 ${
          isProphecy
            ? "bg-violet-600 text-white"
            : "bg-slate-800 text-slate-500 hover:text-slate-300"
        }`}
        title="Prophecy Mode ON — X2/X35 Engines engaged"
      >
        <Sparkles className="w-3 h-3" /> PROPHECY
      </button>
      <button
        type="button"
        onClick={() => onChange("privacy")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-r-lg text-[10px] font-bold transition-colors border-l border-slate-700/50 ${
          isPrivacy
            ? "bg-amber-600 text-white"
            : "bg-slate-800 text-slate-500 hover:text-slate-300"
        }`}
        title="Privacy Veil ON — SOVEREIGN-PRIVACY-VEIL-1.0 active (scramble · encrypt · redact)"
      >
        <ShieldOff className="w-3 h-3" /> PRIVACY
      </button>
      {isProphecy && (
        <span className="text-[9px] font-mono text-violet-400 ml-0.5">X2/X35</span>
      )}
      {isPrivacy && (
        <span className="text-[9px] font-mono text-amber-400 ml-0.5">VEIL</span>
      )}
    </div>
  );
}