import React, { useEffect, useRef } from "react";

/**
 * SignalPulse — the "Pulse" for the GEO-INTEL-FETCHER-1.0.
 * A constant low-level green wave (Forensic SRE: quiet, data-heavy) that spikes
 * and turns gold ONLY when a bankable event is found. Canvas-drawn heartbeat.
 *
 * Props:
 *   integrity  — 0-100 signal integrity (drives wave amplitude/opacity)
 *   bankable   — when true, the wave spikes and shifts to gold
 */
export default function SignalPulse({ integrity = 96, bankable = false }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      tRef.current += 0.03;
      const t = tRef.current;

      const green = "#34d399";
      const gold = "#e6c878";
      const color = bankable ? gold : green;
      const mid = height / 2;
      // Amplitude: quiet baseline, larger + spiky when bankable.
      const baseAmp = (height * 0.12) * (integrity / 100);
      const amp = bankable ? baseAmp * 2.6 : baseAmp;

      // faint grid baseline
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(width, mid);
      ctx.stroke();

      // the wave
      ctx.strokeStyle = color;
      ctx.lineWidth = bankable ? 2 : 1.4;
      ctx.shadowColor = color;
      ctx.shadowBlur = bankable ? 12 : 4;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const phase = x / width;
        // A traveling heartbeat: a smooth carrier + a periodic spike.
        const carrier = Math.sin(phase * Math.PI * 6 + t * 2) * amp * 0.35;
        const spikePos = (t * 0.12) % 1;
        const d = Math.abs(phase - spikePos);
        const spike = Math.exp(-(d * d) / 0.0006) * amp * (bankable ? 1.4 : 0.9);
        const y = mid - carrier - spike;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [integrity, bankable]);

  return (
    <div className="relative w-full h-16 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-1.5 left-2 flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: bankable ? "#e6c878" : "#34d399", boxShadow: `0 0 6px ${bankable ? "#e6c878" : "#34d399"}` }}
        />
        <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: bankable ? "#e6c878" : "#34d39999" }}>
          {bankable ? "Bankable Signal" : "Fetcher Live"}
        </span>
      </div>
    </div>
  );
}