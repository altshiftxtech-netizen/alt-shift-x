import React, { useState } from "react";
import { Lock, Loader2, Film, Unlock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FOUNDER_LORE_ID, FOUNDER_LORE_PRICE, CINEMA_ID, CINEMA_PRICE } from "./founderLore";

const GOLD = "#C8A95B";
const AMBER = "#E6A94B";

const inIframe = () => { try { return window.self !== window.top; } catch { return true; } };

/**
 * The lore action bar mounted below a portrait gallery:
 *  • "Unlock Founder History" — one-time $499 SPEAKEASY-FOUNDER-LORE-1.0 checkout.
 *  • "Director's Cut" — Sovereign-only toggle that activates the $999
 *    FOUNDER-CINEMA-BLUEPRINT-1.0 Noir-Cyber Comic Reader (buys it if needed).
 *
 * Props:
 *  loreUnlocked, cinemaUnlocked — entitlement flags (from useFounderLore).
 *  isSovereign — gates the Director's Cut control.
 *  directorMode, onToggleDirector — the reader on/off state (lifted to page).
 */
export default function FounderLoreBar({ loreUnlocked, cinemaUnlocked, isSovereign, directorMode, onToggleDirector }) {
  const [busy, setBusy] = useState(null); // "lore" | "cinema" | null
  const [error, setError] = useState("");

  const buy = async (which, componentId) => {
    setError("");
    if (inIframe()) { setError("Checkout only works from the published app — open it in a new tab."); return; }
    setBusy(which);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", { componentId });
      if (res.data?.url) { window.location.href = res.data.url; return; }
      setError(res.data?.error || "Could not start checkout. Please sign in and try again.");
    } catch {
      setError("Could not start checkout. Please sign in and try again.");
    }
    setBusy(null);
  };

  const handleDirector = () => {
    if (cinemaUnlocked) { onToggleDirector(); return; }
    buy("cinema", CINEMA_ID);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Unlock Founder History */}
        {loreUnlocked ? (
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold" style={{ background: "rgba(200,169,91,0.12)", border: `1px solid ${GOLD}66`, color: GOLD }}>
            <Unlock className="w-4 h-4" /> Founder History Unlocked
          </div>
        ) : (
          <button onClick={() => buy("lore", FOUNDER_LORE_ID)} disabled={busy === "lore"}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50 transition-transform hover:-translate-y-px"
            style={{ background: `linear-gradient(90deg, #F0D98A, ${GOLD})`, boxShadow: `0 6px 22px ${GOLD}44` }}>
            {busy === "lore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Unlock Founder History · ${FOUNDER_LORE_PRICE}
          </button>
        )}

        {/* Director's Cut — Sovereign only */}
        {isSovereign && (
          <button onClick={handleDirector} disabled={busy === "cinema"}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-all"
            style={directorMode
              ? { background: AMBER, color: "#140d05", boxShadow: `0 0 26px ${AMBER}66` }
              : { background: "rgba(20,13,5,0.85)", color: AMBER, border: `1px solid ${AMBER}66` }}>
            {busy === "cinema" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {cinemaUnlocked ? (directorMode ? "Exit Director's Cut" : "Director's Cut") : `Director's Cut · $${CINEMA_PRICE}`}
          </button>
        )}
      </div>

      {isSovereign && !cinemaUnlocked && (
        <p className="mt-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: `${AMBER}aa` }}>Sovereign Tier · Noir-Cyber Comic Reader</p>
      )}
      {error && <p className="mt-2 text-[12px] text-red-300">{error}</p>}
    </div>
  );
}