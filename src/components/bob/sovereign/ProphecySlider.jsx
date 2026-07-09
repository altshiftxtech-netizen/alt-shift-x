import React from "react";
import { Eye, Sparkles, ShieldOff } from "lucide-react";

/**
 * ProphecySlider — a two-segment Reality/Prophecy toggle (top row) plus a
 * separate Privacy Veil on/off button (bottom row).
 *
 * Reality (X1/X3 standard execution) and Prophecy (X2/X35 Prophecy Engines
 * projecting civilizational outcomes) are mutually exclusive. Privacy Veil
 * (SOVEREIGN-PRIVACY-VEIL-1.0) is an independent on/off switch that can layer
 * on top of either mode.
 */
export default function ProphecySlider({ mode, onChange, privacyOn, onTogglePrivacy }) {
  const isProphecy = mode === "prophecy";

  return (
    <div className="flex flex-col gap-1.5 px-0.5 py-1">
      {/* Reality / Prophecy — single two-segment toggle */}
      <div className="inline-flex rounded-lg overflow-hidden border border-slate-700 self-start">
        <button
          type="button"
          onClick={() => onChange("reality")}
          className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold transition-colors ${
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
          className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold transition-colors border-l border-slate-700 ${
            isProphecy
              ? "bg-violet-600 text-white"
              : "bg-slate-800 text-slate-500 hover:text-slate-300"
          }`}
          title="Prophecy Mode ON — X2/X35 Engines engaged"
        >
          <Sparkles className="w-3 h-3" /> PROPHECY
        </button>
      </div>
      {isProphecy && (
        <span className="text-[9px] font-mono text-violet-400">X2/X35 Engines engaged</span>
      )}

      {/* Privacy Veil — separate on/off toggle */}
      <button
        type="button"
        onClick={() => onTogglePrivacy(!privacyOn)}
        className={`flex items-center gap-2 self-start px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors border ${
          privacyOn
            ? "bg-amber-600 text-white border-amber-500"
            : "bg-slate-800 text-slate-500 hover:text-slate-300 border-slate-700"
        }`}
        title={privacyOn ? "Privacy Veil ON — click to turn off" : "Privacy Veil OFF — click to turn on"}
      >
        <ShieldOff className="w-3 h-3" />
        <span>PRIVACY VEIL</span>
        <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] ${privacyOn ? "bg-amber-800" : "bg-slate-700"}`}>
          {privacyOn ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}