import React from "react";
import { Link } from "react-router-dom";

// Two brand logos:
// - purple: diamond logo on purple background — for dark/video pages (Home, Marketplace)
// - white: diamond logo on white background — for light pages (dashboards, nav, etc.)
const LOGOS = {
  purple: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/404bd4b4e_Copilot_20260601_015315.png",
  white: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/beac80924_altxlogo2.jpg",
};

/**
 * Protected logo — blocks right-click, double-click save, drag, and context menu.
 * Always links back to the homepage.
 * @param {"purple"|"white"} variant — which logo to show (default: white for light backgrounds)
 */
export default function Logo({ className = "h-8 w-auto", variant = "white" }) {
  const block = (e) => e.preventDefault();
  const src = LOGOS[variant] || LOGOS.white;

  return (
    <Link to="/" draggable={false} className="inline-flex items-center justify-center rounded-xl overflow-hidden">
      <img
        src={src}
        alt="Alt+Shift+X"
        className={className}
        draggable={false}
        onContextMenu={block}
        onDoubleClick={block}
        onDragStart={block}
        onMouseDown={(e) => { if (e.button === 2) block(e); }}
        style={{ userSelect: "none", WebkitUserDrag: "none" }}
      />
    </Link>
  );
}