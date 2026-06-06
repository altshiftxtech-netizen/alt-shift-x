import { GitFork, ArrowUpCircle, Sparkles, Rocket, Wand2, ListChecks } from "lucide-react";

// Quick "what's next" action chips shown above the BOB chat input. They send a
// ready-made follow-up prompt so the builder can act on BOB's "what would you
// like next?" questions in one tap.
const ACTIONS = [
  {
    label: "Spin Off",
    icon: GitFork,
    prompt:
      "Spin this off into a NEW variant I can monetize — a different vertical or angle. " +
      "Pre-fill the name, type (X1/X2/X4), description, pricing, and marketplace listing, then lay out the build plan.",
    color: "text-violet-300 border-violet-700 hover:border-violet-500 hover:bg-violet-900/40",
  },
  {
    label: "Next Version",
    icon: ArrowUpCircle,
    prompt:
      "Create the NEXT version of this component — bump the version, propose meaningful improvements, " +
      "and prepare an updated changelog and marketplace listing.",
    color: "text-emerald-300 border-emerald-700 hover:border-emerald-500 hover:bg-emerald-900/40",
  },
  {
    label: "Upmarket Tier",
    icon: Sparkles,
    prompt:
      "Design a premium upmarket tier of this component — richer features, higher trust, and a higher price point. " +
      "Pre-fill all the metadata and pricing.",
    color: "text-amber-300 border-amber-700 hover:border-amber-500 hover:bg-amber-900/40",
  },
  {
    label: "Polish & Submit",
    icon: ListChecks,
    prompt:
      "Polish this component to publish-ready standard — finalize metadata, run a trust/compliance pre-check, " +
      "and submit it for review.",
    color: "text-sky-300 border-sky-700 hover:border-sky-500 hover:bg-sky-900/40",
  },
  {
    label: "Improve It",
    icon: Wand2,
    prompt:
      "Suggest the strongest improvements to this component for performance, safety, and trust score — " +
      "then apply the ones you recommend.",
    color: "text-pink-300 border-pink-700 hover:border-pink-500 hover:bg-pink-900/40",
  },
  {
    label: "Deploy Ready",
    icon: Rocket,
    prompt:
      "Generate the final DEPLOY-READY spec — manifest JSON, API endpoint spec, trust pre-check, and listing copy.",
    color: "text-orange-300 border-orange-700 hover:border-orange-500 hover:bg-orange-900/40",
  },
];

export default function NextStepActions({ onPick, disabled }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ACTIONS.map(({ label, icon: Icon, prompt, color }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(prompt)}
          className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800/60 transition-all disabled:opacity-40 ${color}`}
        >
          <Icon className="w-3 h-3" /> {label}
        </button>
      ))}
    </div>
  );
}