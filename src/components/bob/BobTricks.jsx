import { useState } from "react";
import {
  Lightbulb, ChevronDown, Layers, BellRing, GitFork, Camera,
  Zap, Mic, Paperclip, ArrowUpCircle,
} from "lucide-react";

// BOB Tricks — a collapsible cheat-sheet of power-user tips & multipliers shown
// right under the prompt box so every builder learns how to get the most out of
// BOB (parallel projects, notify-when-done, Spin Off, BOB Look, and more).
const TRICKS = [
  {
    icon: Layers,
    title: "Run tasks in parallel",
    body:
      "Each project is its own thread. Kick off a huge build in one project, then open a second project (Wipe Board → new) for quick questions — they run independently at the same time.",
    color: "text-violet-300",
  },
  {
    icon: BellRing,
    title: "Fire it & walk away",
    body:
      "Tick \"Notify me when done\" before sending a large job. BOB keeps working server-side even if you leave the page or lock your screen, and pings you (optionally by email) the moment it's finished.",
    color: "text-emerald-300",
  },
  {
    icon: GitFork,
    title: "Spin Off to multiply a winner",
    body:
      "From any project's history, hit Spin Off to fork it into a new variant — a different vertical, version, or upmarket tier — with the name, pricing, and listing pre-filled. Just say \"go\".",
    color: "text-amber-300",
  },
  {
    icon: Camera,
    title: "BOB Look — build from a photo",
    body:
      "Snap a photo of a book, shelf, document, or a heritage marker. BOB reads every visible title/label and turns it into components or an Experience Tile.",
    color: "text-sky-300",
  },
  {
    icon: ArrowUpCircle,
    title: "Bulk in one shot",
    body:
      "Ask for many at once — \"make as many bundles as you can of the 100\" or \"create all 12 tiles\". BOB batches them instead of one at a time.",
    color: "text-pink-300",
  },
  {
    icon: Paperclip,
    title: "Feed it your sources",
    body:
      "Attach PDFs, Word docs, spreadsheets, or images. BOB reads the text and folds it straight into your build.",
    color: "text-orange-300",
  },
  {
    icon: Mic,
    title: "Talk instead of type",
    body:
      "Use the Voice button to dictate long prompts hands-free — great for capturing an idea on the move.",
    color: "text-cyan-300",
  },
  {
    icon: Zap,
    title: "One-tap next steps",
    body:
      "Use the Spin Off / Next Version / Upmarket Tier / Improve It chips above the box to answer BOB's \"what's next?\" in a single tap.",
    color: "text-lime-300",
  },
];

export default function BobTricks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800/60 transition-colors"
      >
        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="text-xs font-bold text-white">BOB Tricks</span>
        <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
          power moves & multipliers
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 grid sm:grid-cols-2 gap-2">
          {TRICKS.map(({ icon: Icon, title, body, color }) => (
            <div
              key={title}
              className="flex items-start gap-2.5 bg-slate-800/50 border border-slate-700/60 rounded-lg p-2.5"
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
              <div>
                <p className="text-[11px] font-bold text-slate-200 leading-tight">{title}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}