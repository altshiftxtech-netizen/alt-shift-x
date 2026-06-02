import React from "react";
import { X } from "lucide-react";

export default function FilterPanel({
  categories,
  types,
  category,
  type,
  onCategory,
  onType,
  onClose,
}) {
  return (
    <div className="absolute z-50 mt-2 right-0 w-64 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Filters</p>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Category</p>
      <div className="space-y-1 mb-4 max-h-48 overflow-y-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onCategory(c)}
            className={`block w-full text-left text-xs px-2 py-1.5 rounded-md transition-all ${
              category === c ? "bg-violet-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Type</p>
      <div className="space-y-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => onType(t)}
            className={`block w-full text-left text-xs px-2 py-1.5 rounded-md transition-all ${
              type === t ? "bg-violet-600 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t === "All" ? "All Types" : t}
          </button>
        ))}
      </div>
    </div>
  );
}