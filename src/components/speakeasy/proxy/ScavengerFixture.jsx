import React from "react";

/**
 * A hidden, clickable scavenger-hunt fixture — fully invisible, blending into
 * the décor with no icon, glow, or checkmark. Only members who know where to
 * click will find it. The hunt logic is unchanged; only the visuals are gone.
 */
export default function ScavengerFixture({ style, onClick }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="absolute z-10 w-9 h-9 cursor-default focus:outline-none"
      aria-label="Inspect fixture"
    />
  );
}