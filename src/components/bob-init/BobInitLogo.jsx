import React from "react";

// B.O.B. mascot logo — the blue-circled "B.O.B." robot programmer.
const BOB_LOGO_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/a9d012e62_Copilot_20260730_174633.png";

export default function BobInitLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };
  return (
    <img
      src={BOB_LOGO_URL}
      alt="B.O.B. Init logo"
      className={`${sizes[size] || sizes.md} rounded-full object-cover border-2 border-cyan-400/50 shrink-0 ${className}`}
    />
  );
}

export { BOB_LOGO_URL };