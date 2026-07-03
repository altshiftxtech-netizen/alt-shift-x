import React from "react";

/**
 * A wall doorway styled like a framed poster that acts as a gateway to a page.
 * A dark panel with a thin gold-cream frame; the title sits beneath the panel
 * with a capped width so adjacent labels never bleed together. The `tilt` prop
 * skews the panel into the wall's perspective (side walls); back-wall doors use
 * a plain scale.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#D8C18A", tilt = "", image, founder, labelAbove = false, cosmic = false }) {
  // Cosmic doors override the warm gold frame with a deep-space nebula treatment.
  if (cosmic) accent = "#8FD8FF";
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
        <p className={`${scaledDown ? "-mb-4" : "mb-1"} text-[9px] sm:text-[10px] font-semibold italic tracking-wide whitespace-nowrap`} style={{ color: accent, fontFamily: "'Playfair Display', serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
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
          background: cosmic
            ? "radial-gradient(120% 90% at 30% 15%, #3b1d6e 0%, #10163a 45%, #05030f 100%)"
            : "linear-gradient(180deg, #1a120c 0%, #0b0805 100%)",
          overflow: "hidden",
          transform: tilt,
          transformOrigin: "center",
          boxShadow: cosmic ? `0 0 26px 2px ${accent}55, inset 0 0 20px rgba(143,216,255,0.25)` : undefined,
        }}
      >
        {/* founder portrait artwork filling the poster */}
        {image && (
          <img
            src={image}
            alt={`${label} founder portrait`}
            className="absolute inset-1 rounded-[2px] object-cover"
            style={{
              width: "calc(100% - 8px)",
              height: "calc(100% - 8px)",
              // Blend the portrait into the nebula so it reads as floating in space.
              opacity: cosmic ? 0.72 : 1,
              mixBlendMode: cosmic ? "luminosity" : "normal",
            }}
          />
        )}

        {/* ── COSMIC LAYER: nebula haze, drifting starfield, a comet streak, and a NEW badge ── */}
        {cosmic && (
          <>
            {/* colored nebula clouds */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(60% 40% at 75% 80%, rgba(255,120,220,0.35) 0%, transparent 60%), radial-gradient(50% 45% at 20% 70%, rgba(90,150,255,0.35) 0%, transparent 60%)",
            }} />
            {/* twinkling stars */}
            {[
              { l: "18%", t: "22%", d: "0s", s: 2 }, { l: "68%", t: "16%", d: "0.6s", s: 1.5 },
              { l: "40%", t: "34%", d: "1.1s", s: 2.5 }, { l: "80%", t: "48%", d: "0.3s", s: 1.5 },
              { l: "26%", t: "58%", d: "1.4s", s: 2 }, { l: "58%", t: "68%", d: "0.9s", s: 1.5 },
              { l: "12%", t: "80%", d: "0.5s", s: 2 }, { l: "86%", t: "78%", d: "1.2s", s: 1.5 },
            ].map((st, i) => (
              <span key={i} className="absolute rounded-full pointer-events-none animate-pulse" style={{
                left: st.l, top: st.t, width: st.s, height: st.s, background: "#ffffff",
                boxShadow: "0 0 6px 1px rgba(180,220,255,0.9)", animationDelay: st.d, animationDuration: "2.4s",
              }} />
            ))}
            {/* slow comet streak */}
            <span className="absolute pointer-events-none" style={{
              left: "-30%", top: "30%", width: "60%", height: "1.5px",
              background: "linear-gradient(90deg, transparent, rgba(160,220,255,0.9))",
              transform: "rotate(28deg)", animation: "raffles-comet 5.5s linear infinite",
            }} />
            {/* NEW badge */}
            <span className="absolute top-1 right-1 z-10 text-[7px] sm:text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded-sm pointer-events-none"
              style={{ background: "linear-gradient(90deg,#7b5cff,#22d3ee)", color: "#fff", boxShadow: "0 0 8px rgba(120,180,255,0.8)" }}>
              New
            </span>
          </>
        )}

        {/* inner reveal line */}
        <span className="absolute inset-1 rounded-[2px] border pointer-events-none" style={{ borderColor: `${accent}55` }} />
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 22px 3px ${accent}${cosmic ? "88" : "55"}` }}
        />
      </div>
      {/* label beneath the door — capped width + background so neighbors don't bleed together.
          When the frame is scaled down (back wall), pull the label up so it tucks directly
          under the portrait instead of leaving a gap from the un-scaled layout box. */}
      {!labelAbove && <div className={scaledDown ? "-mt-5" : "mt-1.5"}>{nameplate}</div>}
    </button>
  );
}