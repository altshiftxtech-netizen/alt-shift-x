import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Package } from "lucide-react";

// A compact searchable dropdown for picking which component to scope analytics
// to. Replaces the old wall-of-buttons selector that broke down with large
// catalogs. Shows the active selection as a single pill; opens a searchable,
// scrollable list on click.
export default function ComponentSelectDropdown({ components = [], selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = components.find((c) => c.id === selected) || components[0] || { id: "all", label: "All Components" };
  const q = query.trim().toLowerCase();
  const filtered = q ? components.filter((c) => (c.label || "").toLowerCase().includes(q)) : components;

  return (
    <div className="relative self-start sm:self-auto w-full sm:w-72" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm text-sm hover:border-slate-300 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Package className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="truncate font-semibold text-slate-700">{current.label}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-full sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search components…"
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-400 text-center">No matches</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSelect(c.id); setOpen(false); setQuery(""); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${selected === c.id ? "bg-amber-50 text-amber-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span className="truncate">{c.label}</span>
                  {selected === c.id && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}