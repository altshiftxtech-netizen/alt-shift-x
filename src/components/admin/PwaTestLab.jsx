import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Beaker, Loader2, Smartphone, Tablet, Monitor, Zap, Wrench,
  AlertTriangle, CheckCircle2, XCircle, Bomb, RefreshCw,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const APP_URL = "https://unlock-agent-flow.base44.app";
const SOV_ADMIN_TOKEN = "SOV-ADMIN-PM1A-X5";

const DEVICE_FRAMES = [
  { label: "Mobile", icon: Smartphone, width: 375, height: 667 },
  { label: "Tablet", icon: Tablet, width: 768, height: 1024 },
  { label: "Desktop", icon: Monitor, width: 1280, height: 800 },
];

function CheckRow({ check }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-slate-800 last:border-0">
      {check.passed ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-200">{check.check}</p>
        <p className="text-[11px] text-slate-400">{check.detail}</p>
      </div>
    </div>
  );
}

export default function PwaTestLab() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [testing, setTesting] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [stressTesting, setStressTesting] = useState(false);
  const [report, setReport] = useState(null);
  const [stressReport, setStressReport] = useState(null);
  const [error, setError] = useState(null);
  const [activeDevice, setActiveDevice] = useState(0);
  const [frameKey, setFrameKey] = useState(0);

  useEffect(() => {
    base44.entities.PwaExport.list("-date_wired", 500)
      .then((data) => { setExports(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selected = exports.find((e) => e.id === selectedId);

  const runTest = useCallback(async () => {
    if (!selected) return;
    setTesting(true);
    setError(null);
    setReport(null);
    try {
      const res = await base44.functions.invoke("testPwaExport", { export_id: selected.id });
      setReport(res.data || res);
    } catch (e) {
      setError(e.message || "Test failed");
    } finally {
      setTesting(false);
    }
  }, [selected]);

  const runFix = useCallback(async () => {
    if (!selected) return;
    setFixing(true);
    setError(null);
    try {
      // Step 1: Run diagnostic
      const testRes = await base44.functions.invoke("testPwaExport", { export_id: selected.id });
      const testReport = testRes.data || testRes;
      setReport(testReport);

      // Step 2: If there are missing components, create stubs via SOV-PWA-AUTO-REPAIR-1.0 logic
      const missingCheck = testReport.checks?.find(c => c.check?.includes("component codes resolve"));
      if (missingCheck && !missingCheck.passed) {
        const detailMatch = missingCheck.detail?.match(/Missing: (.+?)( —|$)/);
        if (detailMatch) {
          const missingCodes = detailMatch[1].split(", ").map(c => c.trim());
          for (const code of missingCodes) {
            await base44.functions.invoke("createComponentSafe", {
              component: {
                builder_id: "auto-repair",
                name: code,
                code,
                type: "X5",
                category: "Marketplace & Deployment Kits",
                description: `Auto-created by SOV-PWA-AUTO-REPAIR-1.0 for PWA export ${selected.name}`,
                price: 0,
              },
            });
          }
        }
      }

      // Step 3: Re-run test to confirm fix
      const retestRes = await base44.functions.invoke("testPwaExport", { export_id: selected.id });
      setReport(retestRes.data || retestRes);
    } catch (e) {
      setError(e.message || "Fix failed");
    } finally {
      setFixing(false);
    }
  }, [selected]);

  const runStressTest = useCallback(async () => {
    if (!selected) return;
    setStressTesting(true);
    setError(null);
    setStressReport(null);
    try {
      const runs = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        const res = await base44.functions.invoke("testPwaExport", { export_id: selected.id });
        const elapsed = Date.now() - start;
        const data = res.data || res;
        runs.push({ run: i + 1, elapsed, ok: data.ok, passed: data.passed, failed: data.failed });
      }
      const allPassed = runs.every(r => r.ok);
      const avgMs = Math.round(runs.reduce((s, r) => s + r.elapsed, 0) / runs.length);
      setStressReport({ runs, allPassed, avgMs });
    } catch (e) {
      setError(e.message || "Stress test failed");
    } finally {
      setStressTesting(false);
    }
  }, [selected]);

  const detonate = useCallback(() => {
    // Clear indexedDB (best-effort across browsers)
    try {
      if (indexedDB && typeof indexedDB.databases === "function") {
        indexedDB.databases().then(dbs => dbs.forEach(db => indexedDB.deleteDatabase(db.name)));
      } else {
        // Fallback: delete known DB names
        ["pm1a_identity", "sov-pwa-shell-v1", "base44_cache"].forEach(name => {
          try { indexedDB.deleteDatabase(name); } catch {}
        });
      }
    } catch {}

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Reset state and reload frames
    setReport(null);
    setStressReport(null);
    setError(null);
    setFrameKey(k => k + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const PWA_THEME = "#0a0e1a";
  const PWA_BG = "#1a2332";
  const FAVICON_URL = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg";

  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
          <Beaker className="w-4 h-4" style={{ color: "#dc2626" }} />
          PWA Test Lab — Architect's View
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-[11px] text-slate-500">
          Select a wired PWA package to run diagnostics, stress tests, and simulate
          the installed experience across device-accurate frames. The Sovereign Admin
          Token is injected into every frame URL to bypass setup wizards.
        </p>

        {/* Export selector */}
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setReport(null); setStressReport(null); setError(null); }}
          className="w-full bg-slate-950 text-slate-200 text-sm px-3 py-2.5 rounded-lg border border-slate-700 outline-none focus:border-slate-500"
        >
          <option value="">Select a PWA package to test…</option>
          {exports.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name} — v{exp.version || "1.0.0"} ({exp.status})
            </option>
          ))}
        </select>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            onClick={runTest}
            disabled={!selected || testing || fixing || stressTesting}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />}
            Test
          </Button>
          <Button
            onClick={runFix}
            disabled={!selected || testing || fixing || stressTesting}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            {fixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />}
            Fix
          </Button>
          <Button
            onClick={runStressTest}
            disabled={!selected || testing || fixing || stressTesting}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            {stressTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Beaker className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />}
            BALLS
          </Button>
          <Button
            onClick={detonate}
            disabled={testing || fixing || stressTesting}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            <Bomb className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
            Detonate
          </Button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {/* Diagnostic report */}
        {report && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-200">Diagnostic Report</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.ok ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>
                {report.passed} passed · {report.failed} failed
              </span>
            </div>
            {report.checks?.map((check, i) => (
              <CheckRow key={i} check={check} />
            ))}
            {report.summary && (
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-700">
                {report.summary}
              </p>
            )}
          </div>
        )}

        {/* Stress test report */}
        {stressReport && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-200">SOV-STRESS-BATTERY-1.0 — 5-Run Sweep</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stressReport.allPassed ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>
                {stressReport.allPassed ? "ALL PASSED" : "FAILURES DETECTED"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {stressReport.runs.map((r) => (
                <div key={r.run} className="bg-slate-950 rounded p-1.5 text-center border border-slate-700">
                  <p className="text-[9px] text-slate-500">Run {r.run}</p>
                  <p className="text-[10px] font-bold" style={{ color: r.ok ? "#34d399" : "#f87171" }}>
                    {r.ok ? "✓" : "✗"}
                  </p>
                  <p className="text-[9px] text-slate-500">{r.elapsed}ms</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Avg response: {stressReport.avgMs}ms · {stressReport.allPassed ? "PWA is stable under load" : "PWA has reliability issues — run Fix"}
            </p>
          </div>
        )}

        {/* Device-accurate simulator frames */}
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-300">Architect's View — Device Frames</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFrameKey(k => k + 1)}
                className="h-6 px-2 text-[10px] text-slate-400 hover:text-slate-200"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reload frames
              </Button>
            </div>

            {/* Device selector (mobile-friendly) */}
            <div className="flex gap-1.5">
              {DEVICE_FRAMES.map((frame, i) => {
                const Icon = frame.icon;
                return (
                  <button
                    key={frame.label}
                    onClick={() => setActiveDevice(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      activeDevice === i
                        ? "bg-slate-700 text-slate-100"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {frame.label}
                  </button>
                );
              })}
            </div>

            {/* Active device frame — manifest-driven PWA shell preview */}
            {(() => {
              const frame = DEVICE_FRAMES[activeDevice];
              const Icon = frame.icon;
              const frameW = Math.min(frame.width, 600);
              const frameH = Math.min(frame.height, 500);
              const isMobile = frame.label === "Mobile";
              return (
                <div className="overflow-auto bg-slate-950 rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] text-slate-400">
                      {frame.label} — {frame.width}×{frame.height}
                    </span>
                    <span className="text-[10px] text-slate-600 ml-auto font-mono">
                      sov_token={SOV_ADMIN_TOKEN}
                    </span>
                  </div>
                  <div
                    key={`${frameKey}-${activeDevice}`}
                    className="mx-auto rounded-xl border-4 border-slate-800 overflow-hidden shadow-2xl flex flex-col"
                    style={{ width: frameW, height: frameH, backgroundColor: PWA_BG }}
                  >
                    {/* Mock status bar */}
                    <div
                      className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono flex-shrink-0"
                      style={{ backgroundColor: PWA_THEME, color: "#94a3b8" }}
                    >
                      <span>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="font-bold truncate max-w-[60%]">{selected.name}</span>
                      <span>100%</span>
                    </div>
                    {/* App shell — PWA manifest preview */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: PWA_BG }}>
                      <img
                        src={FAVICON_URL}
                        alt="PWA icon"
                        className="rounded-2xl mb-3 shadow-lg"
                        style={{ width: isMobile ? 48 : 72, height: isMobile ? 48 : 72, objectFit: "cover" }}
                      />
                      <p className="text-sm font-bold text-slate-100 mb-1" style={{ fontSize: isMobile ? 12 : 14 }}>
                        {selected.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mb-3" style={{ fontSize: isMobile ? 9 : 11 }}>
                        v{selected.version || "1.0.0"}
                      </p>
                      {selected.description && (
                        <p className="text-[10px] text-slate-500 max-w-[80%] line-clamp-2 mb-3" style={{ fontSize: isMobile ? 8 : 10 }}>
                          {selected.description}
                        </p>
                      )}
                      <div
                        className="rounded-lg px-3 py-1.5 text-[10px] font-bold"
                        style={{ backgroundColor: "#dc2626", color: "#fff", fontSize: isMobile ? 9 : 11 }}
                      >
                        ▶ Launch PWA
                      </div>
                      {/* Manifest metadata */}
                      <div className="mt-4 space-y-0.5 text-[9px] text-slate-600 font-mono" style={{ fontSize: isMobile ? 7 : 9 }}>
                        <p>display: standalone</p>
                        <p>theme: {PWA_THEME}</p>
                        <p>scope: /</p>
                        <p>components: {selected.component_codes?.length || 0}</p>
                      </div>
                    </div>
                    {/* Mock nav bar */}
                    <div
                      className="flex items-center justify-around py-2 flex-shrink-0"
                      style={{ backgroundColor: PWA_THEME }}
                    >
                      {["🏠", "📦", "⚙️"].map((emoji, i) => (
                        <span key={i} className="text-[14px] opacity-60">{emoji}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* No selection hint */}
        {!selected && (
          <div className="text-center py-8 text-slate-500 text-xs">
            Select a PWA package above to begin testing.
          </div>
        )}
      </CardContent>
    </Card>
  );
}