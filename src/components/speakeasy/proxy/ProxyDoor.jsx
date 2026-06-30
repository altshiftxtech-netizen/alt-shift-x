import React from "react";

/**
 * A labeled arch "gate" sitting on the back-wall skeleton.
 * Not a literal door — a rounded-top arch outline with a glowing rim that
 * acts as the gateway to a page. Positioned absolutely via the `style` prop.
 */
export default function ProxyDoor({ label, sublabel, onClick, style, accent = "#C8A95B" }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex flex-col items-center justify-end focus:outline-none -translate-x-1/2"
      aria-label={`Enter ${label}`}
    >
      {/* arch outline */}
      <div
        className="relative w-20 h-24 sm:w-24 sm:h-28 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          borderTopLeftRadius: "9999px",
          borderTopRightRadius: "9999px",
          border: `2px solid ${accent}`,
          borderBottom: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 100%)",
          boxShadow: `inset 0 0 22px ${accent}33`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            borderTopLeftRadius: "9999px",
            borderTopRightRadius: "9999px",
            boxShadow: `0 0 26px 4px ${accent}66`,
          }}
        />
      </div>
      {/* label sits inside the arch */}
      <div className="absolute inset-x-0 bottom-3 text-center px-1">
        <p
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] leading-tight"
          style={{ color: accent, fontFamily: "'Playfair Display', serif" }}
        >
          {label}
        </p>
        {sublabel && <p className="text-[9px] text-white/55 leading-tight">{sublabel}</p>}
      </div>
    </button>
  );
}