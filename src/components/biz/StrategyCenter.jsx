import React, { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { STRATEGY_MODULES } from "./bizData";

/**
 * "Explain it like a deal desk" strategy modules — expandable explainers on
 * pricing, contract structure, IP, distribution, and risk triage.
 */
export default function StrategyCenter() {
  const [open, setOpen] = useState(STRATEGY_MODULES[0].key);

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/55 mb-1">
        Operating playbooks and deal-desk explainers. Strategy guidance only — pair with the document center to put it in writing.
      </p>
      {STRATEGY_MODULES.map((m) => {
        const isOpen = open === m.key;
        return (
          <div key={m.key} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : m.key)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04]"
            >
              <Lightbulb className="w-4 h-4 text-[#C8A95B] shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white">{m.title}</h3>
                <p className="text-xs text-white/50 truncate">{m.tagline}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <ul className="px-4 pb-4 pt-1 space-y-2 text-sm text-white/70 list-disc pl-9">
                {m.points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}