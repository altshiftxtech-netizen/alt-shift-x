import React from "react";

const BRASS = "#C8A95B";
const STEEL_LIGHT = "#c7ccd4";
const STEEL_MID = "#8b929c";
const STEEL_DARK = "#4a4f57";
const GLOW = "#7fe0d8";

/**
 * A friendly robot bartender standing behind the bar. Purely decorative chrome
 * automaton with a warm brass trim and softly glowing eyes; a small "Ask me"
 * tag and a gentle pulse hint that it's interactive. Clickable via onClick.
 */
export default function BartenderRobot({ style, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ask the bartender robot"
      className="group absolute -translate-x-1/2 z-20 select-none focus:outline-none"
      style={style}
    >
      {/* soft ground glow */}
      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-16 h-3 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GLOW}44, transparent 70%)`, filter: "blur(2px)" }} />

      <div className="relative flex flex-col items-center animate-[float_4s_ease-in-out_infinite]">
        {/* head */}
        <div className="relative w-11 h-9 rounded-2xl" style={{
          background: `linear-gradient(160deg, ${STEEL_LIGHT}, ${STEEL_MID})`,
          border: `1.5px solid ${BRASS}`,
          boxShadow: `inset 0 2px 4px rgba(255,255,255,0.5), 0 3px 8px rgba(0,0,0,0.5)`,
        }}>
          {/* antenna */}
          <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-0.5 h-2" style={{ background: STEEL_DARK }} />
          <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ background: BRASS, boxShadow: `0 0 6px ${BRASS}` }} />
          {/* eyes */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-2.5">
            {[0, 1].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full" style={{
                background: GLOW, boxShadow: `0 0 8px 2px ${GLOW}`,
              }} />
            ))}
          </div>
          {/* mouth grille */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-0.5 h-1.5 rounded-full" style={{ background: STEEL_DARK }} />
            ))}
          </div>
        </div>

        {/* neck */}
        <div className="w-3 h-1.5" style={{ background: STEEL_DARK }} />

        {/* torso with bow-tie + brass buttons */}
        <div className="relative w-14 h-12 rounded-xl -mt-0.5" style={{
          background: `linear-gradient(160deg, ${STEEL_MID}, ${STEEL_DARK})`,
          border: `1.5px solid ${BRASS}`,
          boxShadow: `inset 0 2px 4px rgba(255,255,255,0.25), 0 4px 10px rgba(0,0,0,0.55)`,
        }}>
          {/* bow tie */}
          <div className="absolute left-1/2 top-1.5 -translate-x-1/2 flex items-center">
            <span className="w-2 h-2.5" style={{ background: BRASS, clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }} />
            <span className="w-1 h-1 rounded-full" style={{ background: "#6b5426" }} />
            <span className="w-2 h-2.5" style={{ background: BRASS, clipPath: "polygon(0 0, 0 100%, 100% 50%)" }} />
          </div>
          {/* buttons */}
          <div className="absolute left-1/2 top-6 -translate-x-1/2 flex flex-col gap-1 items-center">
            {[0, 1].map((i) => (
              <span key={i} className="w-1 h-1 rounded-full" style={{ background: BRASS, boxShadow: `0 0 4px ${BRASS}88` }} />
            ))}
          </div>
          {/* arms */}
          <div className="absolute -left-1.5 top-2 w-1.5 h-7 rounded-full" style={{ background: STEEL_MID, border: `1px solid ${BRASS}66` }} />
          <div className="absolute -right-1.5 top-2 w-1.5 h-7 rounded-full" style={{ background: STEEL_MID, border: `1px solid ${BRASS}66` }} />
        </div>
      </div>

      {/* Ask-me tag */}
      <div className="mt-1 mx-auto w-max px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-transform group-hover:scale-105"
        style={{ background: "rgba(0,0,0,0.55)", color: BRASS, border: `1px solid ${BRASS}55`, backdropFilter: "blur(2px)" }}>
        Ask the Barkeep
      </div>

      {/* hover halo */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `0 0 26px 6px ${GLOW}55` }} />

      <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </button>
  );
}