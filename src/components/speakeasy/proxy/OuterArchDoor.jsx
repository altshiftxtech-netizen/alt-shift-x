import React from "react";

/**
 * A large standalone arched doorway framed on a flat outer wall, flanking the
 * perspective room (Marketplace on the left, The Feed on the right) — matching
 * the draft's two big glowing arches outside the box.
 */
export default function OuterArchDoor({ label, sublabel, onClick, accent = "#C8A95B", side = "left" }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Enter ${label}`}
      className="group flex flex-col items-center focus:outline-none"
    >
      <div
        className="relative w-28 h-64 sm:w-32 sm:h-72 rounded-t-full border-[3px] transition-all duration-300 group-hover:brightness-125"
        style={{
          borderColor: accent,
          background: "linear-gradient(180deg, rgba(10,7,14,0.94) 0%, rgba(3,2,6,0.99) 100%)",
          boxShadow: `0 0 34px ${accent}55, inset 0 0 44px rgba(0,0,0,0.7)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 56px 10px ${accent}99` }}
        />
        <span className="absolute inset-[10px] rounded-t-full border" style={{ borderColor: `${accent}66` }} />
        <span className="absolute left-1/2 top-[12%] bottom-[7%] w-px -translate-x-1/2" style={{ background: `${accent}40` }} />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
        />
      </div>
      <p
        className="mt-3 text-sm font-bold uppercase tracking-[0.22em] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
        style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
      >
        {label}
      </p>
      {sublabel && <p className="text-[10px] text-white/55 mt-0.5">{sublabel}</p>}
    </button>
  );
}