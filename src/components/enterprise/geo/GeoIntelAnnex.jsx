import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Globe2, Radar, Loader2, Zap, Gem, AlertTriangle, ArrowUpRight, X, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SignalPulse from "./SignalPulse";
import CreditBurnMeter from "./CreditBurnMeter";

const GOLD = "#e6c878";
const ANNEX_CODE = "GEO-INTEL-ANNEX-1.0";
const FETCHER_CODE = "GEO-INTEL-FETCHER-1.0";

/**
 * GeoIntelAnnex — the lean Geopolitical Annex console (GEO-INTEL-ANNEX-1.0).
 *
 * Forensic SRE theme: quiet, data-heavy. The cheap X3 fetcher pulses constantly
 * (green wave + signal-integrity meter). When it detects a delta, the operator
 * is gated: "Strategic Shift Detected. Wake GIA Reasoner? (~2,500 Tokens)". On
 * wake, the reasoner cross-references SEED-1500 and, on a match, the pulse turns
 * gold and a Diamond Press notification fires: "Bankable Opportunity Identified".
 */
export default function GeoIntelAnnex() {
  const [integrity, setIntegrity] = useState(96);
  const [delta, setDelta] = useState(null);       // pending strategic shift
  const [tokenEstimate, setTokenEstimate] = useState(2500);
  const [waking, setWaking] = useState(false);
  const [spent, setSpent] = useState(0);
  const [opportunity, setOpportunity] = useState(null); // bankable match → Diamond Press
  const [log, setLog] = useState([]);              // recent fetcher events
  const [error, setError] = useState("");
  const pulseTimer = useRef(null);

  const pushLog = (entry) => setLog((l) => [{ id: crypto.randomUUID().slice(0, 6), ts: new Date(), ...entry }, ...l].slice(0, 8));

  // Constant fetcher heartbeat — cheap pulse every ~7s. Don't overwrite a
  // delta the operator hasn't cleared yet.
  const runPulse = async () => {
    try {
      const res = await base44.functions.invoke("geoIntelReasoner", { action: "pulse" });
      if (res.data?.ok) {
        setIntegrity(res.data.signal_integrity);
        setTokenEstimate(res.data.wake_token_estimate || 2500);
        if (res.data.delta) {
          setDelta((prev) => prev || res.data.delta);
          pushLog({ kind: "delta", text: `Δ ${res.data.delta.theater} · ${res.data.delta.vector}` });
        } else {
          pushLog({ kind: "clear", text: `Integrity ${res.data.signal_integrity}% · nominal` });
        }
      }
    } catch {
      setIntegrity((v) => Math.max(60, v - 4));
    }
  };

  useEffect(() => {
    runPulse();
    pulseTimer.current = setInterval(runPulse, 7000);
    return () => clearInterval(pulseTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wakeReasoner = async () => {
    if (!delta) return;
    setWaking(true);
    setError("");
    try {
      const res = await base44.functions.invoke("geoIntelReasoner", { action: "wake", delta });
      if (res.data?.ok) {
        setSpent((s) => s + (res.data.tokens_spent || 2500));
        if (res.data.match_found && res.data.opportunity) {
          setOpportunity(res.data.opportunity);
          pushLog({ kind: "bankable", text: `Bankable: ${res.data.opportunity.component_name}` });
        } else {
          pushLog({ kind: "nomatch", text: "Reasoned · no bankable match" });
        }
        setDelta(null);
      } else {
        setError(res.data?.error || "The reasoner could not process the delta.");
      }
    } catch {
      setError("The reasoner could not process the delta.");
    }
    setWaking(false);
  };

  const dismissDelta = () => {
    setDelta(null);
    pushLog({ kind: "dismiss", text: "Delta dismissed — reasoner not woken" });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
            <Globe2 className="w-5 h-5" style={{ color: "#34d399" }} />
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: GOLD }}>{ANNEX_CODE} · $1,999/mo</p>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Geopolitical Annex</h3>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-white/40 mt-1">
          <Activity className="w-3 h-3" style={{ color: "#34d399" }} /> lean cluster · live
        </span>
      </div>

      {/* Signal Integrity — the Pulse */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
            <Radar className="w-3.5 h-3.5" style={{ color: opportunity ? GOLD : "#34d399" }} /> Signal Integrity
          </span>
          <span className="text-[11px] font-mono tabular-nums" style={{ color: opportunity ? GOLD : "#34d399" }}>
            {integrity}% <span className="text-white/30">· {FETCHER_CODE}</span>
          </span>
        </div>
        <SignalPulse integrity={integrity} bankable={!!opportunity} />
        <CreditBurnMeter spent={spent} />
      </div>

      {/* The Gate — Strategic Shift Detected */}
      {delta && !opportunity && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(230,200,120,0.06)", border: "1px solid rgba(230,200,120,0.3)" }}>
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Strategic Shift Detected</p>
            <p className="text-[11px] text-white/55 mt-0.5">
              <span className="font-mono">{delta.theater}</span> · {delta.vector} · magnitude {delta.magnitude}/100
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                onClick={wakeReasoner}
                disabled={waking}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#0A0A0C] disabled:opacity-60"
                style={{ background: `linear-gradient(90deg,#D9DCE1,${GOLD})` }}
              >
                {waking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {waking ? "Waking Reasoner…" : `Wake GIA Reasoner · ~${tokenEstimate.toLocaleString()} Tokens`}
              </button>
              <button onClick={dismissDelta} disabled={waking} className="inline-flex items-center gap-1 text-[11px] text-white/45 hover:text-white/80 px-2 py-2">
                <X className="w-3.5 h-3.5" /> Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diamond Press notification — Bankable Opportunity Identified */}
      {opportunity && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "rgba(230,200,120,0.08)", border: "1px solid rgba(230,200,120,0.45)", boxShadow: "0 0 30px rgba(230,200,120,0.12)" }}>
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5" style={{ color: GOLD }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Diamond Press · Bankable Opportunity Identified</p>
          </div>
          <h4 className="text-base font-bold text-white leading-tight">{opportunity.component_name}</h4>
          {opportunity.component_code && (
            <p className="text-[10px] font-mono text-white/40">{opportunity.component_code}
              {opportunity.confidence != null && <span className="text-white/30"> · confidence {Math.round(opportunity.confidence * 100)}%</span>}
            </p>
          )}
          {opportunity.rationale && <p className="text-[12px] text-white/60 leading-relaxed">{opportunity.rationale}</p>}
          <p className="text-[10px] text-white/35 font-mono">Logged to GEO-INTEL-REGISTRY-1.0 · cross-referenced against SEED-1500-REGISTRY-1.0</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {opportunity.component_id && (
              <Link
                to={`/marketplace/${opportunity.component_id}`}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#0A0A0C]"
                style={{ background: `linear-gradient(90deg,#D9DCE1,${GOLD})` }}
              >
                Open Bankable Solution <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={() => setOpportunity(null)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold border text-white/70"
              style={{ borderColor: "#ffffff22", background: "rgba(255,255,255,0.03)" }}
            >
              Return to watch
            </button>
          </div>
        </div>
      )}

      {/* Fetcher event log — quiet, data-heavy */}
      <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35 mb-2 px-1">Fetcher Stream</p>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {log.length === 0 && <p className="text-[10px] font-mono text-white/25 px-1">Awaiting first pulse…</p>}
          {log.map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-[10px] font-mono px-1">
              <span className="text-white/25 tabular-nums">{e.ts.toLocaleTimeString([], { hour12: false })}</span>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: e.kind === "bankable" ? GOLD : e.kind === "delta" ? "#fbbf24" : e.kind === "nomatch" || e.kind === "dismiss" ? "#64748b" : "#34d399" }}
              />
              <span className={e.kind === "bankable" ? "text-[#e6c878]" : "text-white/55"}>{e.text}</span>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}