import React from "react";
import CopyRiddleButton from "@/components/speakeasy/lore/CopyRiddleButton";

/**
 * A framed picture mounted on a hallway side wall that acts as a gateway to a
 * page — the hallway equivalent of ProxyDoor. Frames are laid out side by side
 * inside a wall container that carries the corridor's perspective, so each
 * frame stays flat and the whole row shares one consistent angle.
 * Optional `image` fills the canvas; otherwise a soft nebula gradient shows.
 *
 * When `riddle` is supplied, hovering the portrait triggers a data-"glitch"
 * shimmer and reveals a single cryptic line of that founder's lore, plus a
 * Copy Riddle share button — the FounderLore hook.
 */
export default function HallwayFrame({ label, sublabel, onClick, accent = "#C8A95B", image, founder, hoverPrice, hoverFeature, riddle }) {
  return (
    <button
      onClick={onClick}
      className="group lore-glitch-hover relative flex flex-col items-center focus:outline-none flex-shrink-0"
      aria-label={`Enter ${label}`}
    >
      {/* hover tooltip — the founder's riddle (lore), else price + feature line */}
      {riddle ? (
        <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 z-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 rounded-lg px-3 py-2 text-center"
          style={{ background: "rgba(6,4,10,0.96)", border: `1px solid ${accent}66`, boxShadow: `0 8px 24px rgba(0,0,0,0.6)` }}>
          <p className="text-[10px] italic leading-snug" style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>"{riddle}"</p>
        </div>
      ) : hoverFeature && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-44 rounded-lg px-3 py-2 text-center"
          style={{ background: "rgba(6,4,10,0.95)", border: `1px solid ${accent}66`, boxShadow: `0 8px 24px rgba(0,0,0,0.6)` }}>
          {hoverPrice && <p className="text-[11px] font-bold" style={{ color: accent }}>{hoverPrice}</p>}
          <p className="text-[10px] text-white/70 leading-snug">{hoverFeature}</p>
        </div>
      )}
      {/* founder nameplate above the portrait */}
      {founder && (
        <p className="mb-1.5 text-[9px] sm:text-[10px] font-semibold italic tracking-wide whitespace-nowrap" style={{ color: accent, fontFamily: "'Playfair Display', serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          {founder}
        </p>
      )}
      {/* framed canvas — flat; the parent wall provides the perspective tilt.
          Ornate gold outer frame + dark inner mat with a thin accent bevel. */}
      <div
        className="relative w-20 h-28 sm:w-24 sm:h-32 transition-all duration-300 group-hover:-translate-y-1 p-[3px]"
        style={{
          borderRadius: "4px",
          background: "linear-gradient(150deg, #2a2a2a 0%, #141414 45%, #000000 100%)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.6), inset 0 0 6px rgba(255,255,255,0.04)",
        }}
      >
        <div className="relative w-full h-full rounded-[2px] overflow-hidden" style={{ border: "2px solid #14110d", background: "#14110d" }}>
          {image ? (
            <img src={image} alt={label} className="lore-glitch-target absolute inset-[2px] object-cover rounded-[1px]" style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }} />
          ) : (
            <div
              className="absolute inset-[2px] rounded-[1px]"
              style={{
                background: `radial-gradient(circle at 30% 25%, ${accent}66, transparent 55%), radial-gradient(circle at 75% 70%, #6d6fb855, transparent 60%), linear-gradient(160deg, #efe9df, #cfd2e2)`,
              }}
            />
          )}
          {/* thin inner accent bevel */}
          <span className="absolute inset-[2px] rounded-[1px] pointer-events-none" style={{ border: `1px solid ${accent}55` }} />
          {/* data-glitch scanline shimmer — only visible on hover when a riddle exists */}
          {riddle && (
            <span className="lore-glitch-scan absolute inset-0 rounded-[1px] pointer-events-none opacity-0 transition-opacity mix-blend-screen"
              style={{ background: `repeating-linear-gradient(0deg, ${accent}22 0px, transparent 2px, transparent 3px, ${accent}22 4px)` }} />
          )}
        </div>
        {/* hover glow */}
        <div className="absolute inset-0 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 28px 5px ${accent}77` }} />
      </div>
      {/* label plate beneath the frame */}
      <div className="mt-2 text-center w-28 px-1.5 py-1 rounded bg-black/55 backdrop-blur-sm">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] leading-tight whitespace-nowrap" style={{ color: accent, fontFamily: "'Playfair Display', serif" }}>
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/60 leading-tight whitespace-nowrap">{sublabel}</p>}
      </div>
      {/* Copy Riddle — word-of-mouth share, appears on hover when lore exists */}
      {riddle && (
        <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <CopyRiddleButton founder={founder} riddle={riddle} accent={accent} />
        </div>
      )}
    </button>
  );
}