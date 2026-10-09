import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowLeft, Shield, Zap, CheckCircle, Clock, Package, DollarSign } from "lucide-react";

/**
 * DeltaProductionDossierModal
 * Full production dossier for a Delta Warehouse artifact — shows valuation,
 * escrow status, verified features, schema fields, and c2pa manifest info.
 */
export default function DeltaProductionDossierModal() {
  const { productionId } = useParams();
  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productionId) return;
    setLoading(true);
    base44.entities.Component.get(productionId)
      .then((data) => {
        setProduction(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Production not found");
        setLoading(false);
      });
  }, [productionId]);

  const formatPrice = (price) => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !production) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050508] gap-4 p-6">
        <Package className="w-12 h-12 text-zinc-700" />
        <p className="text-sm text-zinc-500">{error || "Production not found"}</p>
        <Link to="/warehouse" className="text-xs text-amber-400 hover:underline">← Back to Delta Warehouse</Link>
      </div>
    );
  }

  const isPublished = production.status === "published";
  const isPending = production.status === "pending_review";

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-5 backdrop-blur-xl border-b border-white/10 bg-[#050508]/80">
        <Link to="/warehouse" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition">
          <ArrowLeft className="w-4 h-4" /> Delta Warehouse
        </Link>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
            isPublished
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : isPending
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
          }`}>
            {isPublished ? <CheckCircle className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <Package className="w-3 h-3" />}
            {production.status?.toUpperCase().replace(/_/g, " ") || "DRAFT"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Title block */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 via-violet-600 to-cyan-400 p-[2px]">
              <div className="h-full w-full rounded-full bg-black flex items-center justify-center font-bold text-amber-400 text-sm">Δ</div>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/20">
              DELTA PRODUCTION DOSSIER
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{production.name}</h1>
          <p className="text-sm font-mono text-zinc-500">{production.code} · {production.type} · v{production.version || "1.0"}</p>
        </div>

        {/* Valuation & Escrow card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Production Valuation</h3>
            </div>
            <p className="text-3xl font-bold text-amber-400">{formatPrice(production.price)}</p>
            <p className="text-[11px] text-zinc-500 mt-1">{production.category}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Multi-Sig Escrow</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {isPublished ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                <span className={isPublished ? "text-emerald-400" : "text-zinc-400"}>
                  {isPublished ? "Escrow Verified — Production Ascended" : isPending ? "Awaiting Delta Master Verification" : "Draft — Not in Escrow"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-zinc-400">Kyber-1024 Vault Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-zinc-400">C2PA Manifest: Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {production.description && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Executive Summary</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{production.description}</p>
          </div>
        )}

        {/* Verified Features */}
        {production.features?.length > 0 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Verified Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {production.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schema Fields */}
        {production.schema?.length > 0 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Production Schema</h3>
            <div className="space-y-2">
              {production.schema.map((field, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-[10px] font-mono text-violet-400 px-2 py-0.5 rounded bg-violet-500/10">FIELD</span>
                  <span className="text-sm font-mono text-zinc-300">{field}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Long description */}
        {production.long_description && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Full Dossier</h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{production.long_description}</p>
          </div>
        )}
      </div>
    </div>
  );
}