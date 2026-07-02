import React from "react";

const GOLD = "#E6C878";
const LAMP = "#FFE6A6";

/**
 * ProxyBar — a freestanding lit bar counter sitting on the floor in the
 * foreground of the room. Rendered in screen space (not the 3D stage) so it
 * reads as a solid centerpiece: a back shelf of bottles, a glowing under-bar
 * light, and a polished wood counter with a brass foot rail.
 */
export default function ProxyBar({ style }) {
  return (
    <div
      className="absolute -translate-x-1/2 z-10 pointer-events-none select-none"
      style={{ width: "20%", maxWidth: 300, minWidth: 170, ...style }}
    >
      {/* Back bottle shelf */}
      <div
        className="relative mx-auto w-[78%] h-20 rounded-t-md overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1a120b, #2a1d12)",
          border: `1px solid ${GOLD}44`,
          boxShadow: `inset 0 0 24px ${LAMP}22`,
        }}
      >
        {[24, 50, 76].map((t) => (
          <div key={t} className="absolute inset-x-3 flex justify-between" style={{ top: `${t}%` }}>
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="w-1.5 rounded-sm"
                style={{ height: 13, background: `linear-gradient(180deg, ${GOLD}cc, #5a3f1f)`, opacity: 0.85 }} />
            ))}
          </div>
        ))}
      </div>

      {/* Counter body */}
      <div
        className="relative w-full h-24"
        style={{
          background: "linear-gradient(180deg, #3a2818 0%, #2a1d11 55%, #1c130b 100%)",
          borderTop: `2px solid ${GOLD}88`,
          borderLeft: `1px solid ${GOLD}33`,
          borderRight: `1px solid ${GOLD}33`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,220,160,0.05) 0px, rgba(255,220,160,0.05) 2px, transparent 2px, transparent 18px)",
        }}
      >
        {/* warm under-counter glow */}
        <div className="absolute inset-x-6 top-2 h-3 rounded-full"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${LAMP}66, transparent 70%)` }} />

        {/* polished counter top highlight */}
        <div className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: `linear-gradient(180deg, ${LAMP}aa, transparent)` }} />

        {/* brass foot rail */}
        <div className="absolute inset-x-3 bottom-3 h-1 rounded-full"
          style={{ background: `linear-gradient(180deg, ${GOLD}, rgba(150,115,55,0.7))`, boxShadow: `0 0 10px ${GOLD}66` }} />

        {/* two bar lamps glowing on the counter */}
        {[26, 74].map((l) => (
          <div key={l} className="absolute" style={{ left: `${l}%`, top: "18%", transform: "translateX(-50%)" }}>
            <div className="w-4 h-4 rounded-full"
              style={{ background: `radial-gradient(circle, ${LAMP}, ${GOLD})`, boxShadow: `0 0 22px 8px ${LAMP}88` }} />
          </div>
        ))}
      </div>
    </div>
  );
}