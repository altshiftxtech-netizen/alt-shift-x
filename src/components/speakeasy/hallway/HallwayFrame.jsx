import React from "react";

/**
 * A framed picture mounted on a hallway side wall that acts as a gateway to a
 * page — the hallway equivalent of ProxyDoor. The `side` prop skews the frame
 * into the corridor's perspective so it reads as hanging flat on the wall.
 * Optional `image` fills the canvas; otherwise a soft nebula gradient shows.
 */
export default function HallwayFrame({ label, sublabel, onClick, side = "left", accent = "#C8A95B", image, style }) {
  const skew = side === "left" ? "perspective(700px) rotateY(38deg)" : "perspective(700px) rotateY(-38deg)";
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center focus:outline-none"
      aria-label={`Enter ${label}`}
    >
      {/* framed canvas — skewed into the wall plane */}
      <div
        className="relative w-24 h-32 sm:w-28 sm:h-40 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          transform: skew,
          transformOrigin: side === "left" ? "left center" : "right center",
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