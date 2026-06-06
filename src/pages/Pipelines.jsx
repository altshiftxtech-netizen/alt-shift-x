import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import PipelineCard from "@/components/pipelines/PipelineCard";
import PurchasePipelineDialog from "@/components/pipelines/PurchasePipelineDialog";
import { Loader2, Layers, Building2 } from "lucide-react";

/**
 * Enterprise Pipelines marketplace (/pipelines). Lists curated exclusives and the
 * best-of opt-in pool, each purchasable as a secure one-time pipeline key.
 */
export default function Pipelines() {
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState([]);
  const [poolCount, setPoolCount] = useState(0);
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [pl, optedIn] = await Promise.all([
          base44.entities.Pipeline.filter({ active: true }, "-featured"),
          base44.entities.Component.filter({ include_in_pipelines: true, status: "published" }),
        ]);
        setPipelines(pl || []);
        setPoolCount((optedIn || []).length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countFor = (p) =>
    p.pipeline_type === "best_of_pool" ? poolCount : (p.component_codes || []).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">
      <SharedNav mode="user" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Building2 className="w-3.5 h-3.5" /> Enterprise Pipelines
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Pipeline Keys for Companies</h1>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            License a curated bundle of components behind a single secure key. Full payment unlocks your key instantly — Stripe, PayPal, and Coinbase (soon).
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>
        ) : pipelines.length === 0 ? (
          <div className="text-center text-slate-500 py-16 flex flex-col items-center gap-3">
            <Layers className="w-10 h-10 opacity-40" />
            No pipelines are available yet. Check back soon.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {pipelines.map((p) => (
              <PipelineCard key={p.id} pipeline={p} componentCount={countFor(p)} onBuy={setBuying} />
            ))}
          </div>
        )}
      </div>

      <PurchasePipelineDialog pipeline={buying} open={!!buying} onClose={() => setBuying(null)} />
    </div>
  );
}