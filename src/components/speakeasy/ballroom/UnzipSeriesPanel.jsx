import React, { useState } from "react";
import { Loader2, Sparkles, Lock, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UNZIP_TILES } from "./unzipSeries";

const GOLD = "#C8A95B";

/**
 * UnzipSeriesPanel — the "Unzipped Series" one-time purchase path inside the
 * Gen-2 Vault. Each Buy button triggers a ONE-TIME Stripe checkout via
 * createUnzipCheckout (mode: "payment"), bypassing recurring-subscription logic.
 * Checkout is blocked inside the builder iframe (Stripe redirect needs the
 * published app).
 */
export default function UnzipSeriesPanel() {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const buy = async (tile) => {
    setError("");
    // Stripe redirect checkout can't run inside the builder preview iframe.
    if (window.self !== window.top) {
      setError("Checkout only works from the published app — open the live site to purchase.");
      return;
    }
    setBusyId(tile.id);
    try {
      const res = await base44.functions.invoke("createUnzipCheckout", { componentId: tile.id });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || "Could not start checkout. Please try again.");
      }
    } catch {
      setError("Could not start checkout. Please try again.");
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: GOLD }}>
          One-Time · Lifetime Access
        </p>
        <p className="text-xs text-white/55 max-w-md mx-auto">
          The Unzipped Series — buy an Intel Tile once, keep it forever. No subscription.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {UNZIP_TILES.map((tile) => (
          <div
            key={tile.id}
            className="flex flex-col gap-2 rounded-xl border p-3"
            style={{
              background: tile.flagship ? "rgba(200,169,91,0.08)" : "rgba(255,255,255,0.03)",
              borderColor: tile.flagship ? `${GOLD}66` : "#ffffff14",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {tile.flagship ? <Crown className="w-3.5 h-3.5" style={{ color: GOLD }} /> : <Sparkles className="w-3.5 h-3.5 text-white/40" />}
                <span className="text-xs font-bold text-white leading-tight">{tile.name}</span>
              </div>
            </div>
            <p className="text-[11px] text-white/50 leading-snug flex-1">{tile.tagline}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">${tile.price}</span>
              <button
                onClick={() => buy(tile)}
                disabled={busyId === tile.id}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold text-[#0A0A0C] disabled:opacity-60"
                style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
              >
                {busyId === tile.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}