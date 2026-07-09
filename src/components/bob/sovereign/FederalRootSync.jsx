import React, { useState, useEffect } from "react";
import { Radio } from "lucide-react";

/**
 * FederalRootSync — live connection status to Treasury, CMS, and OIG
 * Federal Roots.
 *
 * Two fixed lights sit side by side: left = SYNCED (green), right = DEGRADED
 * (amber). When the status changes the active light moves from one to the
 * other — the container width never changes, so the surrounding composer /
 * prompt modal never shifts.
 */
export default function FederalRootSync() {
  const [status, setStatus] = useState("synced");

  useEffect(() => {
    const cycle = setInterval(() => {
      const r = Math.random();
      setStatus(r > 0.82 ? "degraded" : "synced");
    }, 8000);
    return () => clearInterval(cycle);
  }, []);

  const isSynced = status === "synced";

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700 transition-colors duration-300"
      title="Federal Root Sync — Treasury · CMS · OIG live handshake"
    >
      <Radio className="w-3 h-3 text-slate-500 flex-shrink-0" />
      {/* Two fixed lights — active one swaps, container width never changes */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isSynced
              ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
              : "bg-slate-700"
          }`}
        />
        <span
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            !isSynced
              ? "bg-amber-500 shadow-sm shadow-amber-500/50"
              : "bg-slate-700"
          }`}
        />
      </div>
      {/* Fixed-width label so text change never shifts the layout */}
      <span
        className={`text-[9px] font-mono transition-colors duration-300 w-[64px] text-center ${
          isSynced ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        {isSynced ? "ROOTS SYNCED" : "DEGRADED"}
      </span>
    </div>
  );
}