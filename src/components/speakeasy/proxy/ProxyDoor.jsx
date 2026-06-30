import React from "react";

/**
 * A flat framed poster hung on the wall that acts as a gateway to a page.
 * A dark panel with a thin gold-cream frame and a title set on the poster,
 * a small sublabel beneath. Positioned absolutely via the `style` prop.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#D8C18A" }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center focus:outline-none -translate-x-1/2"
      aria-label={`Enter ${label}`}
    >
      {/* flat framed poster */}
      <div
        className="relative w-16 h-24 sm:w-20 sm:h-28 transition-all duration-300 group-hover:-translate-y-1 flex items-center justify-center px-1.5"
        style={{
          borderRadius: "2px",
          border: `2px solid ${accent}`,
          background: "linear-gradient(180deg, #1d150d 0%, #100b06 100%)",
          boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
        }}
      >
        {/* inner mat line */}
        <span className="absolute inset-1.5 rounded-[1px] border" style={{ borderColor: `${accent}33` }} />
        {/* poster title */}
        <p
          className="relative text-center text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.15em] leading-tight"
          style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
        >
          {label}
        </p>
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 22px 3px ${accent}55` }}
        />
      </div>
      {/* sublabel beneath the poster */}
      {sublabel && (
        <p className="mt-1.5 text-[9px] text-white/55 leading-tight text-center max-w-[5rem]">{sublabel}</p>
      )}
    </button>
  );
}