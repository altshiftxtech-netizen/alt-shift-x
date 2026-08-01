import React from "react";
import { Link, useLocation } from "react-router-dom";

const BOBBY_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/5af913bb7_Copilot_20260801_162657.png";

// BobbyTopBar — a slim site-navigation bar exclusive to BOBby pages.
// Distinct from SharedNav: pure gold-on-black, serif wordmark, no portal switcher.
// Logo → homepage; nav links return to the chat screen and Bobby sub-pages.
const LINKS = [
  { to: "/builder/bobby", label: "Chat" },
  { to: "/builder/bobby/quick-edits", label: "Quick Edits" },
  { to: "/dashboard", label: "Portal" },
];

export default function BobbyTopBar() {
  const { pathname } = useLocation();
  const active = (to) => pathname === to;

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 h-12 border-b border-[#D4AF37]/20 bg-black/80 backdrop-blur-md shrink-0">
      <Link to="/" className="flex items-center gap-2 group min-w-0" aria-label="BOBby — back to homepage">
        <img
          src={BOBBY_LOGO}
          alt="BOBby"
          className="w-7 h-7 rounded-md object-cover shrink-0 ring-1 ring-[#D4AF37]/30 transition-transform group-hover:scale-105"
        />
        <span
          className="font-bold text-[#D4AF37] tracking-wide text-sm truncate"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          BOBby
        </span>
      </Link>

      <nav className="flex items-center gap-1 min-w-0">
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
              active(to)
                ? "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40"
                : "text-white/50 border-transparent hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}