import React from "react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b9193c2b6_Copilot_20260601_015315.png";

/**
 * Protected logo — blocks right-click, double-click save, drag, and context menu.
 * Always links back to the homepage.
 */
export default function Logo({ className = "h-8 w-auto" }) {
  const block = (e) => e.preventDefault();

  return (
    <Link to="/" draggable={false} className="inline-flex items-center justify-center rounded-xl overflow-hidden">
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