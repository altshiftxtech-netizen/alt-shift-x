import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Download, Sparkles, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LEGACY_BYPASS_CODE } from "./portraitRegistry";

/**
 * Speakeasy-styled portrait modal. Shows the component's long_description and a
 * Buy button. Two special cases:
 *  • P1 "Expertminds" (gate=true) → routes to the tutorial gate instead of buying.
 *  • P12 "Elias Bytewell" (elias=true) → typing "eb" reveals a free download
 *    button for the hidden FOUNDER-LEGACY-KIT-1.0.
 */
export default function PortraitModal({ portrait, onClose }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  // Elias secret-key state
  const [legacyRevealed, setLegacyRevealed] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockMsg, setUnlockMsg] = useState("");

  // Load the full component record for the long_description.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await base44.entities.Component.filter({ id: portrait.component_id });
        if (active) setDetail(rows[0] || null);
      } catch {
        if (active) setDetail(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [portrait.component_id]);

  // Elias Bytewell secret "eb" keystroke listener.
  useEffect(() => {
    if (!portrait.elias) return;
    let buffer = "";
    const onKey = (e) => {
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-LEGACY_BYPASS_CODE.length);
      if (buffer === LEGACY_BYPASS_CODE) setLegacyRevealed(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [portrait.elias]);

  const inIframe = () => { try { return window.self !== window.top; } catch { return true; } };

  const handleBuy = async () => {
    if (portrait.gate) {
      navigate("/expertmind?tier=member");
      return;
    }
    if (inIframe()) {
      setError("Checkout only works from the published app — open it in a new tab.");
      return;
    }
    setBuying(true);
    setError("");
    try {
      const res = await base44.functions.invoke("createCheckoutSession", { componentId: portrait.component_id });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || "Could not start checkout. Please sign in and try again.");
        setBuying(false);
      }
    } catch {
      setError("Could not start checkout. Please sign in and try again.");
      setBuying(false);
    }
  };

  const handleUnlockLegacy = async () => {
    setUnlocking(true);
    setUnlockMsg("");
    try {
      const res = await base44.functions.invoke("unlockFounderLegacy", {});
      if (res.data?.success) {
        setUnlockMsg(res.data.already_unlocked
          ? "Already in your library. Elias nods knowingly."
          : "Genetic Seed Kit unzipped. Elias welcomes you.");
      } else {
        setUnlockMsg(res.data?.error || "The vault stayed shut. Try again.");
      }
    } catch {
      setUnlockMsg("The vault stayed shut. Try again.");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(6,4,10,0.8)" }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ background: "linear-gradient(160deg, #16120b, #0b0805)", border: `1px solid ${portrait.accent}55`, boxShadow: `0 0 60px ${portrait.accent}33` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Portrait side */}
        <div className="md:w-2/5 relative shrink-0" style={{ background: "#0b0805" }}>
          <img src={portrait.image} alt={portrait.label} className="w-full h-48 md:h-full object-cover" style={legacyRevealed ? { filter: "brightness(1.15) saturate(1.2)" } : undefined} />
          {legacyRevealed && (
            <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ boxShadow: `inset 0 0 60px 12px ${portrait.accent}` }} />
          )}
        </div>

        {/* Detail side */}
        <div className="flex-1 p-5 relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>

          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: portrait.accent }}>{portrait.founder}</p>
          <h2 className="text-xl font-bold text-white mt-1 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{portrait.label}</h2>

          {loading ? (
            <div className="flex items-center gap-2 text-white/50 text-sm mt-4"><Loader2 className="w-4 h-4 animate-spin" /> Opening the portrait…</div>
          ) : (
            <>
              <p className="text-[13px] text-white/70 leading-relaxed mt-3 max-h-40 overflow-y-auto">
                {detail?.long_description || detail?.description || portrait.feature}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: portrait.accent }}>
                  {portrait.gate ? "Vault Access" : portrait.price === 0 ? "Free" : `$${portrait.price}/mo`}
                </span>
              </div>

              <button
                onClick={handleBuy}
                disabled={buying}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-black disabled:opacity-50 transition-transform hover:-translate-y-px"
                style={{ background: portrait.accent }}
              >
                {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : portrait.gate ? <Lock className="w-4 h-4" /> : null}
                {portrait.gate ? "Enter the Vault" : "Buy / Install"}
              </button>

              {error && <p className="text-[12px] text-red-300 mt-2">{error}</p>}

              {/* Elias Bytewell secret legacy unlock */}
              {portrait.elias && legacyRevealed && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: `${portrait.accent}33` }}>
                  <p className="text-[10px] uppercase tracking-[0.25em] flex items-center gap-1.5 mb-2" style={{ color: portrait.accent }}>
                    <Sparkles className="w-3 h-3" /> Founder's Legacy — unlocked
                  </p>
                  <button
                    onClick={handleUnlockLegacy}
                    disabled={unlocking}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                    style={{ background: "linear-gradient(90deg, #F0D98A, #C8A95B)" }}
                  >
                    {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download the Genetic Seed Kit — Free
                  </button>
                  {unlockMsg && <p className="text-[12px] mt-2" style={{ color: portrait.accent }}>{unlockMsg}</p>}
                </div>
              )}
              {portrait.elias && !legacyRevealed && (
                <p className="mt-3 text-[10px] italic text-white/30">Elias keeps a secret. Those who know, know.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}