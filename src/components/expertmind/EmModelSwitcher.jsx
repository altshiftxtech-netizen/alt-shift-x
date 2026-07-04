import React from "react";
import { Cpu, Zap, Brain, Check } from "lucide-react";
import { EM } from "./emTokens";
import { EM_MODELS } from "./emModels";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TIER_ICON = { fast: Zap, deep: Brain, auto: Cpu };

/** Hardwired runtime model switcher — flip the reasoning engine between any available model. */
export default function EmModelSwitcher({ value, onChange }) {
  const current = EM_MODELS.find((m) => m.id === value) || EM_MODELS[0];
  const fast = EM_MODELS.filter((m) => m.tier === "fast" || m.tier === "auto");
  const deep = EM_MODELS.filter((m) => m.tier === "deep");

  const Row = (m) => {
    const Icon = TIER_ICON[m.tier] || Cpu;
    return (
      <DropdownMenuItem key={m.id} onClick={() => onChange(m.id)} className="flex items-center gap-2.5 py-2 cursor-pointer">
        <Icon className="w-4 h-4" strokeWidth={1.75} style={{ color: EM.accent }} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium leading-tight" style={{ color: EM.primary }}>{m.label}</p>
          <p className="text-[11px]" style={{ color: EM.muted }}>{m.note}</p>
        </div>
        {m.id === value && <Check className="w-4 h-4" strokeWidth={2.5} style={{ color: EM.accent }} />}
      </DropdownMenuItem>
    );
  };

  const CurrentIcon = TIER_ICON[current.tier] || Cpu;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white"
          style={{ border: `1px solid ${EM.border}`, color: EM.primary2, background: EM.surface }}
        >
          <CurrentIcon className="w-3.5 h-3.5" strokeWidth={1.75} style={{ color: EM.accent }} />
          {current.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide" style={{ color: EM.muted }}>Fast Path · Metabolism</DropdownMenuLabel>
        {fast.map(Row)}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide" style={{ color: EM.muted }}>Deep Path · Frontier Brain</DropdownMenuLabel>
        {deep.map(Row)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}