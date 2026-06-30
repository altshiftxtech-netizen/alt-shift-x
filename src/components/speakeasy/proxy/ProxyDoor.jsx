import React from "react";

/**
 * A clickable, labelled door in the Proxy Room.
 * Positioned absolutely via the `style` prop. Gold-trimmed, glows on hover.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#C8A95B" }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center focus:outline-none"
      aria-label={`Enter ${label}`}
    >
      <div
        className="relative w-20 h-32 sm:w-24 sm:h-40 rounded-t-[2.5rem] border-2 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          borderColor: accent,
          background: "linear-gradient(180deg, rgba(20,16,10,0.95) 0%, rgba(10,8,6,0.98) 100%)",
          boxShadow: `0 0 0 0 ${accent}00`,
        }}
      >
        <div
          className="absolute inset-0 rounded-t-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 28px 4px ${accent}66`, border: `1px solid ${accent}` }}
        />
        {/* door knob */}
        <span
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        {/* panel lines */}
        <span className="absolute inset-3 rounded-t-3xl border border-white/5" />
      </div>
      <div className="mt-2 text-center">
        <p
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
        >
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/40">{sublabel}</p>}
      </div>
    </button>
  );
}