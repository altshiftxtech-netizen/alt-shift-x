import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson, BadgePercent, CheckCircle2, AlertTriangle, Code2, GraduationCap } from "lucide-react";
import BobInitCapabilities from "./BobInitCapabilities";

// BobInitCodeMode — the "project.json" CODE mode. The operator writes the raw
// project.json that drives their PWA Agent Wrapper by hand. Every field is real
// build config, so authoring it teaches the structure of a hardened manifest.
// This is the learn-to-code path: building here unlocks the HALF-PRICE PWA fee.
const STARTER = `{
  "name": "Turki360",
  "version": "1.0.0",
  "type": "PWA_Agent_Wrapper",
  "stack": { "frontend": "Next.js", "middleware": "TypeScript", "backend": "Express.js", "proxy": "NGINX" },
  "connectivity": { "local_server": "enabled", "frontier_bridge": ["GPT-4o","Claude-3-Opus"], "registry": "altshiftx-private-core" },
  "features": ["Magna-Dev-Full-Access","Sovereign-Apex-Hardening","Self-Healing-API-Shims"],
  "branding": { "colorway": "Sovereign_Gold", "logo_url": "[PENDING_UPLOAD]" },
  "compliance": { "wv_retention_vault": "linked", "fragmentation_level": "K-of-N" }
}`;

export default function BobInitCodeMode({ brand, setBrand, docs, setDocs, onSubmit }) {
  const [raw, setRaw] = useState(STARTER);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [check, setCheck] = useState(null);

  const validate = () => {
    try {
      const p = JSON.parse(raw);
      setError(null);
      setParsed(p);
      return p;
    } catch (e) {
      setError(e.message);
      setParsed(null);
      return null;
    }
  };

  const runCheck = () => {
    const p = validate();
    if (!p) { setCheck({ ok: false, issues: ["Invalid JSON — fix the syntax errors first."] }); return; }
    const issues = [];
    if (!p.name) issues.push("Missing: name");
    if (!p.stack?.frontend) issues.push("Missing: stack.frontend");
    if (!p.stack?.backend) issues.push("Missing: stack.backend");
    if (!Array.isArray(p.features) || !p.features.length) issues.push("Missing: features[] — the shell would be inert");
    if (!p.connectivity?.frontier_bridge?.length) issues.push("Missing: connectivity.frontier_bridge — agent has no model");
    setCheck({ ok: issues.length === 0, issues });
  };

  const initialize = () => {
    const p = validate();
    if (!p) return;
    const docFiles = Object.values(docs || {}).filter(Boolean);
    onSubmit?.({ projectJson: p, docFiles, paragraph: "", mode: "projectjson" });
  };

  return (
    <Card className="border-[#3fb950]/30 bg-[#0d1117]">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <FileJson className="w-4 h-4 text-[#3fb950]" />
          <h3 className="text-sm font-bold text-white font-mono">project.json — Code Mode</h3>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full px-2 py-0.5">
            <BadgePercent className="w-3 h-3" /> Half-price PWA
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#8b949e] leading-relaxed">
            <span className="text-cyan-400 font-mono">Learn to code by writing it.</span> Type the raw project.json that drives your PWA Agent Wrapper. Every field you write is real build config — B.O.B. renders exactly what you author. Writing it yourself unlocks the half-price build.
          </p>
        </div>

        <div>
          <span className="text-[10px] tracking-[0.2em] text-[#3fb950]/70 mb-1.5 block">PROJECT.JSON SOURCE</span>
          <textarea
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setError(null); setParsed(null); }}
            rows={14}
            spellCheck={false}
            className="w-full bg-[#010409] border border-[#30363d] rounded-lg p-3 text-[11px] font-mono text-[#c9d1d9] focus:outline-none focus:border-[#3fb950]/60 resize-y"
          />
          {error && <p className="text-[10px] font-mono text-red-400 mt-1">✗ {error}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={validate} variant="outline" size="sm" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#3fb950] font-mono text-[11px] gap-1.5"><Code2 className="w-3 h-3" /> Parse JSON</Button>
          <Button onClick={runCheck} size="sm" variant="outline" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#3fb950] font-mono text-[11px] gap-1.5"><CheckCircle2 className="w-3 h-3" /> Functionality check</Button>
          {check && (check.ok
            ? <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3fb950]"><CheckCircle2 className="w-3.5 h-3.5" /> Operational</span>
            : <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> {check.issues.length} issue(s)</span>)}
        </div>
        {check && !check.ok && (
          <ul className="space-y-0.5 -mt-2">
            {check.issues.map((i, idx) => <li key={idx} className="text-[10px] font-mono text-amber-400/80">• {i}</li>)}
          </ul>
        )}

        <BobInitCapabilities brand={brand} setBrand={setBrand} docs={docs} setDocs={setDocs} projectJson={parsed} hidePreview />

        <Button onClick={initialize} className="w-full bg-[#3fb950] hover:bg-[#3fb950]/90 text-black font-bold font-mono gap-2">
          <FileJson className="w-4 h-4" /> Initialize Project — Half-Price
        </Button>
      </CardContent>
    </Card>
  );
}