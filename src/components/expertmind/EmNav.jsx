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
        {/* Left: Alt+Shift+X logo lockup */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold tracking-tight"
            style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.primary2})` }}
          >
            X
          </div>
          <div className="leading-none">
            <span className="text-[15px] font-semibold" style={{ color: EM.primary }}>Alt+Shift+X.tech</span>
            <span className="hidden sm:inline text-[11px] font-medium ml-2" style={{ color: EM.accent }}>ExpertMind™</span>
          </div>
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
            style={{ background: EM.primary, boxShadow: `0 1px 2px ${EM.shadow}` }}
          >
            Launch ExpertMind Extraction
          </button>
        </div>
      </nav>
    </header>
  );
}