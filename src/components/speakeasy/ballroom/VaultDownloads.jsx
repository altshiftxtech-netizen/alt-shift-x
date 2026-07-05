import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, Download, FileArchive, Package, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GEN2_LAYERS } from "./gen2Lineage";

const GOLD = "#C8A95B";

// Flattened list of every Gen-2 Vault component, for the pick-a-batch download.
const VAULT_COMPONENTS = GEN2_LAYERS.flatMap((l) => l.components);

/**
 * VaultDownloads — the UNZIP-DASH-1.0 tab. A paywalled panel where paying
 * members download the Gen-2 Vault components as a ZIP. Access mirrors the
 * ProxyRoomGate rule: admins + paying (non-free) subscribers pass; everyone
 * else sees an upgrade prompt. Downloads reuse downloadOwnedComponentsZip.
 */
export default function VaultDownloads() {
  const [status, setStatus] = useState("loading"); // loading | guest | free | member
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { setStatus("member"); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: user.id });
        const sub = subs[0];
        const paying = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
        setStatus(paying ? "member" : "free");
      } catch {
        setStatus("guest");
      }
    })();
  }, []);

  const run = async (mode) => {
    setBusy(true);
    setError("");
    try {
      const ids = mode === "selected" ? Object.keys(picked).filter((k) => picked[k]) : [];
      if (mode === "selected" && ids.length === 0) {
        setError("Pick at least one component.");
        setBusy(false);
        return;
      }
      const res = await base44.functions.invoke("downloadOwnedComponentsZip", { mode, component_ids: ids });
      if (res.data?.url) {
        const a = document.createElement("a");
        a.href = res.data.url;
        a.download = "gen2_vault_components.zip";
        a.target = "_blank";
        a.click();
      } else {
        setError(res.data?.error || "Could not build the ZIP. Please try again.");
      }
    } catch {
      setError("Could not build the ZIP. Please try again.");
    }
    setBusy(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: `${GOLD}99` }} />
      </div>
    );
  }

  // Paywall — guests and free-tier members
  if (status !== "member") {
    const isGuest = status === "guest";
    return (
      <div className="text-center py-10 px-4">
        <div className="w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center mb-4"
          style={{ borderColor: `${GOLD}33`, background: `${GOLD}14` }}>
          <Lock className="w-5 h-5" style={{ color: GOLD }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>Members Only</p>
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Vault Downloads are locked
        </h3>
        <p className="text-xs text-white/55 leading-relaxed max-w-sm mx-auto mb-5">
          {isGuest
            ? "Sign in with a paying membership to download the Gen-2 Vault components."
            : "Downloadable component bundles are reserved for paying members. Upgrade to unlock."}
        </p>
        {isGuest ? (
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="rounded-full font-bold text-[#0A0A0C] px-6 py-2 text-sm"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
          >
            Sign In
          </button>
        ) : (
          <Link to="/pricing" className="inline-block rounded-full font-bold text-[#0A0A0C] px-6 py-2 text-sm"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}>
            Upgrade to Unlock
          </Link>
        )}
      </div>
    );
  }

  // Member — download controls
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl border flex items-center justify-center mb-3"
          style={{ borderColor: `${GOLD}33`, background: `${GOLD}14` }}>
          <FileArchive className="w-5 h-5" style={{ color: GOLD }} />
        </div>
        <p className="text-xs text-white/55 max-w-md mx-auto">
          Download the Gen-2 Vault component bundles you own as a ZIP.
        </p>
      </div>

      <button
        onClick={() => run("all")}
        disabled={busy}
        className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors disabled:opacity-60 hover:border-[#C8A95B]"
        style={{ borderColor: "#ffffff1f", background: "rgba(255,255,255,0.03)" }}
      >
        <Package className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Download everything</p>
          <p className="text-[11px] text-white/45">All the vault components you own</p>
        </div>
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-white/50" /> : <Download className="w-4 h-4 text-white/40" />}
      </button>

      <div className="rounded-xl border p-3" style={{ borderColor: "#ffffff1f" }}>
        <p className="text-sm font-bold text-white mb-2">Pick a batch</p>
        <div className="max-h-44 overflow-y-auto space-y-1 mb-3 pr-1">
          {VAULT_COMPONENTS.map((c) => (
            <label key={c.code} className="flex items-center gap-2 text-xs text-white/70 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!picked[c.id]}
                onChange={(e) => setPicked((p) => ({ ...p, [c.id]: e.target.checked }))}
                className="w-3.5 h-3.5 rounded border-white/30"
                style={{ accentColor: GOLD }}
              />
              <span className="font-semibold">{c.name}</span>
              <span className="text-white/35 font-mono">{c.code}</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => run("selected")}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-[#0A0A0C]"
          style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download selected
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}