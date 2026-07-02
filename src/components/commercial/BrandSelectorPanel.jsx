import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Search, Palette, Check, Pencil } from "lucide-react";
import BrandKitPanel from "@/components/commercial/BrandKitPanel";

const PAGE = 25;

// Multi-brand manager. Lists brands paginated + searchable so it scales to
// thousands/millions of records (never loads them all). The selected brand is
// what steers productions. Creating/editing opens the existing BrandKitPanel.
export default function BrandSelectorPanel({ selectedKit, onSelect }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("list"); // list | edit | create
  const [editKit, setEditKit] = useState(null);
  const searchTimer = useRef(null);

  const loadBrands = useCallback(async (skip = 0, term = "") => {
    if (skip === 0) setLoading(true); else setLoadingMore(true);
    const query = term.trim() ? { brand_name: { $regex: term.trim(), $options: "i" } } : {};
    const list = await base44.entities.BrandKit.filter(query, "-updated_date", PAGE, skip);
    setHasMore(list.length === PAGE);
    setBrands((prev) => (skip === 0 ? list : [...prev, ...list]));
    setLoading(false); setLoadingMore(false);
  }, []);

  useEffect(() => { loadBrands(0, ""); }, [loadBrands]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadBrands(0, search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search, loadBrands]);

  const handleSaved = async (kit) => {
    setMode("list");
    setEditKit(null);
    await loadBrands(0, search);
    onSelect?.(kit); // newly created / edited brand becomes the active one
  };

  if (mode === "create" || mode === "edit") {
    return (
      <div className="space-y-2">
        <button onClick={() => { setMode("list"); setEditKit(null); }}
          className="text-[11px] text-amber-300/70 hover:text-amber-200">← Back to brands</button>
        <BrandKitPanel kit={mode === "edit" ? editKit : null} onSaved={handleSaved} onCancel={() => { setMode("list"); setEditKit(null); }} />
      </div>
    );
  }

  return (
    <div className="bg-[#12100f] border border-amber-900/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-amber-50 flex items-center gap-2"><Palette className="w-4 h-4 text-amber-400" /> Brands</p>
        <button onClick={() => setMode("create")}
          className="flex items-center gap-1 text-[11px] font-semibold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-2 py-1 rounded-lg">
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-black/40 border border-amber-900/30 rounded-lg px-2.5 py-1.5">
        <Search className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands…"
          className="w-full bg-transparent text-amber-50 text-[12px] outline-none placeholder:text-amber-200/30" />
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-amber-500/60" /></div>
      ) : brands.length === 0 ? (
        <p className="text-xs text-amber-200/40 py-6 text-center">
          {search.trim() ? "No brands match your search." : "No brands yet — create your first."}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
          {brands.map((b) => {
            const active = selectedKit?.id === b.id;
            return (
              <div key={b.id}
                onClick={() => onSelect?.(b)}
                className={`group flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${active ? "bg-amber-500/10 border-amber-500/50" : "bg-black/30 border-amber-900/30 hover:border-amber-700/50"}`}>
                {b.logo_url
                  ? <img src={b.logo_url} alt="" className="w-9 h-9 rounded-lg object-contain bg-black/40 border border-amber-900/30 flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-lg bg-amber-900/20 border border-amber-900/30 flex items-center justify-center flex-shrink-0"><Palette className="w-4 h-4 text-amber-400/60" /></div>}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-amber-50 truncate">{b.brand_name}</p>
                  <p className="text-[10px] text-amber-200/40 truncate">{b.tone || "No tone set"}</p>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {(b.colors || []).slice(0, 3).map((c, i) => (
                    <span key={i} className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ background: c }} />
                  ))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); setEditKit(b); setMode("edit"); }}
                  className="text-amber-300/50 hover:text-amber-200 p-1 rounded-lg hover:bg-amber-900/20 flex-shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {active && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              </div>
            );
          })}

          {hasMore && (
            <button onClick={() => loadBrands(brands.length, search)} disabled={loadingMore}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-200/70 hover:text-amber-100 bg-black/30 hover:bg-black/50 border border-amber-900/30 rounded-lg py-1.5 disabled:opacity-50">
              {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Load more
            </button>
          )}
        </div>
      )}

      {selectedKit && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-2.5 py-1.5">
          <Check className="w-3 h-3 flex-shrink-0" /> Productions steered by <span className="font-bold truncate">{selectedKit.brand_name}</span>
        </div>
      )}
    </div>
  );
}