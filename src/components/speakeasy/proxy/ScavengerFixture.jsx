import React from "react";

/**
 * A hidden, clickable scavenger-hunt fixture.
 * Looks like part of the décor — only a faint shimmer on hover hints it's
 * interactive. Once found, it shows a small gold checkmark.
 */
export default function ScavengerFixture({ icon, title, style, found, onClick }) {
  return (
    <button
      onClick={onClick}
      style={style}
      title={found ? "Already found" : ""}
      className="group absolute z-10 w-9 h-9 rounded-lg flex items-center justify-center focus:outline-none"
      aria-label="Inspect fixture"
    >
      <span
        className={`absolute inset-0 rounded-lg transition-all duration-300 ${
          found ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          boxShadow: found ? "0 0 12px 2px rgba(200,169,91,0.5)" : "0 0 18px 4px rgba(200,169,91,0.45)",
          border: "1px solid rgba(200,169,91,0.6)",
        }}
      />
      <span className={`relative text-base transition-opacity ${found ? "opacity-90" : "opacity-30 group-hover:opacity-90"}`}>
        {found ? "✓" : icon}
      </span>
    </button>
  );
}