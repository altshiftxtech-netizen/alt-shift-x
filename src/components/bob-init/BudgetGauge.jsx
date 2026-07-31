import React from "react";
import { DollarSign, Gauge } from "lucide-react";

// BudgetGauge — lets the admin set a project budget.
// The builder scales the output tier to the price point:
//   < $9,500      → Insufficient for Production Build
//   $9,500+       → Production Build (Standard) — 1 agent, Self-Healing Shim
//   $15,000+      → Production Build (Enterprise) — multi-agent + B2B Registry Namespace
//   + $500/mo per active agent for Maintenance Bridge
const TIERS = [
  { min: 0, max: 9499, label: "Insufficient", color: "text-red-400", bar: "bg-red-500", desc: "Below $9,500 Production Build threshold" },
  { min: 9500, max: 14999, label: "Standard", color: "text-cyan-400", bar: "bg-cyan-500", desc: "1 agent · Self-Healing Shim · Registry Audit" },
  { min: 15000, max: 49999, label: "Enterprise", color: "text-blue-400", bar: "bg-blue-500", desc: "Multi-agent · B2B Registry Namespace · Priority Shim" },
  { min: 50000, max: Infinity, label: "Sovereign", color: "text-amber-400", bar: "bg-amber-500", desc: "Unlimited agents · Private Registry · Dedicated Shard" },
];

export function getBudgetTier(budget) {
  return TIERS.find((t) => budget >= t.min && budget <= t.max) || TIERS[0];
}

export default function BudgetGauge({ budget, setBudget }) {
  const tier = getBudgetTier(budget);
  const maintenanceFee = Math.max(1, Math.floor(budget / 9500)) * 500;
  const maxSlider = 100000;

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0d1117] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-[#8b949e] uppercase tracking-wider">Project Budget</span>
      </div>

      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-[#3fb950]" />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
          min={0}
          step={500}
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-lg font-mono font-bold text-[#3fb950] focus:outline-none focus:border-cyan-500"
        />
      </div>

      <input
        type="range"
        min={0}
        max={maxSlider}
        step={500}
        value={Math.min(budget, maxSlider)}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />

      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold font-mono ${tier.color}`}>{tier.label}</span>
        <span className="text-xs text-[#8b949e] font-mono">+${maintenanceFee}/mo maintenance</span>
      </div>
      <p className="text-[11px] text-[#8b949e]">{tier.desc}</p>

      {/* Tier ladder */}
      <div className="space-y-1 pt-1">
        {TIERS.map((t) => (
          <div key={t.label} className={`flex items-center gap-2 text-[10px] font-mono ${budget >= t.min ? t.color : "text-[#484f58]"}`}>
            <div className={`w-2 h-2 rounded-full ${budget >= t.min ? t.bar : "bg-[#30363d]"}`} />
            {t.label} · ${t.min.toLocaleString()}{t.max !== Infinity ? `–$${t.max.toLocaleString()}` : "+"}
          </div>
        ))}
      </div>
    </div>
  );
}