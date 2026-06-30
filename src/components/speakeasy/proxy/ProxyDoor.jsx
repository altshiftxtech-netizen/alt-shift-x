import React from "react";

/**
 * A wall doorway styled like a framed poster that acts as a gateway to a page.
 * A dark panel with a thin gold-cream frame; the title sits beneath the panel
 * with a capped width so adjacent labels never bleed together. The `tilt` prop
 * skews the panel into the wall's perspective (side walls); back-wall doors use
 * a plain scale.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#D8C18A", tilt = "", image }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center focus:outline-none -translate-x-1/2"
      aria-label={`Enter ${label}`}
    >
      {/* recessed dark poster panel with thin frame — tilt skews it into wall perspective */}
      <div
        className="relative w-16 h-28 sm:w-20 sm:h-36 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          borderRadius: "3px",
          border: `2px solid ${accent}`,
          background: "linear-gradient(180deg, #1a120c 0%, #0b0805 100%)",
          boxShadow: "inset 0 0 24px rgba(0,0,0,0.85)",
          transform: tilt,
          transformOrigin: "center",
        }}
      >
        {/* founder portrait artwork filling the poster */}
        {image && (
          <img
            src={image}
            alt={`${label} founder portrait`}
            className="absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] object-cover rounded-[2px]"
            style={{ filter: "saturate(0.95) brightness(0.92)" }}
          />
        )}
        {/* inner reveal line */}
        <span className="absolute inset-1.5 rounded-[2px] border" style={{ borderColor: `${accent}55` }} />
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 22px 3px ${accent}55` }}
        />
      </div>
      {/* label beneath the door — capped width + background so neighbors don't bleed together */}
      <div className="mt-1.5 text-center w-20 px-1 py-0.5 rounded bg-black/55 backdrop-blur-sm">
        <p
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] leading-tight whitespace-nowrap"
          style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
        >
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/55 leading-tight whitespace-nowrap">{sublabel}</p>}
      </div>
    </button>
  );
}