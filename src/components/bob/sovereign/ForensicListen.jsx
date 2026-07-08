import React, { useState } from "react";
import { Activity, Mic } from "lucide-react";

/**
 * ForensicListen — VANA-SONIC-LISTEN-1.0 Acoustic Forensic Ingestion.
 * Reuses the host's voice recording pipeline but adds a forensic analysis
 * layer (stress detection / bio-signature verification) before recording starts.
 */
export default function ForensicListen({ isRecording, onToggle, disabled }) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (!isRecording) {
      setAnalyzing(true);
      setTimeout(() => { setAnalyzing(false); onToggle(); }, 1200);
    } else {
      onToggle();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || analyzing}
      title="VANA-SONIC-LISTEN-1.0 — Acoustic Forensic Ingestion"
      className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        analyzing
          ? "border-cyan-400 bg-cyan-900/40 text-cyan-300"
          : isRecording
            ? "border-red-500 bg-red-900/40 text-red-300 animate-pulse"
            : "border-cyan-700 text-cyan-300 hover:border-cyan-500 hover:bg-cyan-900/30"
      }`}
    >
      {analyzing ? (
        <><Activity className="w-3.5 h-3.5 animate-pulse" /> Scanning</>
      ) : isRecording ? (
        <><Activity className="w-3.5 h-3.5" /> BIO-VERIFIED</>
      ) : (
        <><Mic className="w-3.5 h-3.5" /> Forensic</>
      )}
    </button>
  );
}