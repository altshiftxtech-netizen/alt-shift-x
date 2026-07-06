import React from "react";
import { Flame } from "lucide-react";

/**
 * CreditBurnMeter — real-time token-burn tracker for the GEO-INTEL-ANNEX.
 * Forensic SRE: a thin, quiet bar. The fetcher pulse costs ~0; a reasoner wake
 * spends ~2,500 tokens and fills the bar toward the session budget.
 */
export default function CreditBurnMeter({ spent = 0, budget = 25000 }) {
  const pct = Math.min(100, (spent / budget) * 100);
  const hot = pct > 70;
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-white/45">
          <Flame className="w-3 h-3" style={{ color: hot ? "#f87171" : "#e6c878" }} /> Credit Burn
        </span>
        <span className="text-[10px] font-mono tabular-nums" style={{ color: hot ? "#f87171" : "#e6c878" }}>
          {spent.toLocaleString()} <span className="text-white/30">/ {budget.toLocaleString()}</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: hot
              ? "linear-gradient(90deg,#e6c878,#f87171)"
              : "linear-gradient(90deg,#34d399,#e6c878)",
          }}
        />
      </div>
      <p className="mt-1.5 text-[9px] font-mono text-white/30">
        Fetcher pulse ≈ 0 tokens · Reasoner wake ≈ 2,500 tokens
      </p>
    </div>
  );
}