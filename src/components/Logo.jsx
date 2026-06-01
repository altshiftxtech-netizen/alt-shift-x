import React from "react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/031f54965_altxlogo2.jpg";

/**
 * Protected logo — blocks right-click, double-click save, drag, and context menu.
 * Always links back to the homepage.
 */
export default function Logo({ className = "h-8 w-auto" }) {
  const block = (e) => e.preventDefault();

  return (
    <Link to="/" draggable={false} className="inline-flex items-center justify-center rounded-xl bg-violet-950/60 backdrop-blur-sm border border-violet-500/20 p-1.5 shadow-lg shadow-violet-900/30">
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