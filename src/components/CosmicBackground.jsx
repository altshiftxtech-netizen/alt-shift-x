import React, { useEffect } from "react";

// Cosmic futuristic background — combines the nebula image with animated
// CSS starfield layers. Fixed full-screen, sits behind all content (z-0).
const NEBULA_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b4ada9d98_Copilot_20260731_032913.png";

export default function CosmicBackground() {
  // Tag the body so CSS can apply glassmorphism to cards on cosmic pages only.
  useEffect(() => {
    document.body.classList.add("cosmic-page");
    return () => document.body.classList.remove("cosmic-page");
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Nebula image base */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${NEBULA_URL}')` }}
      />
      {/* Cosmic gradient overlay (from provided CSS, with alpha for image blend) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(255,111,216,0.25) 0, transparent 40%)," +
            "radial-gradient(circle at 80% 100%, rgba(0,245,255,0.25) 0, transparent 45%)," +
            "radial-gradient(circle at 10% 80%, rgba(123,44,255,0.25) 0, transparent 40%)," +
            "linear-gradient(135deg, rgba(5,8,22,0.82), rgba(27,31,59,0.68), rgba(75,47,114,0.6))",
        }}
      />
      {/* Starfield layers */}
      <div className="cosmic-stars cosmic-stars-1" />
      <div className="cosmic-stars cosmic-stars-2" />
      <div className="cosmic-stars cosmic-stars-3" />
    </div>
  );
}