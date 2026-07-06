import React, { useState } from "react";
import { Loader2, Sparkles, Lock, Crown, RefreshCw, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UNZIP_TILES } from "./unzipSeries";
import BlackstoneLegalGate from "@/components/legal/BlackstoneLegalGate";
import LegalClearanceBadge from "@/components/legal/LegalClearanceBadge";

const GOLD = "#C8A95B";
const BASE_VERSION = "V1.0.0";

/**
 * UnzipSeriesPanel — the "Unzipped Series" one-time purchase path inside the
 * Gen-2 Vault. Every UNZIP- tile is a legal-clearance cluster, so the Blackstone
 * Legal Gate must be signed BEFORE the Buy button releases checkout. Purchases
 * are a ONE-TIME "Lifetime Sovereign License" (createUnzipCheckout, mode:
 * "payment"). A version badge + Check for Updates resolves against the
 * GSP-MASTER-INDEX-1.0 registry via checkComponentVersion.
 */
export default function UnzipSeriesPanel() {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [gateTile, setGateTile] = useState(null);   // tile awaiting Blackstone signature
  const [cleared, setCleared] = useState({});        // tile.id → acceptance_hash
  const [checkingId, setCheckingId] = useState(null);
  const [versionInfo, setVersionInfo] = useState({}); // tile.id → { latest, update_available }

  const startBuy = (tile) => {
    setError("");
    // UNZIP- cluster → Blackstone legal clearance required before checkout.
    if (!cleared[tile.id]) {
      setGateTile(tile);
      return;
    }
    proceedToCheckout(tile);
  };

  const proceedToCheckout = async (tile) => {
    setError("");
    // Stripe redirect checkout can't run inside the builder preview iframe.
    if (window.self !== window.top) {
      setError("Checkout only works from the published app — open the live site to purchase.");
      return;
    }
    setBusyId(tile.id);
    try {
      const res = await base44.functions.invoke("createUnzipCheckout", {
        componentId: tile.id,
        acceptance_hash: cleared[tile.id],
      });
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

  const onCleared = (hash) => {
    const tile = gateTile;
    setCleared((c) => ({ ...c, [tile.id]: hash }));
    setGateTile(null);
    proceedToCheckout({ ...tile, _hash: hash });
  };

  const checkForUpdates = async (tile) => {
    setCheckingId(tile.id);
    try {
      const res = await base44.functions.invoke("checkComponentVersion", {
        component_code: tile.code,
        held_version: BASE_VERSION,
      });
      setVersionInfo((v) => ({
        ...v,
        [tile.id]: {
          latest: res.data?.latest_version || BASE_VERSION,
          update_available: !!res.data?.update_available,
        },
      }));
    } catch {
      setVersionInfo((v) => ({ ...v, [tile.id]: { latest: BASE_VERSION, update_available: false } }));
    }
    setCheckingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: GOLD }}>
          One-Time · Lifetime Sovereign License
        </p>
        <p className="text-xs text-white/55 max-w-md mx-auto">
          The Unzipped Series — buy an Intel Tile once, own it for life. No subscription, ever.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {UNZIP_TILES.map((tile) => {
          const vi = versionInfo[tile.id];
          const isCleared = !!cleared[tile.id];
          return (
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
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white/70" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #ffffff1f" }}>
                  {vi?.latest || BASE_VERSION}
                </span>
              </div>

              <p className="text-[11px] text-white/50 leading-snug flex-1">{tile.tagline}</p>

              <LegalClearanceBadge cleared={isCleared} className="self-start" />

              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">${tile.price}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => checkForUpdates(tile)}
                    disabled={checkingId === tile.id}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-semibold text-white/70 border border-white/15 hover:bg-white/5 disabled:opacity-60"
                    title="Check the GSP-MASTER-INDEX-1.0 registry for a newer version"
                  >
                    {checkingId === tile.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Check for Updates
                  </button>
                  <button
                    onClick={() => startBuy(tile)}
                    disabled={busyId === tile.id}
                    className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold text-[#0A0A0C] disabled:opacity-60"
                    style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
                  >
                    {busyId === tile.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                    Buy License
                  </button>
                </div>
              </div>

              {vi && (
                vi.update_available ? (
                  <button
                    onClick={() => checkForUpdates(tile)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-[#0A0A0C]"
                    style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
                  >
                    <RefreshCw className="w-3 h-3" /> Update to Latest Version ({vi.latest})
                  </button>
                ) : (
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> You're on the latest version</p>
                )
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <BlackstoneLegalGate
        open={!!gateTile}
        componentCode={gateTile?.code}
        componentId={gateTile?.id}
        componentName={gateTile?.name}
        onCancel={() => setGateTile(null)}
        onCleared={onCleared}
      />
    </div>
  );
}