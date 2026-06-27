import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Package } from "lucide-react";

// Human-readable labels for each component type, used as group headers.
const TYPE_LABELS = {
  X1: "X1 · Reading Protocols",
  X2: "X2 · Prophecy Models",
  X3: "X3 · Speed Profiles",
  X4: "X4 · Reason Councils",
  X5: "X5 · Complete Agents",
};
const TYPE_ORDER = ["X1", "X2", "X3", "X4", "X5"];

// A compact searchable dropdown for picking which component to scope analytics
// to. Replaces the old wall-of-buttons selector that broke down with large
// catalogs. Components are grouped by type and sorted alphabetically within
// each group.
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

  // Split the "All Components" entry out, then group the rest by type and sort
  // each group + its members alphabetically.
  const { allOption, groups } = useMemo(() => {
    const allOpt = components.find((c) => c.id === "all");
    const rest = components.filter((c) => c.id !== "all");
    const filtered = q ? rest.filter((c) => (c.label || "").toLowerCase().includes(q)) : rest;

    const byType = {};
    filtered.forEach((c) => {
      const key = c.type || "Other";
      (byType[key] = byType[key] || []).push(c);
    });

    const orderedKeys = [
      ...TYPE_ORDER.filter((t) => byType[t]),
      ...Object.keys(byType).filter((t) => !TYPE_ORDER.includes(t)).sort(),
    ];

    const grouped = orderedKeys.map((key) => ({
      key,
      label: TYPE_LABELS[key] || key,
      items: byType[key].sort((a, b) => (a.label || "").localeCompare(b.label || "")),
    }));

    return { allOption: allOpt, groups: grouped };
  }, [components, q]);

  const hasResults = (allOption && !q) || groups.length > 0;

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
            {!hasResults ? (
              <p className="px-3 py-4 text-xs text-slate-400 text-center">No matches</p>
            ) : (
              <>
                {/* "All Components" pinned to the top (hidden while searching) */}
                {allOption && !q && (
                  <button
                    onClick={() => { onSelect(allOption.id); setOpen(false); setQuery(""); }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${selected === allOption.id ? "bg-amber-50 text-amber-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <span className="truncate">{allOption.label}</span>
                    {selected === allOption.id && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </button>
                )}

                {groups.map((group) => (
                  <div key={group.key}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
                    {group.items.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { onSelect(c.id); setOpen(false); setQuery(""); }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${selected === c.id ? "bg-amber-50 text-amber-800 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        <span className="truncate">{c.label}</span>
                        {selected === c.id && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}