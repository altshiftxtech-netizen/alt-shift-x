import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, X, Zap, Package } from "lucide-react";
import WarehousePurchaseButton from "@/components/warehouse/WarehousePurchaseButton";

const CATEGORIES = [
  "All Categories",
  "Marketplace & Deployment Kits",
  "AI Agent Development",
  "Operational Engineering",
  "Legal & Compliance",
  "Military & Business Strategy",
  "Pedigree Specialized Pairings",
  "Human Capital",
  "Strategic Growth",
  "Knowledge Book Tiles",
];

const TYPES = ["ALL", "X1", "X2", "X3", "X4", "X5"];

const TYPE_LABELS = {
  X1: "Reading Protocol",
  X2: "Prophecy Model",
  X3: "Speed Profile",
  X4: "Reason Council",
  X5: "Agent",
};

/**
 * ZeroCreditSearchEngine
 * Sovereign database search engine — queries the Component collection
 * directly via the Base44 SDK with zero LLM token spend. Supports
 * category pills, architecture tier (X1–X5), and instant text search
 * across name, code, description, and features.
 */
export default function ZeroCreditSearchEngine() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("ALL");
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Build the server-side query — category + type + status filters run
  // directly on the database. Zero LLM calls, zero credit burn.
  const query = useMemo(() => {
    const q = { status: "published" };
    if (selectedCategory !== "All Categories") q.category = selectedCategory;
    if (selectedType !== "ALL") q.type = selectedType;
    return q;
  }, [selectedCategory, selectedType]);

  useEffect(() => {
    setLoading(true);
    base44.entities.Component
      .filter(query, { sort: "-created_date", limit: 24, fields: ["name", "code", "type", "category", "description", "price", "features", "status"] })
      .then((res) => {
        const page = res.items || res || [];
        setComponents(page);
        setCursor(res.next_cursor || null);
        setHasMore(!!res.has_more);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await base44.entities.Component.filter(query, {
        sort: "-created_date",
        limit: 24,
        cursor,
        fields: ["name", "code", "type", "category", "description", "price", "features", "status"],
      });
      const page = res.items || res || [];
      setComponents((prev) => [...prev, ...page]);
      setCursor(res.next_cursor || null);
      setHasMore(!!res.has_more);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Ultra-fast in-memory instant filter for the search term.
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return components;
    const term = searchTerm.toLowerCase();
    return components.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.features?.some((f) => f.toLowerCase().includes(term))
    );
  }, [components, searchTerm]);

  const formatPrice = (price) => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold tracking-tight mb-6">Explore Components</h2>

      {/* Search input bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search components by name, code (e.g. LEGAL-SSSL), or keyword…"
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-amber-400/60 focus:outline-none text-sm text-white placeholder-zinc-500 transition shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20"
                : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component type filters (X1–X5) */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mr-2">Architecture:</span>
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
              selectedType === type
                ? "bg-zinc-200 text-black font-bold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-white/5">
          <Package className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Matching Components Found</h3>
          <p className="text-xs text-zinc-500">Try adjusting your search terms or category selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-black/50 hover:scale-[1.02] backdrop-blur-xl"
            >
              <Link to={`/warehouse/${item.id}`} className="block">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-amber-400 px-2 py-0.5 rounded">
                      {item.type || "X5"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px]">
                      {item.code}
                    </span>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-400">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1 mb-2">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="mb-4">
                  <span className="text-[10px] text-zinc-500 bg-white/[0.03] px-2 py-1 rounded border border-white/5">
                    {item.category}
                  </span>
                </div>
              </Link>
              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3 items-center justify-between">
                <Link to={`/warehouse/${item.id}`} className="text-[11px] text-muted-foreground hover:text-foreground">View Dossier →</Link>
                <WarehousePurchaseButton componentId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More pagination */}
      {hasMore && !searchTerm && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </>
            ) : (
              "Load More Components"
            )}
          </button>
        </div>
      )}
    </div>
  );
}