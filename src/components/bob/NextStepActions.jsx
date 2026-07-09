import React, { useState, useRef, useEffect } from "react";
import { GitFork, ArrowUpCircle, Sparkles, Rocket, Wand2, ListChecks, ChevronDown } from "lucide-react";

// Quick "what's next" actions collapsed into a single dropdown to save
// vertical space for the chat screen. Each option sends a ready-made
// follow-up prompt to BOB.
const ACTIONS = [
  {
    label: "Spin Off",
    icon: GitFork,
    prompt:
      "Spin this off into a NEW variant I can monetize — a different vertical or angle. " +
      "Pre-fill the name, type (X1/X2/X4), description, pricing, and marketplace listing, then lay out the build plan.",
    color: "text-violet-300",
  },
  {
    label: "Next Version",
    icon: ArrowUpCircle,
    prompt:
      "Create the NEXT version of this component — bump the version, propose meaningful improvements, " +
      "and prepare an updated changelog and marketplace listing.",
    color: "text-emerald-300",
  },
  {
    label: "Upmarket Tier",
    icon: Sparkles,
    prompt:
      "Design a premium upmarket tier of this component — richer features, higher trust, and a higher price point. " +
      "Pre-fill all the metadata and pricing.",
    color: "text-amber-300",
  },
  {
    label: "Polish & Submit",
    icon: ListChecks,
    prompt:
      "Polish this component to publish-ready standard — finalize metadata, run a trust/compliance pre-check, " +
      "and submit it for review.",
    color: "text-sky-300",
  },
  {
    label: "Improve It",
    icon: Wand2,
    prompt:
      "Suggest the strongest improvements to this component for performance, safety, and trust score — " +
      "then apply the ones you recommend.",
    color: "text-pink-300",
  },
  {
    label: "Deploy Ready",
    icon: Rocket,
    prompt:
      "Generate the final DEPLOY-READY spec — manifest JSON, API endpoint spec, trust pre-check, and listing copy.",
    color: "text-orange-300",
  },
];

export default function NextStepActions({ onPick, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border border-slate-600 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40"
      >
        <Wand2 className="w-3 h-3 text-violet-400" /> Next Steps
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
          {ACTIONS.map(({ label, icon: Icon, prompt, color }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => { onPick(prompt); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold hover:bg-slate-700/70 transition-colors disabled:opacity-40 text-left"
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}