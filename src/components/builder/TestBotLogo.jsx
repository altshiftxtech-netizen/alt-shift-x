import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/34b77122f_Copilot_20260731_043422.png";

export default function TestBotLogo({ size = 40, className = "" }) {
  return (
    <img
      src={LOGO_URL}
      alt="BOT-X Test Bot"
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}