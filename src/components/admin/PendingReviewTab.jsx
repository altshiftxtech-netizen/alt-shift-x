import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X3: "bg-cyan-100 text-cyan-700",
  X4: "bg-amber-100 text-amber-700",
  X5: "bg-emerald-100 text-emerald-700",
};

// Pending Review — only real components awaiting approval (status pending_review
// or pending). Approving publishes them and notifies the builder.
export default function PendingReviewTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        base44.asServiceRole.entities.Component.filter({ status: "pending_review" }, "-created_date", 200),
        base44.asServiceRole.entities.Component.filter({ status: "pending" }, "-created_date", 200),
      ]);
      setItems([...a, ...b]);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const decide = async (component, action) => {
    setBusy(component.id);
    try {
      await base44.functions.invoke("approveComponent", { component_id: component.id, action });
      setItems((prev) => prev.filter((c) => c.id !== component.id));
    } catch {
      // leave it in the list if the call failed
    }
    setBusy(null);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  if (items.length === 0) {
    return <div className="text-center py-12 text-slate-400 text-sm">No components pending review</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{c.category}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${(c.trust_score || 0) >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    <ShieldCheck className="w-2.5 h-2.5" />{Math.round(c.trust_score || 0)}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                <p className="text-xs font-mono text-slate-400 truncate">{c.code} · by {c.builder_name || c.builder_id}</p>
                <p className="text-[10px] text-slate-400 mt-1">Submitted {new Date(c.created_date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5" disabled={busy === c.id} onClick={() => decide(c, "approve")}>
                  {busy === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve
                </Button>
                <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 text-xs h-8 gap-1.5" disabled={busy === c.id} onClick={() => decide(c, "reject")}>
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}