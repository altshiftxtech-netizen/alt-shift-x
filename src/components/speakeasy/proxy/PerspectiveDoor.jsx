import React from "react";

/**
 * A tall arched door mounted flat on an angled side wall of the PerspectiveRoom.
 * `side` = "left" | "right". `depth` 0 (nearest viewer) → 1 (deepest, by the
 * back wall) drives horizontal position, vertical centering and scale so the
 * doors recede convincingly toward the vanishing point — matching the draft
 * where arched doors line both side walls.
 */
export default function PerspectiveDoor({ label, sublabel, onClick, side = "left", depth = 0, accent = "#C8A95B" }) {
  // Near doors are big & toward the screen edges; far doors shrink toward center.
  const scale = 1 - depth * 0.4;
  const edge = 5 + depth * 26;          // % from the wall's outer edge inward
  const horizontal = side === "left" ? { left: `${edge}%` } : { right: `${edge}%` };
  const skewY = side === "left" ? -16 : 16; // shear to lie flat on the angled wall

  return (
    <button
      onClick={onClick}
      aria-label={`Enter ${label}`}
      className="group absolute z-20 focus:outline-none"
      style={{
        ...horizontal,
        top: "44%",
        transform: `translateY(-50%) skewY(${skewY}deg) scale(${scale})`,
        transformOrigin: side === "left" ? "left center" : "right center",
      }}
    >
      {/* Arched door frame — glowing line-art, like the draft */}
      <div
        className="relative w-[88px] h-[180px] rounded-t-full border-2 transition-all duration-300 group-hover:brightness-125"
        style={{
          borderColor: accent,
          background: "linear-gradient(180deg, rgba(10,7,14,0.92) 0%, rgba(4,3,8,0.98) 100%)",
          boxShadow: `0 0 22px ${accent}44, inset 0 0 30px rgba(0,0,0,0.6)`,
        }}
      >
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 40px 8px ${accent}88` }}
        />
        {/* inner arched panel */}
        <span className="absolute inset-[7px] rounded-t-full border" style={{ borderColor: `${accent}66` }} />
        {/* center seam */}
        <span className="absolute left-1/2 top-[14%] bottom-[8%] w-px -translate-x-1/2" style={{ background: `${accent}40` }} />
        {/* knob */}
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      </div>

      {/* Label — un-skewed so it reads flat to the viewer */}
      <div className="mt-2 text-center" style={{ transform: `skewY(${-skewY}deg)` }}>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.18em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
        >
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/55">{sublabel}</p>}
      </div>
    </button>
  );
}