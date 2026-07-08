import React from "react";
import { X, Compass } from "lucide-react";
import { EM } from "./emTokens";

const MISSION =
  "Alt + Shift + X is a B2B and B2C marketplace where businesses buy, sell, build, and manage operational intelligence components — protocols, training modules, reasoning frameworks, speed configurations, and pre-built AI agent solutions. It serves as the central exchange for organizations that want to enhance their AI agent capabilities with domain-specific, plug-and-play components built on the YottaJoule / Claire architecture.";

/**
 * Mission Statement tab modal — a highlighted glass card that gates the
 * platform mission statement. Opens from the floating "Mission" tab.
 */
export default function EmMissionModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(11,21,38,0.45)", backdropFilter: "blur(3px)" }}
      />

      {/* Modal panel — slight highlight glow */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: EM.surface,
          border: `1px solid ${EM.border}`,
          boxShadow: `0 0 0 1px rgba(37,99,235,0.18), 0 8px 30px rgba(15,30,61,0.22), 0 0 24px rgba(37,99,235,0.15)`,
        }}
      >
        {/* Tab header bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${EM.border}`, background: EM.surfaceAlt }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})` }}
            >
              <Compass className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: EM.accent }}>
                Platform
              </p>
              <p className="text-[15px] font-bold tracking-tight" style={{ color: EM.primary }}>
                Our Mission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white"
            style={{ color: EM.muted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission content */}
        <div className="px-6 py-6">
          <p className="text-[15px] leading-relaxed" style={{ color: EM.text }}>
            {MISSION}
          </p>
        </div>

        {/* Footer lockup */}
        <div
          className="flex items-center gap-2.5 px-6 py-3.5"
          style={{ borderTop: `1px solid ${EM.border}`, background: EM.surfaceAlt }}
        >
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b0a6e86d1_Copilot_20260705_193928.png"
            alt="expertminds"
            className="w-6 h-6 object-contain"
            draggable="false"
          />
          <span className="text-[13px] font-bold tracking-tight" style={{ color: EM.primary }}>
            expert<span style={{ color: EM.accent }}>minds</span>™
          </span>
          <span className="text-[12px] font-medium" style={{ color: EM.muted }}>· Alt+Shift+X.tech</span>
        </div>
      </div>
    </div>
  );
}