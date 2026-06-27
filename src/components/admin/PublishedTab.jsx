import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X3: "bg-cyan-100 text-cyan-700",
  X4: "bg-amber-100 text-amber-700",
  X5: "bg-emerald-100 text-emerald-700",
};
const TYPE_FILTERS = ["All", "X1", "X2", "X3", "X4", "X5"];
const PAGE_SIZE = 5;

// Published components — real data, filterable by type (X1–X5), 5 per page.
export default function PublishedTab() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    base44.asServiceRole.entities.Component.filter({ status: "published" }, "-created_date", 10000)
      .then((data) => { setComponents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (typeFilter === "All" ? components : components.filter((c) => c.type === typeFilter)),
    [components, typeFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [typeFilter]);

  const handleDelete = async (component) => {
    if (!window.confirm(`Delete "${component.name}"? This cannot be undone.`)) return;
    setDeletingId(component.id);
    await base44.asServiceRole.entities.Component.delete(component.id);
    setComponents((prev) => prev.filter((c) => c.id !== component.id));
    setDeletingId(null);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${typeFilter === t ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">{filtered.length.toLocaleString()} components</span>
      </div>

      {pageItems.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No components found</div>}

      {pageItems.map((c) => (
        <Card key={c.id}>
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                <p className="text-xs font-mono text-slate-400 truncate">
                  {c.code} · <span className="text-slate-400">published {new Date(c.created_date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs shrink-0">
              <span className="text-slate-500 hidden sm:block">{(c.installs_count || 0).toLocaleString()} installs</span>
              <span className="text-slate-500">${c.price || 0}/mo</span>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 h-7 gap-1.5"
                onClick={() => handleDelete(c)}
                disabled={deletingId === c.id}
              >
                {deletingId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </Button>
          <span className="text-xs text-slate-500">Page {safePage} of {totalPages}</span>
          <Button variant="outline" size="sm" className="h-8 gap-1" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}