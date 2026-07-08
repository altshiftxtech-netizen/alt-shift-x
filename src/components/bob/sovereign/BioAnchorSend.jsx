import React, { useRef, useState, useEffect } from "react";
import { Fingerprint, Send, Clock } from "lucide-react";

/**
 * BioAnchorSend — hold-to-send button. Requires a momentary hold (~800ms)
 * that visually verifies Sovereign-US-Geo-Lock status before the command
 * is dispatched to the V35 kernel.
 */
export default function BioAnchorSend({ onSend, disabled, isWorking }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const rafRef = useRef(null);

  const startHold = () => {
    if (disabled || isWorking) return;
    setHolding(true);
    setProgress(0);
    const t0 = Date.now();
    const tick = () => {
      const pct = Math.min(100, ((Date.now() - t0) / 800) * 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      setProgress(0);
      cancelAnimationFrame(rafRef.current);
      onSend();
    }, 800);
  };

  const cancelHold = () => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => () => { clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current); }, []);

  if (isWorking) {
    return (
      <button disabled className="bg-violet-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold opacity-80">
        <Clock className="w-3.5 h-3.5" /> Working
      </button>
    );
  }

  return (
    <button
      type="button"
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={(e) => { e.preventDefault(); startHold(); }}
      onTouchEnd={cancelHold}
      disabled={disabled}
      title="Bio-Anchor Pulse — hold to verify Sovereign-US-Geo-Lock before sending"
      className="relative bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold overflow-hidden transition-colors"
    >
      {holding && (
        <div
          className="absolute inset-y-0 left-0 bg-violet-400/60 transition-none"
          style={{ width: `${progress}%` }}
        />
      )}
      <Fingerprint className={`w-3.5 h-3.5 relative z-10 ${holding ? "animate-pulse" : ""}`} />
      <span className="relative z-10">{holding ? "Verifying…" : "Hold to Send"}</span>
    </button>
  );
}