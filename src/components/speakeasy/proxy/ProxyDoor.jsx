import React from "react";

/**
 * A recessed wall doorway that acts as a gateway to a page.
 * Matches the reference: a tall dark panel with a thin gold-cream frame,
 * label set beneath it. Positioned absolutely via the `style` prop.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#D8C18A", tilt = "" }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center focus:outline-none -translate-x-1/2"
      aria-label={`Enter ${label}`}
    >
      {/* recessed dark door panel with thin frame — tilt skews it into wall perspective */}
      <div
        className="relative w-16 h-28 sm:w-20 sm:h-36 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          borderRadius: "3px",
          border: `2px solid ${accent}`,
          background: "linear-gradient(180deg, #1a120c 0%, #0b0805 100%)",
          boxShadow: `inset 0 0 24px rgba(0,0,0,0.85)`,
          transform: tilt,
          transformOrigin: "center",
        }}
      >
        {/* inner reveal line */}
        <span className="absolute inset-1.5 rounded-[2px] border" style={{ borderColor: `${accent}33` }} />
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 22px 3px ${accent}55` }}
        />
      </div>
      {/* label beneath the door */}
      <div className="mt-1.5 text-center px-1">
        <p
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] leading-tight"
          style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
        >
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/55 leading-tight">{sublabel}</p>}
      </div>
    </button>
  );
}