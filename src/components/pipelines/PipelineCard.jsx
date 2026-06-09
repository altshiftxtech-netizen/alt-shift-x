import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Building2, Layers, ArrowRight, Crown, Users } from "lucide-react";

/**
 * Enterprise pipeline card — designed to appeal to large companies: trust badges,
 * "what's included" count, full-payment-unlocks-key messaging, and a clear CTA.
 */
export default function PipelineCard({ pipeline, componentCount, onBuy }) {
  const isExclusive = pipeline.pipeline_type === "curated_exclusive";
  const isOpen = pipeline.pipeline_type === "open_contribution";
  const isQuarterly = (pipeline.billing_cadence || "one_time") === "quarterly";
  const isBusiness = (pipeline.buyer_kind || "business") === "business";

  const typeLabel = isExclusive ? "Alt+Shift+X Developers" : isOpen ? "Open Contribution" : "Best-of Pipeline";
  const TypeIcon = isExclusive ? Sparkles : isOpen ? Users : Layers;

  return (
    <Card className={`relative overflow-hidden border bg-slate-900 ${isExclusive ? "border-amber-600/50" : "border-slate-700"}`}>
      {pipeline.featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-300 text-[10px] font-black text-slate-900 px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Crown className="w-3 h-3" /> FEATURED
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <TypeIcon className={`w-4 h-4 ${isExclusive ? "text-amber-400" : isOpen ? "text-emerald-400" : "text-violet-400"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isExclusive ? "bg-amber-900/40 text-amber-300 border border-amber-700/40" : isOpen ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/40" : "bg-violet-900/40 text-violet-300 border border-violet-700/40"}`}>
            {typeLabel}
          </span>
          {isBusiness && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Enterprise
            </span>
          )}
        </div>

        <h3 className="text-lg font-black text-white">{pipeline.name}</h3>
        {pipeline.tagline && <p className="text-sm text-violet-300 mt-0.5">{pipeline.tagline}</p>}
        {pipeline.description && <p className="text-sm text-slate-400 mt-2 leading-relaxed">{pipeline.description}</p>}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-slate-800/60 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Components included</p>
            <p className="text-xl font-black text-white mt-0.5">{componentCount}</p>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{isQuarterly ? "Per quarter" : "One-time price"}</p>
            <p className="text-xl font-black text-white mt-0.5">
              ${Number(pipeline.price || 0).toLocaleString()}{isQuarterly && <span className="text-xs font-bold text-slate-400">/qtr</span>}
            </p>
          </div>
        </div>

        {pipeline.resident_developer_ready && (
          <p className="text-[11px] text-amber-300/80 mt-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Expanding to include all Resident Developer components.
          </p>
        )}

        <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {isQuarterly
            ? "Quarterly subscription — billed 4× a year, cancel anytime."
            : "Full payment unlocks your secure key instantly — shown once."}
        </div>

        <Button onClick={() => onBuy(pipeline)} className="w-full mt-4 bg-violet-600 hover:bg-violet-700 gap-2">
          {isQuarterly ? "Subscribe to Pipeline" : "Get Pipeline Key"} <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-slate-600">
          <span>Stripe</span><span>·</span><span>PayPal</span><span>·</span><span>Coinbase (soon)</span>
        </div>
      </div>
    </Card>
  );
}