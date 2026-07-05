import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Search, Package, Download, Check, Loader2 } from "lucide-react";

/**
 * Marketplace Installer — browse the catalog and install a component directly
 * onto a selected enterprise key (instead of "Install to Profile").
 */
export default function MarketplaceInstaller({ components, keys, onInstalled }) {
  const [search, setSearch] = useState("");
  const [keyId, setKeyId] = useState(keys[0]?.id || "");
  const [installingId, setInstallingId] = useState(null);

  const selectedKey = keys.find((k) => k.id === keyId);
  const installedIds = useMemo(
    () => new Set((selectedKey?.installed_components || []).map((c) => c.component_id)),
    [selectedKey]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return components
      .filter((c) => !q || c.name.toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q))
      .slice(0, 30);
  }, [components, search]);

  const install = async (c) => {
    if (!keyId) return;
    setInstallingId(c.id);
    try {
      const res = await base44.functions.invoke("enterpriseKeyOps", {
        action: "install", keyId, component_id: c.id, component_code: c.code, component_name: c.name,
      });
      if (res.data?.ok) onInstalled?.();
    } catch { /* surfaced by refresh */ }
    setInstallingId(null);
  };

  return (
    <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
      <div className="flex items-center gap-2 mb-1">
        <Package className="w-5 h-5 text-[#C8A95B]" />
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Marketplace Installer</h3>
      </div>
      <p className="text-xs text-white/45 mb-4">Browse the marketplace and install directly to an enterprise key.</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search components…" className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/30" />
        </div>
        <select value={keyId} onChange={(e) => setKeyId(e.target.value)} className="rounded-lg bg-white/5 border border-white/15 text-white text-sm px-3 py-2 focus:outline-none">
          <option value="" className="bg-[#0a0c12]">Install to Enterprise Key…</option>
          {keys.map((k) => <option key={k.id} value={k.id} className="bg-[#0a0c12]">{k.label}</option>)}
        </select>
      </div>

      {!keyId && <p className="text-[11px] text-amber-400/80 mb-3">Select a target enterprise key to enable installs.</p>}

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filtered.map((c) => {
          const done = installedIds.has(c.id);
          return (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                <p className="text-[10px] font-mono text-white/35">{c.code}</p>
              </div>
              {done ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400"><Check className="w-3.5 h-3.5" /> On Key</span>
              ) : (
                <button
                  onClick={() => install(c)}
                  disabled={!keyId || installingId === c.id}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#0A0A0C] px-3 py-1.5 rounded-lg disabled:opacity-40"
                  style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}
                >
                  {installingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Install to Key
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-xs text-white/40 text-center py-6">No components match your search.</p>}
      </div>
    </div>
  );
}