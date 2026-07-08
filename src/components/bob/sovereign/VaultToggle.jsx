import React from "react";
import { Shield } from "lucide-react";

/**
 * VaultToggle — Sovereign Vault shield. When ON, all drafted components are
 * automatically tagged status: "shelved" and include_in_pipelines: false,
 * keeping logic private (brain → vault, no pipeline exposure).
 */
export default function VaultToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title="Sovereign Vault — components tagged status: shelved, include_in_pipelines: false"
      className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? "border-amber-500 bg-amber-900/40 text-amber-300 shadow-sm shadow-amber-500/20"
          : "border-slate-700 text-slate-400 hover:border-amber-600 hover:text-amber-400"
      }`}
    >
      <Shield className={`w-3.5 h-3.5 ${active ? "fill-amber-500/30" : ""}`} />
      Vault {active ? "ON" : "OFF"}
    </button>
  );
}