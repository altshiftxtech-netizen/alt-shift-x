import React from "react";

/**
 * A framed picture mounted on a hallway side wall that acts as a gateway to a
 * page — the hallway equivalent of ProxyDoor. Frames are laid out side by side
 * inside a wall container that carries the corridor's perspective, so each
 * frame stays flat and the whole row shares one consistent angle.
 * Optional `image` fills the canvas; otherwise a soft nebula gradient shows.
 */
export default function HallwayFrame({ label, sublabel, onClick, accent = "#C8A95B", image }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center focus:outline-none flex-shrink-0"
      aria-label={`Enter ${label}`}
    >
      {/* framed canvas — flat; the parent wall provides the perspective tilt */}
      <div
        className="relative w-20 h-28 sm:w-24 sm:h-32 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          borderRadius: "3px",
          border: "3px solid #14110d",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          background: "#14110d",
        }}
      >
        {image ? (
          <img src={image} alt={label} className="absolute inset-[3px] object-cover rounded-[2px]" style={{ width: "calc(100% - 6px)", height: "calc(100% - 6px)" }} />
        ) : (
          <div
            className="absolute inset-[3px] rounded-[2px]"
            style={{
              background: `radial-gradient(circle at 30% 25%, ${accent}66, transparent 55%), radial-gradient(circle at 75% 70%, #6d6fb855, transparent 60%), linear-gradient(160deg, #efe9df, #cfd2e2)`,
            }}
          />
        )}
        {/* hover glow */}
        <div className="absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 26px 4px ${accent}66` }} />
      </div>
      {/* label plate beneath the frame */}
      <div className="mt-2 text-center w-28 px-1.5 py-1 rounded bg-black/55 backdrop-blur-sm">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] leading-tight whitespace-nowrap" style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/60 leading-tight whitespace-nowrap">{sublabel}</p>}
      </div>
    </button>
  );
}