import React from "react";

const WOOD_TOP = "#7a4f2a";      // lighter polished rail
const WOOD_MID = "#5e3a1f";      // main cabinet wood
const WOOD_DARK = "#3a2414";     // shadowed grain
const BRASS = "#C8A95B";
const LAMP = "#FFE1A6";

/**
 * The room's back centerpiece — a finished, polished-wood speakeasy bar.
 * A tall arched back-bar with lit shelves of bottles, a glowing brass rail,
 * and a gleaming counter in front. Rendered compact so the room reads grand.
 * Purely decorative (no onClick) unless one is passed.
 */
export default function ProxyBar({ style, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      aria-label="Speakeasy bar"
      className="group absolute -translate-x-1/2 z-10 select-none focus:outline-none"
      style={{ width: "16%", maxWidth: 230, minWidth: 150, ...style }}
    >
      {/* ── BACK-BAR — arched cabinet with lit bottle shelves ── */}
      <div
        className="relative w-full h-40 rounded-t-[42%] overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${WOOD_MID} 0%, ${WOOD_DARK} 100%)`,
          border: `2px solid ${BRASS}66`,
          boxShadow: `0 14px 34px rgba(0,0,0,0.6), inset 0 0 26px rgba(0,0,0,0.5)`,
        }}
      >
        {/* polished wood grain sheen */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "repeating-linear-gradient(180deg, rgba(255,220,160,0.05) 0px, rgba(255,220,160,0.05) 2px, transparent 2px, transparent 7px)",
        }} />
        {/* warm interior glow behind the bottles */}
        <div className="absolute inset-x-3 top-3 bottom-6 rounded-t-[38%]" style={{
          background: `radial-gradient(ellipse at 50% 40%, ${LAMP}22, transparent 70%)`,
          border: `1px solid ${BRASS}33`,
        }} />

        {/* three lit shelves of bottles */}
        {[30, 50, 70].map((t) => (
          <React.Fragment key={t}>
            <div className="absolute inset-x-4 flex justify-between items-end" style={{ top: `${t}%` }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="rounded-t-sm" style={{
                  width: 3,
                  height: 11,
                  background: `linear-gradient(180deg, ${i % 2 ? BRASS : "#8a6a3a"}, #4a3218)`,
                  boxShadow: `0 0 5px ${LAMP}44`,
                  opacity: 0.9,
                }} />
              ))}
            </div>
            {/* glowing glass shelf */}
            <div className="absolute inset-x-3.5" style={{
              top: `calc(${t}% + 12px)`, height: 2,
              background: `linear-gradient(90deg, transparent, ${BRASS}, transparent)`,
              boxShadow: `0 0 8px ${LAMP}66`,
            }} />
          </React.Fragment>
        ))}
      </div>

      {/* ── COUNTER — polished front bar with brass foot rail ── */}
      <div className="relative w-[116%] -ml-[8%] -mt-1">
        {/* counter top (glossy) */}
        <div className="h-4 rounded-sm" style={{
          background: `linear-gradient(180deg, ${WOOD_TOP}, ${WOOD_MID})`,
          borderTop: `2px solid ${BRASS}aa`,
          boxShadow: `0 3px 0 rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,225,160,0.25)`,
        }} />
        {/* cabinet face with recessed panels */}
        <div className="h-12 flex gap-1.5 px-1.5 pt-1.5" style={{
          background: `linear-gradient(180deg, ${WOOD_MID}, ${WOOD_DARK})`,
          boxShadow: "0 10px 22px rgba(0,0,0,0.55)",
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 rounded-sm" style={{
              border: `1.5px solid ${WOOD_DARK}`,
              boxShadow: `inset 0 0 8px rgba(0,0,0,0.6), 0 1px 0 ${BRASS}22`,
              background: `linear-gradient(180deg, ${WOOD_MID}, ${WOOD_DARK})`,
            }} />
          ))}
        </div>
        {/* brass foot rail */}
        <div className="h-1 mx-2 rounded-full" style={{
          background: `linear-gradient(180deg, ${BRASS}, #6b5426)`,
          boxShadow: `0 0 6px ${BRASS}66`,
        }} />
      </div>

      {/* warm pool of light on the floor under the bar */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-3 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${LAMP}55, transparent 70%)`, filter: "blur(3px)" }} />

      {/* hover glow (only when interactive) */}
      {onClick && (
        <div className="absolute inset-0 rounded-t-[42%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `0 0 30px 6px ${BRASS}66` }} />
      )}
    </button>
  );
}