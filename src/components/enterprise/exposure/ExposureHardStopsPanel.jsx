import React, { useState, useEffect } from "react";
import { Loader2, Gauge, ShieldAlert, DollarSign, DoorOpen, Activity, Clock, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RULE_CARDS = [
  {
    rule_code: "VALUE_DENSITY_100M",
    name: "Value-Density Threshold",
    subtitle: "The $100M Rule",
    threshold: "≥ $100M ARR generated or updated in a single session",
    icon: DollarSign,
    accent: "#E6C878",
  },
  {
    rule_code: "PROMETHEUS_GATE",
    name: "Strategic Boundary Gate",
    subtitle: "The Prometheus Gate",
    threshold: "Session terminated when shifting Production → External Outreach",
    icon: DoorOpen,
    accent: "#7BA7D9",
  },
  {
    rule_code: "CONTEXT_SATURATION_60",
    name: "Context Saturation",
    subtitle: "The 60% Rule",
    threshold: "60% of token window OR noticeable typing lag",
    icon: Activity,
    accent: "#C98A9E",
  },
  {
    rule_code: "TEMPORAL_4H",
    name: "Temporal Hard-Stop",
    subtitle: "The 4-Hour Standard",
    threshold: "Maximum 4 hours per high-stakes session",
    icon: Clock,
    accent: "#8EC9A6",
  },
];

const RULE_LABEL = (code) => {
  const r = RULE_CARDS.find((c) => c.rule_code === code);
  return r ? `${r.name} · ${r.subtitle}` : code;
};

export default function ExposureHardStopsPanel() {
  const [sessionId, setSessionId] = useState("");
  const [arrValue, setArrValue] = useState("");
  const [phase, setPhase] = useState("production");
  const [contextPct, setContextPct] = useState("");
  const [typingLag, setTypingLag] = useState(false);
  const [durationMin, setDurationMin] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const me = await base44.auth.me();
      const data = me?.id
        ? await base44.entities.ExposureHardStop.filter({ owner_id: me.id }, "-triggered_at", 20)
        : [];
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleEvaluate = async () => {
    if (!sessionId.trim()) return;
    setEvaluating(true);
    setResult(null);
    try {
      const payload = {
        session_id: sessionId.trim(),
        arr_value: arrValue ? Number(arrValue) : undefined,
        phase,
        context_pct: contextPct ? Number(contextPct) : undefined,
        typing_lag: typingLag,
        session_duration_minutes: durationMin ? Number(durationMin) : undefined,
      };
      const res = await base44.functions.invoke("evaluateExposureHardStops", payload);
      setResult(res.data);
      if (res.data?.bit_stamped_and_purged) loadHistory();
    } catch (e) {
      setResult({ error: e.message || "Evaluation failed" });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.25)" }}>
          <ShieldAlert className="w-3.5 h-3.5 text-[#E6C878]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E6C878]">SOVEREIGN-EXPOSURE-HARDSTOP-1.0</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Exposure Hard-Stops
        </h2>
        <p className="text-white/50 text-sm mt-2 max-w-xl mx-auto">
          Four hard-stops that bound every high-stakes Sovereign session. When any threshold is breached, the session logic-state is bit-stamped into the Truth Anchor and the buffer is purged.
        </p>
      </div>

      {/* Rule cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {RULE_CARDS.map((r) => (
          <div key={r.rule_code} className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${r.accent}1A`, border: `1px solid ${r.accent}33` }}>
                <r.icon className="w-4 h-4" style={{ color: r.accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{r.name}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: r.accent }}>{r.subtitle}</p>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{r.threshold}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Evaluate session */}
      <div className="rounded-xl border border-white/10 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-4 h-4 text-[#E6C878]" />
          <h3 className="text-sm font-bold text-white">Evaluate Session Telemetry</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-white/50 font-semibold block mb-1">Session ID *</label>
            <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="e.g. sess-sov-2026-0707" className="w-full bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#E6C878]/50" />
          </div>
          <div>
            <label className="text-[11px] text-white/50 font-semibold block mb-1">ARR Generated/Updated ($)</label>
            <input value={arrValue} onChange={(e) => setArrValue(e.target.value)} type="number" placeholder="e.g. 125000000" className="w-full bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#E6C878]/50" />
          </div>
          <div>
            <label className="text-[11px] text-white/50 font-semibold block mb-1">Session Phase</label>
            <select value={phase} onChange={(e) => setPhase(e.target.value)} className="w-full bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#E6C878]/50">
              <option value="production">Production (building KBTs / Components)</option>
              <option value="external_outreach">External Outreach (Bezos Bridge)</option>
              <option value="mixed">Mixed (both — triggers Prometheus Gate)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-white/50 font-semibold block mb-1">Context Window Saturation (%)</label>
            <input value={contextPct} onChange={(e) => setContextPct(e.target.value)} type="number" min="0" max="100" placeholder="e.g. 62" className="w-full bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#E6C878]/50" />
          </div>
          <div>
            <label className="text-[11px] text-white/50 font-semibold block mb-1">Session Duration (minutes)</label>
            <input value={durationMin} onChange={(e) => setDurationMin(e.target.value)} type="number" placeholder="e.g. 252" className="w-full bg-black/40 text-white text-sm px-3 py-2 rounded-lg border border-white/10 outline-none focus:border-[#E6C878]/50" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer select-none pb-2">
              <input type="checkbox" checked={typingLag} onChange={(e) => setTypingLag(e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-black/40" />
              Noticeable typing lag detected
            </label>
          </div>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={evaluating || !sessionId.trim()}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-colors disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #E6C878, #C8A95B)", color: "#05060a" }}
        >
          {evaluating ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating…</> : <><Gauge className="w-4 h-4" /> Evaluate Against Hard-Stops</>}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border p-5" style={{
          borderColor: result.bit_stamped_and_purged ? "rgba(239,68,68,0.4)" : "rgba(142,201,166,0.3)",
          background: result.bit_stamped_and_purged ? "rgba(239,68,68,0.08)" : "rgba(142,201,166,0.06)",
        }}>
          {result.error ? (
            <p className="text-sm text-red-300">{result.error}</p>
          ) : result.bit_stamped_and_purged ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-red-300">Exposure Hard-Stop Triggered — Bit-Stamped & Purged</h3>
              </div>
              <p className="text-xs text-white/60 mb-3">{result.message}</p>
              <div className="space-y-2">
                {(result.triggered || []).map((t, i) => (
                  <div key={i} className="rounded-lg bg-black/30 border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-white">{t.rule_name}</p>
                      <span className="text-[10px] font-mono text-[#E6C878]">{t.trigger_value}</span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5">Threshold: {t.threshold}</p>
                    <p className="text-[10px] font-mono text-white/30 mt-1">BIT-STAMP: {t.bit_stamp_hash?.slice(0, 24)}…</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-300">Within All Thresholds</h3>
              </div>
              <p className="text-xs text-white/50">{result.message}</p>
            </>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E6C878]" /> Recent Hard-Stop Triggers
        </h3>
        {loadingHistory ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
        ) : history.length === 0 ? (
          <p className="text-center text-xs text-white/30 py-8">No hard-stops triggered yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="rounded-lg border border-white/10 p-3 flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{RULE_LABEL(h.rule_code)}</p>
                  <p className="text-[11px] text-white/40">Session: {h.session_id} · {h.trigger_value}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] font-mono text-[#E6C878]">{h.bit_stamp_hash?.slice(0, 12)}…</p>
                  <p className="text-[10px] text-white/30">{h.triggered_at ? new Date(h.triggered_at).toLocaleString() : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}