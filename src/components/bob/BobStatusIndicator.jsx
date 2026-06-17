import React from "react";

/**
 * BobStatusIndicator — a compact three-state status pill shown in the top-left
 * of the chat panel, above the quick-prompt area. Replaces the in-chat
 * "BOB working" popup so the user can scroll and read freely while BOB works.
 *
 * States:
 *   - working  (purple, flashing) — BOB is generating / running tools
 *   - ready    (yellow)           — BOB can take additional commands (queued)
 *   - done     (green)            — last response delivered, awaiting new directions
 *
 * `working` takes priority. When idle with queued follow-ups in flight we show
 * "ready"; otherwise "done".
 */
export default function BobStatusIndicator({ isWorking, hasQueued }) {
  let state;
  if (isWorking) state = "working";
  else if (hasQueued) state = "ready";
  else state = "done";

  const config = {
    working: {
      dot: "bg-violet-500",
      ring: "bg-violet-500",
      flash: true,
      text: "BOB working",
      textColor: "text-violet-300",
    },
    ready: {
      dot: "bg-yellow-400",
      ring: "bg-yellow-400",
      flash: false,
      text: "Ready for more commands",
      textColor: "text-yellow-300",
    },
    done: {
      dot: "bg-emerald-500",
      ring: "bg-emerald-500",
      flash: false,
      text: "Awaiting your directions",
      textColor: "text-emerald-300",
    },
  }[state];

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-3 py-1.5 w-fit">
      <span className="relative flex w-2.5 h-2.5">
        {config.flash && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.ring} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${config.dot}`} />
      </span>
      <span className={`text-[11px] font-semibold ${config.textColor}`}>{config.text}</span>
    </div>
  );
}