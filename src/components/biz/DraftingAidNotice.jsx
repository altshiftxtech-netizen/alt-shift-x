import React, { useState } from "react";
import { ShieldAlert, ChevronDown } from "lucide-react";
import { DISCLAIMER } from "./bizData";

/**
 * Hard-edged "Drafting Aid Only" disclosure. Placed on the landing page, the
 * sidebar, and (via the compact variant) every generated document.
 */
export default function DraftingAidNotice({ compact = false }) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/90">
        <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
        <span><strong>{DISCLAIMER.short}</strong> Have qualified counsel review before you rely on this.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.07] p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 text-left">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-sm font-bold text-amber-200">{DISCLAIMER.short}</span>
        <ChevronDown className={`w-4 h-4 ml-auto text-amber-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="mt-3 text-xs leading-relaxed text-amber-100/80">{DISCLAIMER.full}</p>
      )}
    </div>
  );
}