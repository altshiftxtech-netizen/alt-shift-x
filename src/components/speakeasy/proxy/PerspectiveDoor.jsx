import React from "react";

/**
 * A door mounted flat on an angled side wall of the PerspectiveRoom.
 * `side` = "left" | "right". `depth` 0 (nearest viewer) → 1 (deepest, by the
 * back wall) drives horizontal position, vertical centering and scale so the
 * doors recede convincingly toward the vanishing point — matching the draft
 * where doors line both side walls.
 */
export default function PerspectiveDoor({ label, sublabel, onClick, side = "left", depth = 0, accent = "#C8A95B" }) {
  // Near doors are big & toward the screen edges; far doors shrink toward center.
  const scale = 1 - depth * 0.46;
  const edge = 3 + depth * 30;        // % from the wall's outer edge inward
  const top = 50;                      // vertically centered on the wall band
  const horizontal = side === "left" ? { left: `${edge}%` } : { right: `${edge}%` };
  const skewY = side === "left" ? -20 : 20; // shear to lie flat on the angled wall

  return (
    <button
      onClick={onClick}
      aria-label={`Enter ${label}`}
      className="group absolute z-20 focus:outline-none"
      style={{
        ...horizontal,
        top: `${top}%`,
        transform: `translateY(-50%) skewY(${skewY}deg) scale(${scale})`,
        transformOrigin: side === "left" ? "left center" : "right center",
      }}
    >
      <div
        className="relative w-24 h-44 rounded-t-[2rem] border-2 transition-all duration-300 group-hover:brightness-125"
        style={{
          borderColor: accent,
          background: "linear-gradient(180deg, rgba(28,20,12,0.96) 0%, rgba(12,8,6,0.99) 100%)",
        }}
      >
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-t-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 34px 6px ${accent}77`, border: `1px solid ${accent}` }}
        />
        {/* recessed panels */}
        <span className="absolute inset-x-3 top-3 bottom-1/2 rounded-t-2xl border border-white/10" />
        <span className="absolute inset-x-3 top-1/2 bottom-3 rounded-md border border-white/10" />
        {/* knob */}
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        {/* arched transom light */}
        <span
          className="absolute left-1/2 -translate-x-1/2 -top-1 w-14 h-3 rounded-full blur-[2px]"
          style={{ background: `${accent}55` }}
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