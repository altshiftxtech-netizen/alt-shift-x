import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X3: "bg-cyan-100 text-cyan-700",
  X4: "bg-amber-100 text-amber-700",
  X5: "bg-emerald-100 text-emerald-700",
};

// Flagged — real components pulled from the marketplace (status=shelved).
// Admin can restore them to published or delete them outright.
export default function FlaggedTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.Component.filter({ status: "shelved" }, "-updated_date", 500);
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const restore = async (c) => {
    setBusy(c.id);
    await base44.asServiceRole.entities.Component.update(c.id, { status: "published" });
    setItems((prev) => prev.filter((x) => x.id !== c.id));
    setBusy(null);
  };

  const remove = async (c) => {
    if (!window.confirm(`Permanently delete "${c.name}"?`)) return;
    setBusy(c.id);
    await base44.asServiceRole.entities.Component.delete(c.id);
    setItems((prev) => prev.filter((x) => x.id !== c.id));
    setBusy(null);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  if (items.length === 0) {
    return <div className="text-center py-12 text-slate-400 text-sm">No flagged components</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((c) => (
        <Card key={c.id} className="border-red-200">
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Flag className="w-2.5 h-2.5" />Shelved</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                <p className="text-xs font-mono text-slate-400 truncate">{c.code} · {c.builder_name || c.builder_id}</p>
                <p className="text-[10px] text-slate-400 mt-1">Pulled {new Date(c.updated_date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" className="text-xs h-8 gap-1.5" disabled={busy === c.id} onClick={() => restore(c)}>
                  {busy === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />} Restore
                </Button>
                <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-8 gap-1.5" disabled={busy === c.id} onClick={() => remove(c)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}