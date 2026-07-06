import React from "react";
import { Link } from "react-router-dom";
import { Home, DoorOpen } from "lucide-react";
import { EM } from "./emTokens";
import { useEmLaunch } from "./EmLaunchContext";

const LINKS = [
  { label: "Overview", href: "#hero" },
  { label: "Process", href: "#how-it-works" },
  { label: "Outputs", href: "#outputs" },
  { label: "Enterprise", href: "#enterprise-use-cases" },
  { label: "Revenue", href: "#revenue-model" },
];

/** Sticky executive top navigation — white, thin bottom border. */
export default function EmNav() {
  const launch = useEmLaunch();
  // Visitors who entered via the Founder's Room portrait carry a ?tier= flag —
  // give them a door back into the Speakeasy. Everyone gets a door back home.
  const cameFromPortrait = new URLSearchParams(window.location.search).has("tier");
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-sm"
      style={{ background: "rgba(255,255,255,0.92)", borderBottom: `1px solid ${EM.border}` }}
    >
      <nav className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Left: expertminds circuit-node logo lockup */}
        <div className="flex items-center gap-2.5">
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b0a6e86d1_Copilot_20260705_193928.png"
            alt="expertminds"
            className="w-9 h-9 object-contain"
            draggable="false"
          />
          <span className="text-[17px] font-bold tracking-tight">
            <span style={{ color: EM.primary }}>expert</span><span style={{ color: EM.accent }}>minds</span>
          </span>
        </div>

        {/* Center: section links */}
        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-[14px] font-medium transition-colors hover:opacity-70" style={{ color: EM.primary2 }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Right: return doors + login + primary control */}
        <div className="flex items-center gap-3">
          {cameFromPortrait && (
            <Link
              to="/speakeasy/proxy-room"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-70"
              style={{ color: EM.accent }}
            >
              <DoorOpen className="w-4 h-4" /> Speakeasy
            </Link>
          )}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:opacity-70"
            style={{ color: EM.muted }}
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <button className="hidden sm:block text-[14px] font-medium transition-colors hover:opacity-70" style={{ color: EM.muted }}>
            Login
          </button>
          <button
            onClick={launch}
            className="text-[13px] font-semibold px-4 py-2 rounded-lg text-white transition-transform hover:-translate-y-px"
            style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})`, boxShadow: `0 1px 2px ${EM.shadow}` }}
          >
            Launch expertminds Extraction
          </button>
        </div>
      </nav>
    </header>
  );
}