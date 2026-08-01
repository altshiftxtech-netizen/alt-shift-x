import React from "react";
import { X } from "lucide-react";

const MISSION_LOGO =
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/fa600c7d4_purplealtshiftxlogo.jpg";

const MISSION =
  "Alt + Shift + X is a B2B and B2C marketplace where businesses buy, sell, build, and manage operational intelligence components — protocols, training modules, reasoning frameworks, speed configurations, and pre-built AI agent solutions. It serves as the central exchange for organizations that want to enhance their AI agent capabilities with domain-specific, plug-and-play components built on the YottaJoule / Claire architecture.";

/**
 * Homepage mission tab modal — dark glass card with a highlighted glow,
 * gating the Alt+Shift+X platform mission statement.
 */
export default function HomeMissionModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-slate-900/95 backdrop-blur-md"
        style={{
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 0 1px rgba(139,92,246,0.2), 0 8px 30px rgba(0,0,0,0.4), 0 0 24px rgba(139,92,246,0.2)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={MISSION_LOGO}
              alt="Alt+Shift+X logo"
              className="w-9 h-9 rounded-lg object-cover shrink-0"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400">Platform</p>
              <p className="text-[15px] font-bold tracking-tight text-white">Our Mission</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-[15px] leading-relaxed text-white/80">{MISSION}</p>
        </div>

        <div
          className="flex items-center gap-2 px-6 py-3.5 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <span className="text-[13px] font-bold tracking-tight text-white">Alt+Shift+X</span>
          <span className="text-[12px] font-medium text-white/40">.tech</span>
        </div>
      </div>
    </div>
  );
}