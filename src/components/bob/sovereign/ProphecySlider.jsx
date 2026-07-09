import React from "react";
import { Eye, Sparkles, ShieldOff } from "lucide-react";

/**
 * ProphecySlider — a two-segment Reality/Prophecy toggle plus a separate
 * Privacy Veil on/off button.
 *
 * Reality (X1/X3 standard execution) and Prophecy (X2/X35 Prophecy Engines
 * projecting civilizational outcomes) are mutually exclusive. Privacy Veil
 * (SOVEREIGN-PRIVACY-VEIL-1.0) is an independent on/off switch that can layer
 * on top of either mode.
 */
export default function ProphecySlider({ mode, onChange, privacyOn, onTogglePrivacy }) {
  const isProphecy = mode === "prophecy";

  return (
    <div className="flex items-center gap-2 px-0.5 py-1">
      <button
        type="button"
        onClick={() => onChange("reality")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-l-lg text-[10px] font-bold transition-colors ${
          !isProphecy
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
        className={`flex items-center gap-1 px-2.5 py-1 rounded-r-lg text-[10px] font-bold transition-colors border-l border-slate-700/50 ${
          isProphecy
            ? "bg-violet-600 text-white"
            : "bg-slate-800 text-slate-500 hover:text-slate-300"
        }`}
        title="Prophecy Mode ON — X2/X35 Engines engaged"
      >
        <Sparkles className="w-3 h-3" /> PROPHECY
      </button>
      {isProphecy && (
        <span className="text-[9px] font-mono text-violet-400 ml-0.5">X2/X35</span>
      )}

      <div className="w-px h-4 bg-slate-700 mx-1" />

      <button
        type="button"
        onClick={() => onTogglePrivacy(!privacyOn)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors border ${
          privacyOn
            ? "bg-amber-600 text-white border-amber-500"
            : "bg-slate-800 text-slate-500 hover:text-slate-300 border-slate-700"
        }`}
        title={privacyOn ? "Privacy Veil ON — click to turn off" : "Privacy Veil OFF — click to turn on"}
      >
        <ShieldOff className="w-3 h-3" /> PRIVACY {privacyOn ? "ON" : "OFF"}
      </button>
    </div>
  );
}