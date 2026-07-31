import React from "react";
import { Activity } from "lucide-react";
import { calculateEsi, getEsiTier } from "./featureData";

export default function EsiTracker({ selected }) {
  const score = calculateEsi(selected);
  const tier = getEsiTier(score);

  return (
    <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-mono text-[#484f58]">ESI SCORE</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-lg font-black font-mono ${tier.color}`}>{score}</span>
          <span className="text-[10px] font-mono text-[#484f58]">/ 100</span>
        </div>
      </div>
      {/* Score bar */}
      <div className="h-2 rounded-full bg-[#0d1117] overflow-hidden">
        <div
          className={`h-full ${tier.bar} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-[11px] font-mono font-bold ${tier.color}`}>{tier.label}</span>
        <span className="text-[10px] font-mono text-[#484f58]">{tier.desc}</span>
      </div>
    </div>
  );
}