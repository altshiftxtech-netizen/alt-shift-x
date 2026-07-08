import React from "react";
import { Eye, Sparkles } from "lucide-react";

/**
 * ProphecySlider — toggles between Reality (X1/X3 standard execution)
 * and Prophecy (X2/X35 Prophecy Engines projecting civilizational outcomes).
 * Placed just above the Send button.
 */
export default function ProphecySlider({ mode, onChange }) {
  const isProphecy = mode === "prophecy";

  return (
    <div className="flex items-center gap-2 px-0.5 py-1">
      <Eye className={`w-3 h-3 ${!isProphecy ? "text-cyan-400" : "text-slate-600"}`} />
      <span className={`text-[10px] font-bold ${!isProphecy ? "text-cyan-400" : "text-slate-600"}`}>REALITY</span>
      <button
        type="button"
        onClick={() => onChange(isProphecy ? "reality" : "prophecy")}
        className={`relative w-28 h-5 rounded-full transition-colors ${isProphecy ? "bg-violet-600" : "bg-cyan-600"}`}
        title={isProphecy ? "Prophecy Mode ON — X2/X35 Engines engaged" : "Reality Mode — standard X1/X3 execution"}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
            isProphecy ? "translate-x-[96px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <Sparkles className={`w-3 h-3 ${isProphecy ? "text-violet-400" : "text-slate-600"}`} />
      <span className={`text-[10px] font-bold ${isProphecy ? "text-violet-400" : "text-slate-600"}`}>PROPHECY</span>
      {isProphecy && (
        <span className="text-[9px] font-mono text-violet-500/70 ml-1">X2/X35</span>
      )}
    </div>
  );
}