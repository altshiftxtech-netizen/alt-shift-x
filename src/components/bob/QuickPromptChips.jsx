import React from "react";

// Compact one-tap prompt chips that sit beside the Prophecy slider.
// Each chip dispatches its label straight into the BOB chat pipeline.
const CHIPS = ["both", "all", "1", "2", "3", "4", "5", "Option A", "Option B", "Option C", "Option D", "yes", "no"];

export default function QuickPromptChips({ onPick, disabled }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {CHIPS.map((label) => (
        <button
          key={label}
          onClick={() => onPick(label)}
          disabled={disabled}
          title={`Send "${label}" to BOB`}
          className="text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-violet-800 border border-slate-700 hover:border-violet-600 px-1.5 py-0.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {label}
        </button>
      ))}
    </div>
  );
}