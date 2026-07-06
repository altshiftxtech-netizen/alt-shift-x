import React, { useState } from "react";
import { Loader2, Gem, ShieldCheck, GitBranch, EyeOff, ScanLine, CheckCircle2, Award } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UNZIP_TILES } from "./unzipSeries";
import DiamondExtraction from "./DiamondExtraction";

const GOLD = "#C8A95B";
const PRESS_CODE = "SOVEREIGN-DIAMOND-PRESS-1.0";

/**
 * DiamondPressPanel — SOVEREIGN-DIAMOND-PRESS-1.0.
 *
 * Scanning the single-use QR code triggers the Diamond Press: the system
 * distills 1,500 possibilities into ONE master component cluster — a "Bankable
 * Solution" the user owns one-to-one. The Tamper-Evidence Seal is applied
 * BEFORE the masterpiece is handed off to the dashboard, and the result card
 * exposes the three "take it to the bank" controls: Commercial License badge,
 * Spin-off, and Un-market toggle.
 */
export default function DiamondPressPanel() {
  const [sourceId, setSourceId] = useState(UNZIP_TILES[0]?.id || "");
  const [pressing, setPressing] = useState(false);
  const [solution, setSolution] = useState(null); // { solution, integrity_seal_id, commercial_license_id }
  const [error, setError] = useState("");

  const [spinBusy, setSpinBusy] = useState(false);
  const [spinoff, setSpinoff] = useState(null);
  const [offGrid, setOffGrid] = useState(false);
  const [unmarketBusy, setUnmarketBusy] = useState(false);

  // "Scan the single-use QR code" → trigger the Diamond Press.
  const scanAndPress = async () => {
    setError("");
    setSolution(null);
    setSpinoff(null);
    setOffGrid(false);
    setPressing(true);
    try {
      // Hold the distillation animation for a beat so the extraction reads.
      const started = Date.now();
      const res = await base44.functions.invoke("diamondPress", { action: "press", component_id: sourceId });
      const elapsed = Date.now() - started;
      if (elapsed < 2600) await new Promise((r) => setTimeout(r, 2600 - elapsed));
      if (res.data?.ok) {
        setSolution(res.data);
      } else {
        setError(res.data?.error || "The press could not distill a solution. Try again.");
      }
    } catch {
      setError("The press could not distill a solution. Try again.");
    }
    setPressing(false);
  };

  const runSpinoff = async () => {
    if (!solution) return;
    setSpinBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("diamondPress", {
        action: "spinoff",
        component_id: solution.solution.id,
        current_version: solution.solution.version,
      });
      if (res.data?.ok) setSpinoff(res.data.spinoff);
      else setError(res.data?.error || "Could not spin off a new version.");
    } catch {
      setError("Could not spin off a new version.");
    }
    setSpinBusy(false);
  };

  const toggleUnmarket = async () => {
    if (!solution) return;
    const next = !offGrid;
    setUnmarketBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("diamondPress", {
        action: "unmarket",
        component_id: solution.solution.id,
        off_grid: next,
      });
      if (res.data?.ok) setOffGrid(res.data.off_grid);
      else setError(res.data?.error || "Could not change the market visibility.");
    } catch {
      setError("Could not change the market visibility.");
    }
    setUnmarketBusy(false);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: GOLD }}>
          {PRESS_CODE}
        </p>
        <p className="text-xs text-white/55 max-w-md mx-auto">
          Scan the single-use QR code to run the Diamond Press. It distills 1,500 possibilities into the
          one Optimal Solution — a Bankable Solution you own one-to-one.
        </p>
      </div>

      {/* Extraction stage */}
      <div className="rounded-2xl border p-6" style={{ borderColor: `${GOLD}33`, background: "rgba(255,255,255,0.02)" }}>
        <DiamondExtraction pressing={pressing} />
        <p className="text-center text-[11px] text-white/45 mt-2">
          {pressing ? "Distilling 1,500 possibilities → 1 Optimal Solution…" : solution ? "Optimal Solution distilled." : "Press idle — ready to distill."}
        </p>

        {!solution && (
          <div className="mt-5 max-w-sm mx-auto space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Seed cluster</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                disabled={pressing}
                className="mt-1 w-full rounded-lg px-3 py-2 text-xs text-white bg-black/40 border border-white/15 focus:outline-none focus:border-[#C8A95B]"
              >
                {UNZIP_TILES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#12100b]">{t.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={scanAndPress}
              disabled={pressing}
              className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-[#0A0A0C] disabled:opacity-60"
              style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
            >
              {pressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              {pressing ? "Pressing…" : "Scan QR & Run Diamond Press"}
            </button>
          </div>
        )}
      </div>

      {/* Bankable Solution result */}
      {solution && (
        <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: `${GOLD}55`, background: "rgba(200,169,91,0.06)" }}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}55` }}>
              <Gem className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Bankable Solution</p>
              <h4 className="text-base font-bold text-white leading-tight truncate">{solution.solution.name}</h4>
              <p className="text-[10px] font-mono text-white/40">{solution.solution.code} · {solution.solution.version}</p>
            </div>
          </div>

          {/* Take-it-to-the-bank badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-emerald-300" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)" }}>
              <Award className="w-3 h-3" /> Commercial License — one-to-one logic
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold text-white/70" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #ffffff22" }}>
              <ShieldCheck className="w-3 h-3" style={{ color: GOLD }} /> Sealed {solution.integrity_seal_id}
            </span>
          </div>
          <p className="text-[10px] text-white/40 font-mono">License {solution.commercial_license_id}</p>

          {/* Controls */}
          <div className="grid sm:grid-cols-2 gap-2.5">
            {/* Spin-off */}
            <button
              onClick={runSpinoff}
              disabled={spinBusy}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-[#0A0A0C] disabled:opacity-60"
              style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
            >
              {spinBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
              Spin off new version
            </button>

            {/* Un-market toggle */}
            <button
              onClick={toggleUnmarket}
              disabled={unmarketBusy}
              className="flex items-center justify-between gap-2 rounded-xl py-2.5 px-3 text-xs font-bold border disabled:opacity-60"
              style={{
                borderColor: offGrid ? `${GOLD}66` : "#ffffff1f",
                background: offGrid ? `${GOLD}18` : "rgba(255,255,255,0.03)",
                color: offGrid ? GOLD : "#ffffffcc",
              }}
            >
              <span className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                {offGrid ? "Off-grid · Private" : "On-grid · Shelved"}
              </span>
              {unmarketBusy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span className="relative inline-block w-8 h-4 rounded-full transition-colors" style={{ background: offGrid ? GOLD : "#ffffff33" }}>
                  <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: offGrid ? "18px" : "2px" }} />
                </span>
              )}
            </button>
          </div>

          {spinoff && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Spun off <span className="font-mono">{spinoff.code}</span> ({spinoff.version}) as a new draft.
            </p>
          )}

          <p className="text-center text-[10px] text-white/35 italic pt-1">
            Sealed and handed off to your dashboard. Take it to the bank. 💎
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}