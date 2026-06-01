import React from "react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/01fdea6b9_3rdaltshiftxlogo.png";

/**
 * Protected logo — blocks right-click, double-click save, drag, and context menu.
 * Always links back to the homepage.
 */
export default function Logo({ className = "h-8 w-auto" }) {
  const block = (e) => e.preventDefault();

  return (
    <Link to="/" draggable={false} className="inline-flex items-center justify-center rounded-xl p-1" style={{ background: "radial-gradient(ellipse at center, rgba(120,60,180,0.55) 0%, rgba(60,10,90,0.75) 100%)", backdropFilter: "blur(6px)", boxShadow: "0 0 18px 4px rgba(140,60,200,0.35)" }}>
      <img
        src={LOGO_URL}
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