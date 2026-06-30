import React from "react";

/**
 * The central bar with a barkeeper and a horseshoe of stools — the focal point
 * of the Proxy Room, matching the draft's "Bar / Bar Keeper" centerpiece.
 */
export default function SpeakeasyBar() {
  // Stools arranged in a U around the front of the bar.
  const stools = [
    { left: "16%", top: "86%" }, { left: "30%", top: "94%" }, { left: "46%", top: "98%" },
    { left: "62%", top: "98%" }, { left: "78%", top: "94%" }, { left: "90%", top: "86%" },
    { left: "8%", top: "70%" }, { left: "94%", top: "70%" },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-[340px] sm:w-[420px] z-10">
      {/* Back-bar shelf glow */}
      <div
        className="mx-auto w-3/4 h-10 rounded-t-xl mb-1"
        style={{
          background: "linear-gradient(180deg, rgba(200,169,91,0.22), rgba(200,169,91,0.04))",
          borderTop: "1px solid rgba(200,169,91,0.4)",
          boxShadow: "0 -6px 24px rgba(200,169,91,0.25)",
        }}
      />

      {/* Barkeeper behind the counter */}
      <div className="relative flex justify-center -mb-3 z-20">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: "linear-gradient(135deg, #2a2018, #15100a)",
            border: "2px solid rgba(200,169,91,0.6)",
            boxShadow: "0 0 18px rgba(200,169,91,0.4)",
          }}
        >
          🤵
        </div>
      </div>

      {/* The bar counter */}
      <div
        className="relative h-16 rounded-2xl"
        style={{
          background: "linear-gradient(180deg, #3a2c1d, #1a120a)",
          border: "1px solid rgba(200,169,91,0.5)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 2px 0 rgba(200,169,91,0.35)",
        }}
      >
        <p
          className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.4em] text-[#C8A95B]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          The Bar
        </p>
        <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-[#C8A95B]/60">
          Bar Keeper
        </p>
      </div>

      {/* Stools */}
      {stools.map((s, i) => (
        <span
          key={i}
          className="absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            ...s,
            background: "radial-gradient(circle at 35% 30%, #6b4f2a, #2a1d10)",
            border: "1px solid rgba(200,169,91,0.45)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          }}
        />
      ))}
    </div>
  );
}