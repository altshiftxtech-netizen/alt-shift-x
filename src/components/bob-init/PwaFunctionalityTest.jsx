import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, ChevronDown, CheckCircle2, XCircle, Loader2, Play } from "lucide-react";

// PwaFunctionalityTest — a collapsible pre-build test card available in EVERY
// B.O.B.Init authoring mode. Runs a client-side sanity scan against the current
// build config so the operator can verify the PWA Agent Wrapper will function
// before paying for the render. No sandbox — just a static pass/fail report.
export default function PwaFunctionalityTest({ stackConfig, hardening, brand, database }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const checks = [
    { label: "Project initialized", pass: !!stackConfig, detail: stackConfig ? `${stackConfig.stack || "custom"} stack ready` : "No project initialized yet" },
    { label: "Stack defined", pass: !!(stackConfig?.stack || stackConfig?.projectJson?.stack?.frontend), detail: stackConfig?.projectJson?.stack?.frontend || stackConfig?.stack || "—" },
    { label: "Features / capabilities present", pass: !!((stackConfig?.projectJson?.features?.length) || stackConfig?.stack), detail: stackConfig?.projectJson?.features?.length ? `${stackConfig.projectJson.features.length} feature(s)` : "default shell features" },
    { label: "Frontier bridge (agent model) set", pass: !!(stackConfig?.projectJson?.connectivity?.frontier_bridge?.length), detail: stackConfig?.projectJson?.connectivity?.frontier_bridge?.join(", ") || "not configured" },
    { label: "Brand color applied", pass: !!(brand?.colorHex), detail: brand?.colorHex || "no color selected" },
    { label: "Brand URL provided", pass: !!(brand?.url), detail: brand?.url || "no url set" },
    { label: "110% Hardening enabled", pass: !!(hardening?.hallucination_guard), detail: hardening?.hallucination_guard ? "fail-closed guard active" : "hardening off" },
    { label: "Database selected", pass: !!(database || stackConfig?.projectJson?.connectivity?.local_server), detail: database || stackConfig?.projectJson?.connectivity?.local_server || "none" },
  ];

  const runTest = () => {
    setRunning(true);
    setResults(null);
    setTimeout(() => { setResults(checks); setRunning(false); }, 700);
  };

  const passed = results ? results.filter((c) => c.pass).length : 0;
  const total = checks.length;

  return (
    <Card className="border-[#30363d] bg-[#0d1117]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-2 px-4 pt-4 pb-3 text-left">
        <FlaskConical className="w-4 h-4 text-cyan-400" />
        <h3 className="flex-1 text-xs font-mono text-[#8b949e] uppercase tracking-wider">PWA Functionality Test</h3>
        {results && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${passed === total ? "text-[#3fb950] bg-[#3fb950]/10" : "text-amber-400 bg-amber-400/10"}`}>
            {passed}/{total} passed
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-[#484f58] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <CardContent className="pt-0 pb-4 space-y-3">
          <p className="text-[11px] text-[#8b949e] font-mono leading-relaxed">
            Run a static functionality scan of your PWA Agent Wrapper <span className="text-[#3fb950]">before</span> you build. This checks your config — no sandbox, no live pages, just a pass/fail report so you catch gaps early.
          </p>
          <Button onClick={runTest} disabled={running} size="sm" className="bg-[#3fb950] hover:bg-[#3fb950]/90 text-black font-bold font-mono text-[11px] gap-1.5">
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} {running ? "Running test..." : "Run functionality test"}
          </Button>
          {results && (
            <ul className="space-y-1">
              {results.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] font-mono">
                  {c.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950] mt-0.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />}
                  <span className="text-[#c9d1d9]">{c.label}</span>
                  <span className="text-[#484f58] ml-auto truncate max-w-[45%]">{c.detail}</span>
                </li>
              ))}
            </ul>
          )}
          {results && passed === total && (
            <div className="rounded-md bg-[#3fb950]/10 border border-[#3fb950]/30 px-2.5 py-1.5 text-[11px] font-mono text-[#3fb950]">✓ All checks passed — your PWA is ready to build.</div>
          )}
          {results && passed < total && (
            <div className="rounded-md bg-amber-400/10 border border-amber-400/30 px-2.5 py-1.5 text-[11px] font-mono text-amber-400">{total - passed} check(s) failed — fix the gaps above, then re-run.</div>
          )}
        </CardContent>
      )}
    </Card>
  );
}