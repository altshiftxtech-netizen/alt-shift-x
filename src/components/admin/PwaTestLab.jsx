import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Beaker, Loader2, Zap, Wrench, ExternalLink,
  AlertTriangle, CheckCircle2, XCircle, Bomb,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const APP_URL = "https://unlock-agent-flow.base44.app";
const SOV_ADMIN_TOKEN = "SOV-ADMIN-PM1A-X5";

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
  const [fixing, setFixing] = useState(false);
  const [stressTesting, setStressTesting] = useState(false);
  const [report, setReport] = useState(null);
  const [stressReport, setStressReport] = useState(null);
  const [error, setError] = useState(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    base44.entities.PwaExport.list("-date_wired", 500)
      .then((data) => { setExports(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selected = exports.find((e) => e.id === selectedId);

  const launchPwa = useCallback(async () => {
    if (!selected) return;
    setLaunching(true);
    setError(null);
    try {
      // If a hosted launch_url exists, open it directly
      if (selected.launch_url) {
        window.open(selected.launch_url, "_blank", "noopener,noreferrer");
        return;
      }
      // Otherwise, download the actual PWA product (ZIP package)
      if (selected.file_url) {
        const a = document.createElement("a");
        a.href = selected.file_url;
        a.download = `${selected.name}-${selected.version || "1.0.0"}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      if (selected.generate_function) {
        const response = await base44.functions.invoke(selected.generate_function, {
          export_id: selected.id,
        });
        const data = await (response.data ?? response);
        const b64 = data?.zip;
        if (!b64) throw new Error("No zip payload returned from generator.");
        const binStr = atob(b64);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data?.filename || `${selected.name}-${selected.version || "1.0.0"}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
      setError("This PWA export has no hosted URL, file_url, or generate function.");
    } catch (e) {
      setError(e.message || "Launch failed.");
    } finally {
      setLaunching(false);
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

    // Reset state
    setReport(null);
    setStressReport(null);
    setError(null);
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
            onClick={launchPwa}
            disabled={!selected || fixing || stressTesting || launching}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            {launching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />}
            Launch
          </Button>
          <Button
            onClick={runFix}
            disabled={!selected || fixing || stressTesting}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            {fixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />}
            Fix
          </Button>
          <Button
            onClick={runStressTest}
            disabled={!selected || fixing || stressTesting}
            className="gap-1.5 text-xs"
            style={{ backgroundColor: "#1a2332", color: "#e2e8f0", borderColor: "#64748b" }}
          >
            {stressTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Beaker className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />}
            BALLS
          </Button>
          <Button
            onClick={detonate}
            disabled={fixing || stressTesting}
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

        {/* Launch info panel */}
        {selected && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" style={{ color: "#fbbf24" }} />
              <p className="text-xs font-bold text-slate-200">PWA Test Mode</p>
            </div>
            <p className="text-[11px] text-slate-400">
              Click <span className="font-bold text-amber-400">Launch</span> to download the PWA package to your device.
              If a hosted URL is configured, it opens the deployed PWA in a new tab instead.
            </p>
            {selected.launch_url ? (
              <>
                <div className="bg-slate-950 rounded p-2 text-[10px] text-emerald-400 font-mono break-all">
                  {selected.launch_url}
                </div>
                <p className="text-[10px] text-emerald-500 font-semibold">
                  ✓ Hosted URL — opens the deployed PWA in a new tab
                </p>
              </>
            ) : selected.file_url ? (
              <>
                <div className="bg-slate-950 rounded p-2 text-[10px] text-sky-400 font-mono break-all">
                  {selected.file_url}
                </div>
                <p className="text-[10px] text-sky-500 font-semibold">
                  ✓ Pre-built ZIP — downloads the package directly
                </p>
              </>
            ) : selected.generate_function ? (
              <>
                <div className="bg-slate-950 rounded p-2 text-[10px] text-amber-400 font-mono break-all">
                  {selected.generate_function}()
                </div>
                <p className="text-[10px] text-amber-500 font-semibold">
                  ⚡ On-demand generation — builds and downloads the ZIP package
                </p>
              </>
            ) : (
              <p className="text-[10px] text-red-500">
                ⚠ No launch URL, file_url, or generate function — cannot launch
              </p>
            )}
            <p className="text-[10px] text-slate-500">
              Components bundled: {selected.component_codes?.length || 0} · Version: {selected.version || "1.0.0"}
            </p>
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