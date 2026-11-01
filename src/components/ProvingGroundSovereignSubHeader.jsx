import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function ProvingGroundSovereignSubHeader({
  isExpanded = false,
  onMinimize,  // Collapses back to standard canvas — NEVER closes tab
  onMaximize,  // Toggles true fullscreen
  onClose      // Cleanly resets view without tab exit
}) {
  return (
    <div className="w-full h-7 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between text-xs select-none z-40 transition-all">
      {/* Left: Thin Brand Advertising Line */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
        <span className="font-mono text-[10px] tracking-wide text-slate-300 truncate">
          <strong className="text-amber-400 font-bold">⚜️ Sovereign Browser Full View</strong>
          <span className="text-slate-600 mx-1.5">—</span>
          <span className="text-cyan-300">Found in SourceBridge &amp; MAGNA</span>
        </span>
      </div>

      {/* Right: Gated Micro Window Controls (Zero Tab Exit Risk) */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Minimize Button (-) : Smoothly collapses view */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onMinimize) onMinimize();
          }}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Collapse View"
        >
          <Minus className="w-3 h-3" />
        </button>

        {/* Maximize Button (Square) : Toggles Fullscreen */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onMaximize) onMaximize();
          }}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title={isExpanded ? "Restore View" : "Maximize Screen"}
        >
          <Square className="w-2.5 h-2.5" />
        </button>

        {/* Close Button (X) : Resets View */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClose) onClose();
          }}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          title="Exit Full View"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}