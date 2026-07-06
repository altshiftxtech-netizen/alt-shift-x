import React from "react";
import { Cpu } from "lucide-react";

const AMBER = "#E6A94B";

/**
 * CinemaPanel — one storyboard beat in the elite Director's Cut 2-column reader.
 * Column layout is owned by the reader; this renders a single script "panel"
 * with a Technical Breakdown hover that reveals its Forensic Delta (server
 * model, code snippet, timestamp). Plays a foley cue on hover-in.
 */
export default function CinemaPanel({ index, text, delta, onHover }) {
  return (
    <div
      onMouseEnter={onHover}
      className="forensic-panel relative rounded-sm px-3 py-2.5 group cursor-crosshair transition-colors"
      style={{
        background: "linear-gradient(180deg, rgba(18,13,6,0.9), rgba(8,5,3,0.95))",
        border: `1px solid ${AMBER}33`,
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] font-black tracking-widest" style={{ color: `${AMBER}88` }}>
          PANEL {String(index + 1).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: `${AMBER}aa` }}>
          <Cpu className="w-2.5 h-2.5" /> Technical Breakdown
        </span>
      </div>

      {/* Panel Text — raw script line */}
      <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "#D9C7A0", fontFamily: "'Courier New', monospace" }}>
        <span style={{ color: `${AMBER}77` }}>&gt; </span>{text}
      </p>

      {/* Forensic Delta — hidden until hover */}
      <div className="forensic-delta mt-2 pt-2 space-y-1" style={{ borderTop: `1px dashed ${AMBER}33` }}>
        <div className="flex items-center gap-1.5 text-[9px]" style={{ color: `${AMBER}cc` }}>
          <span className="font-bold uppercase tracking-wide">HW</span>
          <span className="font-mono">{delta.model}</span>
        </div>
        <code className="block text-[9.5px] leading-tight px-1.5 py-1 rounded-sm font-mono"
          style={{ background: "rgba(0,0,0,0.5)", color: "#8FE6A0", border: `1px solid ${AMBER}22` }}>
          {delta.code}
        </code>
        <div className="text-[9px] font-mono tracking-wider" style={{ color: `${AMBER}99` }}>
          ⏱ TC {delta.ts}
        </div>
      </div>
    </div>
  );
}