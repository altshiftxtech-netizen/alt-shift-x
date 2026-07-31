import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Fingerprint, Vibrate, Sparkles } from "lucide-react";

// SOV-PROJECT-PREVIEW-1.0 — High-speed interactive preview window.
// Drag Wearable Bridge gestures into the preview to visualize haptic feedback.
// Toggle Brand Absorption to watch the app morph between aesthetics.

const BRANDS = {
  nike: {
    name: "Nike",
    bg: "bg-gradient-to-br from-black to-neutral-900",
    accent: "text-orange-500",
    accentHex: "#f97316",
    border: "border-orange-500/40",
    font: "font-sans font-black italic",
    label: "JUST BUILD IT",
    sub: "Athletic / Consumer aesthetic",
  },
  goldman: {
    name: "Goldman",
    bg: "bg-gradient-to-br from-[#1a1f2e] to-[#0a0e17]",
    accent: "text-[#7a9ccb]",
    accentHex: "#7a9ccb",
    border: "border-[#7a9ccb]/40",
    font: "font-serif font-normal tracking-wide",
    label: "BUILD. INVEST. SOVEREIGN.",
    sub: "Institutional / Finance aesthetic",
  },
};

const GESTURES = [
  { id: "doubletap", label: "Double-Tap (A)", action: "Confirm", icon: "✓" },
  { id: "swipe", label: "Swipe (B)", action: "Deny", icon: "✕" },
  { id: "hold", label: "Long Press (C)", action: "Voice Memo", icon: "🎙" },
  { id: "twist", label: "Twist (D)", action: "Kill Switch", icon: "⛔" },
];

export default function ProjectPreview({ selected = {} }) {
  const [brand, setBrand] = useState("nike");
  const [activeGesture, setActiveGesture] = useState(null);
  const [hapticPulse, setHapticPulse] = useState(false);

  const triggerGesture = (id) => {
    setActiveGesture(id);
    setHapticPulse(true);
    setTimeout(() => setHapticPulse(false), 600);
    setTimeout(() => setActiveGesture(null), 1200);
  };

  const b = BRANDS[brand];
  const wearableActive = selected["wearable-bridge"];
  const brandActive = selected["brand-absorption"];

  return (
    <Card className="border-[#30363d] bg-[#0d1117]/60 backdrop-blur-md">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> SOV-PROJECT-PREVIEW-1.0
          </h3>
          <span className="text-[10px] font-mono text-[#484f58]">Step 4 · Polishing</span>
        </div>
        <p className="text-[11px] text-[#8b949e] leading-relaxed">
          Walk through your app before you commit. Drag <strong className="text-cyan-400">Wearable Bridge</strong> gestures into the preview to visualize haptic feedback, and toggle <strong className="text-cyan-400">Brand Absorption</strong> to watch the aesthetic shift instantly.
        </p>

        {/* Preview window */}
        <div className={`relative rounded-xl border-2 ${b.border} ${b.bg} overflow-hidden transition-all duration-500`}>
          <div className="h-48 flex flex-col items-center justify-center p-4 relative">
            {/* Haptic feedback ring */}
            {hapticPulse && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 rounded-full border-2 border-cyan-400 animate-ping" />
                <div className="absolute w-20 h-20 rounded-full bg-cyan-400/10" />
              </div>
            )}
            <div className={`${b.font} text-2xl transition-all duration-500`} style={{ color: b.accentHex }}>
              {b.label}
            </div>
            <div className="mt-2 text-[10px] font-mono opacity-60" style={{ color: b.accentHex }}>
              SOV-PROJECT-PREVIEW-1.0
            </div>
            {activeGesture && (
              <div className={`mt-3 px-3 py-1 rounded-full border ${b.border} text-[10px] font-mono`} style={{ color: b.accentHex }}>
                {GESTURES.find((g) => g.id === activeGesture)?.icon} {GESTURES.find((g) => g.id === activeGesture)?.action}
              </div>
            )}
          </div>
        </div>

        {/* Brand Absorption toggle */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-[#8b949e] flex items-center gap-1">
            <Fingerprint className="w-3 h-3" /> Brand Absorption (Zero-Fingerprint Mirroring)
            {!brandActive && <span className="text-amber-400/60 ml-1">— toggle in checklist to unlock</span>}
          </p>
          <div className="flex gap-2">
            {Object.entries(BRANDS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => brandActive && setBrand(key)}
                disabled={!brandActive}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${brand === key && brandActive ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : brandActive ? "border-[#30363d] text-[#8b949e] hover:bg-[#161b22]" : "border-[#30363d] text-[#484f58] cursor-not-allowed opacity-50"}`}
              >
                {val.name}
              </button>
            ))}
          </div>
        </div>

        {/* Wearable Bridge gestures */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-[#8b949e] flex items-center gap-1">
            <Vibrate className="w-3 h-3" /> Wearable Bridge Gestures
            {!wearableActive && <span className="text-amber-400/60 ml-1">— toggle Wearable Button to activate</span>}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {GESTURES.map((g) => (
              <button
                key={g.id}
                onClick={() => triggerGesture(g.id)}
                disabled={!wearableActive}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${wearableActive ? "border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 hover:border-cyan-500/40" : "border-[#30363d] text-[#484f58] cursor-not-allowed opacity-50"}`}
              >
                <span className="text-sm">{g.icon}</span> {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#484f58]">
          <Sparkles className="w-3 h-3" />
          {b.sub}
        </div>
      </CardContent>
    </Card>
  );
}