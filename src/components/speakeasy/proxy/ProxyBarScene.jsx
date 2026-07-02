import React from "react";

const BRASS = "#C8A95B";
const GLOW = "#FFE1A6";

const BAR_IMG =
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/e0ab8cc78_generated_image.png";

/**
 * The Founders' Room bar — a full art-deco speakeasy scene (robot barkeep +
 * lit back-bar + glowing counter) rendered from a single generated image.
 * The robot's torso is a clickable hotspot that opens the Bartender chat.
 */
export default function ProxyBarScene({ style, onAskBartender }) {
  return (
    <div className="absolute -translate-x-1/2 z-10 select-none" style={{ width: "30%", maxWidth: 420, minWidth: 260, ...style }}>
      <div className="relative">
        <img
          src={BAR_IMG}
          alt="The Founders' Room bar with the robot barkeep"
          className="w-full object-contain rounded-lg"
          style={{ filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.7))" }}
        />

        {/* Clickable robot hotspot — centered over the bartender's torso/head. */}
        <button
          onClick={onAskBartender}
          aria-label="Ask the bartender"
          className="group absolute focus:outline-none"
          style={{ left: "36%", top: "18%", width: "28%", height: "52%" }}
        >
          {/* soft glow on hover to signal interactivity */}
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ boxShadow: `0 0 40px 10px ${GLOW}55`, background: `radial-gradient(ellipse at center, ${GLOW}18, transparent 70%)` }} />
        </button>

        {/* Ask-me tag floating over the counter */}
        <button
          onClick={onAskBartender}
          className="absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-transform hover:scale-105 focus:outline-none"
          style={{ bottom: "6%", background: "rgba(0,0,0,0.65)", color: BRASS, border: `1px solid ${BRASS}66`, backdropFilter: "blur(3px)" }}
        >
          Ask the Barkeep
        </button>
      </div>
    </div>
  );
}