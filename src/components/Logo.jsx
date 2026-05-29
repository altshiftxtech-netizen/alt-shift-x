import React from "react";

export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <div
      className={`select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ WebkitUserDrag: "none", userSelect: "none" }}
    >
      <img
        src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b94975acf_AltShiftXLogo.png"
        alt="Alt+Shift+X Market"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="h-full w-auto pointer-events-none"
        style={{ WebkitUserDrag: "none", userSelect: "none" }}
      />
    </div>
  );
}