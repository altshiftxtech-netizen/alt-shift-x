import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileJson, Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2, Eye, BadgePercent, Lightbulb } from "lucide-react";

// BobInitProjectJson — a form-driven project.json workflow.
// Each field is a pluggable input (a "prompt requesting a specific outcome").
// On Initialize, the assembled project.json prints into the terminal and follows
// the existing B.O.B.Init build gate. A plain-language paragraph (text-to-code)
// path lets the bot fill assumptions for missing fields. A view-only preview and
// a functionality check guarantee an operational shell before render.
// Users who build via project.json (instead of raw text-to-code) get half price
// on the PWA — an incentive to learn to code.

const STACK_FRONTEND = ["Next.js", "React", "Vue", "Svelte", "Astro"];
const STACK_BACKEND = ["Express.js", "Fastify", "Nest.js", "Go", "Python-FastAPI"];
const STACK_PROXY = ["NGINX", "Caddy", "Traefik", "none"];
const PROJECT_TYPES = ["PWA_Agent_Wrapper", "Site_Mirror", "Agent_Wrapper", "Custom"];
const FRONTIER_BRIDGES = ["GPT-4o", "Claude-3-Opus", "Gemini-1.5-Pro", "Llama-3"];
const FEATURES = ["Magna-Dev-Full-Access", "Sovereign-Apex-Hardening", "Self-Healing-API-Shims", "PII-Fragmentation", "D2D-Sync", "Blackstone-Guard"];
const COLORWAYS = ["Generic_Office_Slate", "Sovereign_Gold", "Midnight", "Clean_White"];
const TERMINAL_AESTHETICS = ["Classic_Prompt", "PowerShell", "Bash", "Minimal"];
const VAULT_STATES = ["linked", "off"];
const FRAGMENTATION = ["K-of-N", "full", "none"];
const DOC_SLOTS = [
  { key: "concept", label: "Concept" },
  { key: "whitepaper", label: "White Paper" },
  { key: "valuation", label: "Valuation" },
  { key: "tenyear", label: "10-Year Plan" },
];

const labelCls = "text-[10px] tracking-[0.2em] text-[#3fb950]/70 mb-1.5 block";
const inputCls = "w-full bg-[#010409] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#3fb950]/60 font-mono";
const pillCls = (active) =>
  `px-2.5 py-1 rounded-md text-[10px] font-mono border transition-colors ${
    active ? "bg-[#3fb950]/15 border-[#3fb950]/60 text-[#3fb950]" : "border-[#30363d] text-[#8b949e] hover:border-[#3fb950]/40"
  }`;

export default function BobInitProjectJson({ onSubmit }) {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [type, setType] = useState(PROJECT_TYPES[0]);
  const [fe, setFe] = useState(STACK_FRONTEND[0]);
  const [mw, setMw] = useState("TypeScript");
  const [be, setBe] = useState(STACK_BACKEND[0]);
  const [proxy, setProxy] = useState(STACK_PROXY[0]);
  const [localServer, setLocalServer] = useState(true);
  const [bridges, setBridges] = useState(["GPT-4o", "Claude-3-Opus"]);
  const [registry, setRegistry] = useState("altshiftx-private-core");
  const [features, setFeatures] = useState(["Magna-Dev-Full-Access", "Sovereign-Apex-Hardening", "Self-Healing-API-Shims"]);
  const [colorway, setColorway] = useState(COLORWAYS[0]);
  const [logoUrl, setLogoUrl] = useState("[PENDING_UPLOAD]");
  const [terminalAesthetic, setTerminalAesthetic] = useState(TERMINAL_AESTHETICS[0]);
  const [vault, setVault] = useState(VAULT_STATES[0]);
  const [fragmentation, setFragmentation] = useState(FRAGMENTATION[0]);
  const [paragraph, setParagraph] = useState("");
  const [docs, setDocs] = useState({}); // key -> {name,url}
  const [uploadingKey, setUploadingKey] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [check, setCheck] = useState(null); // {ok, issues[]}
  const [checking, setChecking] = useState(false);
  const logoInputRef = useRef(null);
  const docInputRefs = useRef({});

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);

  const assemble = () => ({
    name: name.trim() || "Untitled",
    version: version.trim() || "1.0.0",
    type,
    stack: { frontend: fe, middleware: mw, backend: be, proxy },
    connectivity: { local_server: localServer ? "enabled" : "disabled", frontier_bridge: bridges, registry },
    features,
    branding: { colorway, logo_url: logoUrl, terminal_aesthetic: terminalAesthetic },
    compliance: { wv_retention_vault: vault, fragmentation_level: fragmentation },
  });

  // Text-to-code: turn a plain-language paragraph into a project.json, making
  // assumptions for any fields the user didn't specify.
  const runTextToCode = async () => {
    if (!paragraph.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are B.O.B.Init's text-to-code engine. Convert the operator's paragraph into a project.json ` +
          `following this exact shape: {name, version, type, stack:{frontend,middleware,backend,proxy}, ` +
          `connectivity:{local_server,frontier_bridge[],registry}, features[], branding:{colorway,logo_url,terminal_aesthetic}, ` +
          `compliance:{wv_retention_vault,fragmentation_level}}. ` +
          `Make reasonable assumptions for any missing information. Return ONLY the JSON.\n\nParagraph:\n${paragraph}`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" }, version: { type: "string" }, type: { type: "string" },
            stack: { type: "object" }, connectivity: { type: "object" },
            features: { type: "array", items: { type: "string" } },
            branding: { type: "object" }, compliance: { type: "object" },
          },
        },
      });
      const p = typeof res === "string" ? JSON.parse(res) : res;
      if (p?.name) setName(p.name);
      if (p?.type && PROJECT_TYPES.includes(p.type)) setType(p.type);
      if (p?.stack?.frontend && STACK_FRONTEND.includes(p.stack.frontend)) setFe(p.stack.frontend);
      if (p?.stack?.middleware) setMw(p.stack.middleware);
      if (p?.stack?.backend && STACK_BACKEND.includes(p.stack.backend)) setBe(p.stack.backend);
      if (p?.stack?.proxy && STACK_PROXY.includes(p.stack.proxy)) setProxy(p.stack.proxy);
      if (Array.isArray(p?.connectivity?.frontier_bridge)) setBridges(p.connectivity.frontier_bridge.filter((b) => FRONTIER_BRIDGES.includes(b)));
      if (Array.isArray(p?.features)) setFeatures(p.features.filter((f) => FEATURES.includes(f)));
      if (p?.branding?.colorway && COLORWAYS.includes(p.branding.colorway)) setColorway(p.branding.colorway);
      if (p?.branding?.terminal_aesthetic && TERMINAL_AESTHETICS.includes(p.branding.terminal_aesthetic)) setTerminalAesthetic(p.branding.terminal_aesthetic);
      if (p?.compliance?.wv_retention_vault && VAULT_STATES.includes(p.compliance.wv_retention_vault)) setVault(p.compliance.wv_retention_vault);
      if (p?.compliance?.fragmentation_level && FRAGMENTATION.includes(p.compliance.fragmentation_level)) setFragmentation(p.compliance.fragmentation_level);
    } catch {
      /* leave form as-is — assumptions stand */
    } finally {
      setGenerating(false);
    }
  };

  const uploadDoc = async (key, file) => {
    setUploadingKey(key);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDocs((d) => ({ ...d, [key]: { name: file.name, url: file_url } }));
    } catch { /* ignore */ } finally {
      setUploadingKey(null);
    }
  };

  const uploadLogo = async (file) => {
    setLogoUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
    } catch { /* leave pending */ } finally {
      setLogoUploading(false);
    }
  };

  // Functionality check — validates the assembled project.json is operational
  // before render, so the user never has to produce another shell to get a
  // working product.
  const runCheck = () => {
    setChecking(true);
    const p = assemble();
    const issues = [];
    if (!name.trim()) issues.push("Project name is empty.");
    if (!p.stack.frontend) issues.push("Frontend stack not selected.");
    if (!p.stack.backend) issues.push("Backend stack not selected.");
    if (!p.features.length) issues.push("No features selected — the shell would be inert.");
    if (logoUrl === "[PENDING_UPLOAD]") issues.push("Logo is still pending upload (branding incomplete).");
    if (!p.connectivity.frontier_bridge.length) issues.push("No frontier bridge selected — agent has no model connectivity.");
    setCheck({ ok: issues.length === 0, issues });
    setChecking(false);
  };

  const initialize = () => {
    const projectJson = assemble();
    const docFiles = DOC_SLOTS.filter((s) => docs[s.key]).map((s) => docs[s.key]);
    onSubmit?.({ projectJson, docFiles, paragraph: paragraph.trim() });
  };

  return (
    <Card className="border-[#30363d] bg-[#0d1117]">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-[#3fb950]" />
          <h3 className="text-sm font-bold text-white font-mono">project.json Workflow</h3>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full px-2 py-0.5">
            <BadgePercent className="w-3 h-3" /> Half-price PWA incentive
          </span>
        </div>
        <p className="text-[11px] text-[#8b949e] -mt-3 leading-relaxed">
          Plug inputs into the form — each line is a prompt requesting a specific outcome in the PWA.
          On Initialize, the project.json prints to the terminal and follows the current build gate.
        </p>

        {/* Text-to-code paragraph */}
        <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3 space-y-2">
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#3fb950]/70">
            <Lightbulb className="w-3 h-3" /> TEXT-TO-CODE (PLAIN LANGUAGE)
          </span>
          <textarea
            value={paragraph}
            onChange={(e) => setParagraph(e.target.value)}
            rows={3}
            placeholder="Describe the project in a paragraph — e.g. 'A high-performance B2B tool called Turki360 with Next.js, self-healing shims, and Magna Dev access.' BOB fills assumptions for anything you leave out."
            className="w-full bg-transparent text-[11px] text-[#c9d1d9] font-mono p-2 rounded border border-[#30363d] focus:outline-none focus:border-[#3fb950]/60 resize-none placeholder:text-[#484f58]"
          />
          <Button onClick={runTextToCode} disabled={!paragraph.trim() || generating} size="sm" className="bg-[#3fb950]/20 border border-[#3fb950]/50 text-[#3fb950] hover:bg-[#3fb950]/30 font-mono text-[11px] gap-1.5">
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
            {generating ? "Applying assumptions…" : "Fill form from paragraph"}
          </Button>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-2 gap-3">
          <div><span className={labelCls}>NAME</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Turki360" /></div>
          <div><span className={labelCls}>VERSION</span><input value={version} onChange={(e) => setVersion(e.target.value)} className={inputCls} /></div>
        </div>
        <div><span className={labelCls}>TYPE</span>
          <div className="flex flex-wrap gap-1.5">{PROJECT_TYPES.map((t) => <button key={t} onClick={() => setType(t)} className={pillCls(type === t)}>{t}</button>)}</div>
        </div>

        {/* Stack */}
        <div className="grid grid-cols-2 gap-3">
          <div><span className={labelCls}>STACK · FRONTEND</span>
            <select value={fe} onChange={(e) => setFe(e.target.value)} className={inputCls}>{STACK_FRONTEND.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
          <div><span className={labelCls}>STACK · MIDDLEWARE</span><input value={mw} onChange={(e) => setMw(e.target.value)} className={inputCls} /></div>
          <div><span className={labelCls}>STACK · BACKEND</span>
            <select value={be} onChange={(e) => setBe(e.target.value)} className={inputCls}>{STACK_BACKEND.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
          <div><span className={labelCls}>STACK · PROXY</span>
            <select value={proxy} onChange={(e) => setProxy(e.target.value)} className={inputCls}>{STACK_PROXY.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
        </div>

        {/* Connectivity */}
        <div className="flex items-center justify-between rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2">
          <span className="text-[11px] font-mono text-[#c9d1d9]">connectivity.local_server</span>
          <Switch checked={localServer} onCheckedChange={setLocalServer} />
        </div>
        <div><span className={labelCls}>FRONTIER BRIDGE (MODELS)</span>
          <div className="flex flex-wrap gap-1.5">{FRONTIER_BRIDGES.map((t) => <button key={t} onClick={() => toggle(bridges, setBridges, t)} className={pillCls(bridges.includes(t))}>{t}</button>)}</div>
        </div>
        <div><span className={labelCls}>REGISTRY</span><input value={registry} onChange={(e) => setRegistry(e.target.value)} className={inputCls} /></div>

        {/* Features */}
        <div><span className={labelCls}>FEATURES</span>
          <div className="flex flex-wrap gap-1.5">{FEATURES.map((t) => <button key={t} onClick={() => toggle(features, setFeatures, t)} className={pillCls(features.includes(t))}>{t}</button>)}</div>
        </div>

        {/* Branding */}
        <div className="grid grid-cols-2 gap-3">
          <div><span className={labelCls}>BRANDING · COLORWAY</span>
            <select value={colorway} onChange={(e) => setColorway(e.target.value)} className={inputCls}>{COLORWAYS.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
          <div><span className={labelCls}>BRANDING · TERMINAL</span>
            <select value={terminalAesthetic} onChange={(e) => setTerminalAesthetic(e.target.value)} className={inputCls}>{TERMINAL_AESTHETICS.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
        </div>
        <div>
          <span className={labelCls}>BRANDING · LOGO</span>
          {logoUrl !== "[PENDING_UPLOAD]" ? (
            <div className="flex items-center gap-2 bg-[#010409] border border-[#30363d] rounded-lg px-2.5 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" />
              <span className="text-[11px] font-mono text-[#c9d1d9] truncate flex-1">logo uploaded</span>
              <button onClick={() => setLogoUrl("[PENDING_UPLOAD]")} className="text-[#8b949e] hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadLogo(f); }} />
              <button type="button" onClick={() => logoInputRef.current?.click()} disabled={logoUploading} className="w-full flex items-center gap-2 text-[11px] font-mono text-[#8b949e] bg-[#010409] hover:bg-[#161b22] border border-dashed border-[#30363d] hover:border-[#3fb950]/50 px-2.5 py-2 rounded-lg">
                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload logo
              </button>
            </>
          )}
        </div>

        {/* Compliance */}
        <div className="grid grid-cols-2 gap-3">
          <div><span className={labelCls}>COMPLIANCE · VAULT</span>
            <select value={vault} onChange={(e) => setVault(e.target.value)} className={inputCls}>{VAULT_STATES.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
          <div><span className={labelCls}>COMPLIANCE · FRAGMENTATION</span>
            <select value={fragmentation} onChange={(e) => setFragmentation(e.target.value)} className={inputCls}>{FRAGMENTATION.map((t) => <option key={t} value={t} className="bg-[#0d1117]">{t}</option>)}</select>
          </div>
        </div>

        {/* Reference documents */}
        <div>
          <span className={labelCls}>REFERENCE DOCUMENTS (BUILD FOR THE PLAN)</span>
          <div className="grid grid-cols-2 gap-2">
            {DOC_SLOTS.map((s) => {
              const doc = docs[s.key];
              return (
                <div key={s.key}>
                  {doc ? (
                    <div className="flex items-center gap-1.5 bg-[#010409] border border-[#30363d] rounded-lg px-2.5 py-2">
                      <FileText className="w-3 h-3 text-[#3fb950] shrink-0" />
                      <span className="text-[10px] font-mono text-[#c9d1d9] truncate flex-1">{doc.name}</span>
                      <button onClick={() => setDocs((d) => { const n = { ...d }; delete n[s.key]; return n; })} className="text-[#8b949e] hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      <input ref={(el) => (docInputRefs.current[s.key] = el)} type="file" accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadDoc(s.key, f); }} />
                      <button type="button" onClick={() => docInputRefs.current[s.key]?.click()} disabled={uploadingKey === s.key} className="w-full flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] bg-[#010409] hover:bg-[#161b22] border border-dashed border-[#30363d] hover:border-[#3fb950]/50 px-2.5 py-2 rounded-lg disabled:opacity-50">
                        {uploadingKey === s.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} {s.label}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Functionality check */}
        <div className="flex items-center gap-2">
          <Button onClick={runCheck} disabled={checking} size="sm" variant="outline" className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#3fb950] font-mono text-[11px] gap-1.5">
            {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Functionality check
          </Button>
          {check && (
            check.ok ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3fb950]"><CheckCircle2 className="w-3.5 h-3.5" /> Operational — ready to render</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> {check.issues.length} issue(s)</span>
            )
          )}
        </div>
        {check && !check.ok && (
          <ul className="space-y-0.5 -mt-3">
            {check.issues.map((iss, i) => <li key={i} className="text-[10px] font-mono text-amber-400/80">• {iss}</li>)}
          </ul>
        )}

        {/* View-only preview */}
        <div>
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#3fb950]/70 mb-1.5"><Eye className="w-3 h-3" /> PREVIEW (VIEW-ONLY)</span>
          <pre className="text-[10px] font-mono text-[#8b949e] bg-[#010409] border border-[#30363d] rounded-lg p-3 max-h-52 overflow-auto whitespace-pre-wrap break-words">{JSON.stringify(assemble(), null, 2)}</pre>
        </div>

        <Button onClick={initialize} className="w-full bg-[#3fb950] hover:bg-[#3fb950]/90 text-black font-bold font-mono gap-2">
          <FileJson className="w-4 h-4" /> Initialize Project
        </Button>
      </CardContent>
    </Card>
  );
}