import React from "react";

const components = [
  { id: "all", label: "All" },
  { id: "rp", label: "Ironclad Protocol" },
  { id: "pm", label: "Estimator's Eye" },
  { id: "rc", label: "The Site Board" },
];
const ratings = ["all", "5", "4", "3", "2", "1"];
const replied = [{ id: "all", label: "All" }, { id: "pending", label: "Needs Reply" }];

export default function ReviewFilters({ filter, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
        {components.map(c => (
          <button key={c.id} onClick={() => onChange({ ...filter, component: c.id })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${filter.component === c.id ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-700"}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
        {ratings.map(r => (
          <button key={r} onClick={() => onChange({ ...filter, rating: r })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${filter.rating === r ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-700"}`}>
            {r === "all" ? "All ★" : `${r}★`}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
        {replied.map(r => (
          <button key={r.id} onClick={() => onChange({ ...filter, replied: r.id })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${filter.replied === r.id ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-700"}`}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}