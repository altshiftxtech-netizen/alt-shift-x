import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export default function SovereignBrowserFullViewToolbar({
  isFullScreen,
  onCollapseView,   // Replaces standard minimize: returns to in-page layout
  onToggleMaximize, // Toggles native fullscreen
  onReturnNormal    // Closes full view overlay, never closes browser tab
}) {
  return (
    <div className="w-full h-9 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between text-xs select-none z-50 flex-shrink-0">
      {/* Left: Brand / Advertising Marker */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[11px] tracking-wide text-slate-200">
          <strong className="text-amber-400 font-bold">⚜️ Sovereign Browser Full View</strong>
          <span className="text-slate-500 mx-2">—</span>
          <span className="text-cyan-300">Found in SourceBridge & MAGNA</span>
        </span>
      </div>

      {/* Right: Gated Window Controls (Zero Tab-Exit Risk) */}
      <div className="flex items-center gap-1">
        {/* Minimize / Collapse to In-Page View */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCollapseView();
          }}
          className="h-6 w-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Collapse View (Return to in-page layout)"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Screen Fill Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleMaximize();
          }}
          className="h-6 w-7 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title={isFullScreen ? "Restore View" : "Maximize Screen"}
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Close Overlay (Gated to Normal Mode, NEVER Window.close) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReturnNormal();
          }}
          className="h-6 w-7 flex items-center justify-center rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          title="Exit Full View"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}