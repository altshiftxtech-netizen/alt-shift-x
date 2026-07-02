import React from "react";

const WOOD_LIGHT = "#8a5a30";
const WOOD_DARK = "#3a2414";
const BRASS = "#C8A95B";

/**
 * The room's back centerpiece — a grand wooden double door with a warm,
 * interior-matching finish. Two paneled leaves meet at the center, framed by a
 * dark timber surround with a brass handle set and a soft warm glow spilling
 * from the seam. Clickable when onClick is provided.
 */
export default function ProxyBar({ style, onClick }) {
  const Leaf = ({ side }) => (
    <div
      className="relative flex-1 h-full"
      style={{
        background: `repeating-linear-gradient(180deg, ${WOOD_LIGHT} 0px, ${WOOD_LIGHT} 6px, ${WOOD_DARK} 6px, ${WOOD_DARK} 9px)`,
        backgroundColor: WOOD_LIGHT,
        boxShadow: "inset 0 0 26px rgba(0,0,0,0.55)",
        borderRight: side === "left" ? "1px solid rgba(0,0,0,0.6)" : "none",
        borderLeft: side === "right" ? "1px solid rgba(0,0,0,0.6)" : "none",
      }}
    >
      {/* two recessed raised panels per leaf */}
      <div
        className="absolute inset-x-[16%] top-[8%] h-[40%] rounded-sm"
        style={{ border: `2px solid ${WOOD_DARK}`, boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 1px 0 ${BRASS}22` }}
      />
      <div
        className="absolute inset-x-[16%] bottom-[8%] h-[40%] rounded-sm"
        style={{ border: `2px solid ${WOOD_DARK}`, boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 1px 0 ${BRASS}22` }}
      />
      {/* brass handle near the center seam */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-6 rounded-full"
        style={{
          [side === "left" ? "right" : "left"]: "6%",
          background: `linear-gradient(180deg, ${BRASS}, #6b5426)`,
          boxShadow: `0 0 8px ${BRASS}77`,
        }}
      />
    </div>
  );

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      aria-label="Wooden double door"
      className="group absolute -translate-x-1/2 z-10 select-none focus:outline-none"
      style={{ width: "22%", maxWidth: 320, minWidth: 180, ...style }}
    >
      {/* timber surround / frame */}
      <div
        className="relative w-full h-44 p-2 rounded-t-md"
        style={{
          background: `linear-gradient(180deg, ${WOOD_DARK}, #1c130b)`,
          border: `2px solid ${BRASS}55`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* the two door leaves */}
        <div className="relative flex w-full h-full rounded-sm overflow-hidden">
          <Leaf side="left" />
          <Leaf side="right" />
          {/* warm light glowing from the center seam */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${BRASS}55, transparent)` }}
          />
        </div>
        {/* hover glow */}
        <div
          className="absolute inset-0 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `0 0 30px 6px ${BRASS}66` }}
        />
      </div>
      {/* warm light spilling under the doors */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${BRASS}66, transparent 70%)`, filter: "blur(3px)" }}
      />
    </button>
  );
}