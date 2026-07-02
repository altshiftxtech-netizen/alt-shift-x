import React from "react";

/**
 * A wall doorway styled like a framed poster that acts as a gateway to a page.
 * A dark panel with a thin gold-cream frame; the title sits beneath the panel
 * with a capped width so adjacent labels never bleed together. The `tilt` prop
 * skews the panel into the wall's perspective (side walls); back-wall doors use
 * a plain scale.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#D8C18A", tilt = "", image, founder, labelAbove = false }) {
  // Back-wall doors are scaled down; pull their label up to sit right under the portrait.
  const scaledDown = /scale\(0?\.\d+\)/.test(tilt) && !tilt.includes("rotateY");
  const nameplate = (
    <div className="text-center w-20 px-1 py-0.5 rounded bg-black/55 backdrop-blur-sm">
      <p
        className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] leading-tight whitespace-nowrap"
        style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
      >
        {label}
      </p>
      {sublabel && <p className="text-[9px] text-white/55 leading-tight whitespace-nowrap">{sublabel}</p>}
    </div>
  );

  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center focus:outline-none -translate-x-1/2"
      aria-label={`Enter ${label}`}
    >
      {/* founder nameplate above the portrait */}
      {founder && (
        <p className="mb-1 text-[9px] sm:text-[10px] font-semibold italic tracking-wide whitespace-nowrap" style={{ color: accent, fontFamily: "'Playfair Display', serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          {founder}
        </p>
      )}
      {/* back-wall doors render the label above the panel so the bar doesn't clip it */}
      {labelAbove && <div className="mb-1.5">{nameplate}</div>}
      {/* recessed dark poster panel with thin frame — tilt skews it into wall perspective */}
      <div
        className="relative w-16 h-28 sm:w-20 sm:h-36 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          borderRadius: "3px",
          border: `2px solid ${accent}`,
          background: "linear-gradient(180deg, #1a120c 0%, #0b0805 100%)",
          overflow: "hidden",
          transform: tilt,
          transformOrigin: "center",
        }}
      >
        {/* founder portrait artwork filling the poster */}
        {image && (
          <img
            src={image}
            alt={`${label} founder portrait`}
            className="absolute inset-1 rounded-[2px] object-cover"
            style={{ width: "calc(100% - 8px)", height: "calc(100% - 8px)" }}
          />
        )}
        {/* inner reveal line */}
        <span className="absolute inset-1 rounded-[2px] border pointer-events-none" style={{ borderColor: `${accent}55` }} />
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 22px 3px ${accent}55` }}
        />
      </div>
      {/* label beneath the door — capped width + background so neighbors don't bleed together.
          When the frame is scaled down (back wall), pull the label up so it tucks directly
          under the portrait instead of leaving a gap from the un-scaled layout box. */}
      {!labelAbove && <div className={scaledDown ? "-mt-5" : "mt-1.5"}>{nameplate}</div>}
    </button>
  );
}