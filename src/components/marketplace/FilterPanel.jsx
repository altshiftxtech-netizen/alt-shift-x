import React from "react";
import { X } from "lucide-react";

const TYPE_LABELS = {
  All: "All Types",
  X1: "X1 · Reading Protocols",
  X2: "X2 · Prophecy Models",
  X3: "X3 · Speed Profiles",
  X4: "X4 · Reason Councils",
  X5: "X5 · Complete Agents",
};

export default function FilterPanel({ types, type, onType, onClose }) {
  return (
    <div className="absolute z-50 mt-2 right-0 w-64 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Filter by Type</p>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => onType(t)}
            className={`block w-full text-left text-xs px-2.5 py-2 rounded-md transition-all ${
              type === t ? "bg-violet-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>
    </div>
  );
}