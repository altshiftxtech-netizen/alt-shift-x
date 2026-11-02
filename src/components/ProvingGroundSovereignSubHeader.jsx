import React from 'react';
import { Minus, Square, X, ArrowRight } from 'lucide-react';
import suiteBrandNames from '@/components/suite/suiteBrandNames';

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
          <strong className="text-amber-400 font-bold">⚜️ Sovereign Web Browser Full View</strong>
          <span className="text-slate-600 mx-1.5">—</span>
          <span className="text-cyan-300">Browser Found in SourceBridge &amp; {suiteBrandNames.magna}</span>
        </span>
      </div>

      {/* Right: Sovereign Difference callout + Gated Micro Window Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:flex items-center gap-1 font-mono text-[10px] tracking-wide text-amber-400/90 italic">
          It's The Sovereign Difference — Try It
          <ArrowRight className="w-3 h-3 text-cyan-300 animate-pulse" />
        </span>

        <div className="flex items-center gap-1">
          {/* Minimize Button (-) : Smoothly collapses view — gated to expanded state */}
          <button
            type="button"
            disabled={!isExpanded}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isExpanded && onMinimize) onMinimize();
            }}
            className={`h-5 w-5 flex items-center justify-center rounded transition-colors ${isExpanded ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'text-slate-700 cursor-not-allowed'}`}
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

          {/* Close Button (X) : Resets View — gated to expanded state */}
          <button
            type="button"
            disabled={!isExpanded}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isExpanded && onClose) onClose();
            }}
            className={`h-5 w-5 flex items-center justify-center rounded transition-colors ${isExpanded ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'text-slate-700 cursor-not-allowed'}`}
            title="Exit Full View"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}