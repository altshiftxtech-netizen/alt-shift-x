import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X4: "bg-amber-100 text-amber-700",
};

const statusColors = {
  draft: "bg-slate-100 text-slate-500 border-slate-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function ComponentSelector({ components, selected, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {components.map((comp) => {
        const isSelected = selected.id === comp.id;
        return (
          <button
            key={comp.id}
            onClick={() => onChange(comp)}
            className={`text-left rounded-xl border p-4 transition-all ${
              isSelected
                ? "border-violet-400 bg-violet-50 shadow-md ring-2 ring-violet-200"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[comp.type] || "bg-slate-100 text-slate-600"}`}>
                {comp.type}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[comp.status]}`}>
                {comp.status}
              </span>
            </div>
            <p className={`text-sm font-bold truncate ${isSelected ? "text-violet-800" : "text-slate-800"}`}>{comp.displayName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{comp.name} · {comp.version}</p>
          </button>
        );
      })}
    </div>
  );
}