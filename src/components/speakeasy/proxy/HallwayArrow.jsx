import React from "react";

/**
 * A fashionable, art-deco style clickable signpost pointing to a Hallway.
 * Renders a slim glowing arrow with an ornamental tail flourish and a
 * "Hallway" nameplate. `dir` flips it left/right; `onClick` navigates.
 */
export default function HallwayArrow({ dir = "left", label = "Hallway", onClick, style }) {
  const isLeft = dir === "left";
  return (
    <button
      onClick={onClick}
      aria-label={`Enter the ${label}`}
      className="group absolute z-20 flex flex-col items-center gap-1.5 focus:outline-none transition-transform duration-300 hover:-translate-y-0.5"
      style={style}
    >
      <svg
        width="104"
        height="34"
        viewBox="0 0 104 34"
        fill="none"
        className="transition-all duration-300"
        style={{
          transform: isLeft ? "none" : "scaleX(-1)",
          filter: "drop-shadow(0 0 7px rgba(230,200,120,0.55))",
        }}
      >
        <defs>
          <linearGradient id={`ha-${dir}`} x1="0" y1="0" x2="104" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5D890" />
            <stop offset="1" stopColor="#C8A95B" />
          </linearGradient>
        </defs>
        {/* ornamental tail flourish */}
        <circle cx="98" cy="17" r="2.5" fill={`url(#ha-${dir})`} />
        <path d="M92 17 H30" stroke={`url(#ha-${dir})`} strokeWidth="2.5" strokeLinecap="round"
          className="group-hover:stroke-[#FCE7B0]" />
        {/* double chevron head */}
        <path d="M30 6 L14 17 L30 28" stroke={`url(#ha-${dir})`} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" fill="none"
          className="group-hover:stroke-[#FCE7B0]" />
        <path d="M20 8 L7 17 L20 26" stroke={`url(#ha-${dir})`} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"
          className="group-hover:stroke-[#FCE7B0]" />
      </svg>
      <span
        className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#E6C878] group-hover:text-[#FCE7B0] transition-colors px-2 py-0.5 rounded-full border border-[#C8A95B]/30 bg-black/40 backdrop-blur-sm"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {label}
      </span>
    </button>
  );
}