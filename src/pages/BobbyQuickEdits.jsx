import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, Upload, Wand2, Sparkles, FileText, CheckCircle2, Bot } from "lucide-react";
import CleanDocRenderer from "@/components/bobby/CleanDocRenderer";
import BobbyDocSetRenderer from "@/components/bobby/BobbyDocSetRenderer";
import BobbyTopBar from "@/components/bobby/BobbyTopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const BOBBY_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/5af913bb7_Copilot_20260801_162657.png";

const DOC_TYPES = ["Concept Paper", "Enterprise Valuation", "Pitch Deck", "Technical Spec", "Legal Brief", "Operations Plan"];
const TONES = ["Formal", "Technical", "Persuasive", "Concise"];
const LENGTHS = ["Brief", "Standard", "Detailed"];
const AUDIENCES = ["Internal", "Investor", "Technical", "Legal"];
const DATABASES = ["none", "mongodb", "postgresql", "mysql", "sqlite", "supabase", "redis"];
const FORMATS = ["Markdown", "Plain Text", "JSON"];
const SECTIONS = ["Executive Summary", "Market Analysis", "Financials", "Risk Assessment", "Roadmap", "Team", "IP & Valuation", "Appendices"];

const selectCls = "w-full bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50";
const pillCls = (active) =>
  `px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
    active ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-white/5 text-white/60 border-white/10 hover:border-[#D4AF37]/40"
  }`;
const labelCls = "text-[10px] tracking-[0.2em] text-[#D4AF37]/70 mb-2 block";

// BobbyQuickEdits — gated via the "Quick Edits" button in the BOBby header.
// Left: a build form (checkboxes, toggles, sliders) + prompt that generates a
// document via BOBby. Right: document upload → Claire 1.0 analysis (Apply
// initiates extraction). Documents are updated ONLY after the operator directs
// Claire on what to do.
export default function BobbyQuickEdits() {
  const [cfg, setCfg] = useState({
    docType: "Concept Paper",
    tone: "Formal",
    length: "Standard",
    audience: "Investor",
    sections: ["Executive Summary", "Market Analysis", "Financials", "Roadmap"],
    hallucinationGuard: true,
    auditLogging: true,
    confidence: 0.85,
    database: "none",
    format: "Markdown",
    autoGenerate: true,
    includeEsi: true,
    language: "English",
  });
  const [prompt, setPrompt] = useState("");
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [generating, setGenerating] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [applying, setApplying] = useState(false);
  const [direction, setDirection] = useState("");
  const [updating, setUpdating] = useState(false);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const toggleSection = (s) =>
    setCfg((c) => ({
      ...c,
      sections: c.sections.includes(s) ? c.sections.filter((x) => x !== s) : [...c.sections, s],
    }));

  const generate = async () => {
    setGenerating(true);
    try {
      const sys =
        `You are BOBby's document generator on the Sovereign Substrate. Generate a professional ${cfg.docType}. ` +
        `Tone: ${cfg.tone}. Length: ${cfg.length}. Audience: ${cfg.audience}. ` +
        `Sections to include: ${cfg.sections.join(", ") || "standard"}. ` +
        `Output format: ${cfg.format}. Language: ${cfg.language}.` +
        `${cfg.includeEsi ? " Append an ESI seal line at the end." : ""}` +
        `${cfg.hallucinationGuard ? " Apply a hallucination guard." : ""}` +
        `${cfg.auditLogging ? " Include an audit note." : ""}` +
        ` Confidence threshold: ${cfg.confidence}. Database context: ${cfg.database}.`;
      const userPrompt = prompt ? `\n\nOperator instructions: ${prompt}` : "";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${sys}${userPrompt}\n\nGenerate the full document now.`,
      });
      setGeneratedDoc(typeof res === "string" ? res : res?.output || JSON.stringify(res));
    } catch (e) {
      setGeneratedDoc("Generation failed: " + (e.message || "substrate error"));
    } finally {
      setGenerating(false);
    }
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    setExtracted(null);
    setAnalysis("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setUploadedFile({ name: f.name, url: file_url });
    } catch {
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Apply — initiates extraction + Claire 1.0 analysis of the uploaded document.
  const applyExtraction = async () => {
    if (!uploadedFile) return;
    setApplying(true);
    setExtracted(null);
    setAnalysis("");
    try {
      const schema = {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          entities: { type: "array", items: { type: "string" } },
          relevant_facts: { type: "array", items: { type: "string" } },
        },
      };
      const ex = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadedFile.url,
        json_schema: schema,
      });
      setExtracted(ex?.output || ex);
      const an = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are Claire 1.0, a document-analysis agent on the Sovereign Substrate. ` +
          `Analyze the uploaded document and produce a concise evaluation: what it contains, ` +
          `its relevance to a ${cfg.docType}, and how it could strengthen the build. Be specific and actionable.`,
        file_urls: [uploadedFile.url],
      });
      setAnalysis(typeof an === "string" ? an : an?.output || JSON.stringify(an));
    } catch (e) {
      setAnalysis("Analysis failed: " + (e.message || "substrate error"));
    } finally {
      setApplying(false);
    }
  };

  // Update documents — ONLY after the operator directs Claire on what to do.
  const updateDocuments = async () => {
    if (!direction.trim()) return;
    setUpdating(true);
    try {
      const merged = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are Claire 1.0. The operator directed: "${direction}". ` +
          `Using the extracted information and analysis, update/refine the following document accordingly. ` +
          `Return the full updated document.\n\nExtracted info: ${JSON.stringify(extracted)}\n\n` +
          `Analysis: ${analysis}\n\nCurrent document:\n${generatedDoc || "(none yet)"}`,
      });
      setGeneratedDoc(typeof merged === "string" ? merged : merged?.output || JSON.stringify(merged));
      setDirection("");
    } catch (e) {
      setGeneratedDoc("Update failed: " + (e.message || "substrate error"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 20% 30%, rgba(212,175,55,0.5) 0, transparent 60%), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.35) 0, transparent 60%)",
          }}
        />
      </div>

      <BobbyTopBar />
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[#D4AF37]/20 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <img src={BOBBY_LOGO} alt="BOBby" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-black text-white leading-tight truncate">
              Quick Edits <span className="text-[#D4AF37]">· Claire 1.0</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-white/40 hidden sm:block">RAPID BUILD · DOCUMENT ANALYSIS</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 gap-1.5 text-xs">
          <Link to="/builder/bobby"><ArrowLeft className="w-3.5 h-3.5" /> Back to BOBby</Link>
        </Button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-2 gap-4">
        {/* ── Build Form ── */}
        <Card className="bg-white/[0.03] border-[#D4AF37]/20 backdrop-blur-md">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white">Build Form</h2>
              <span className="ml-auto text-[10px] text-white/40">edit · toggle · generate</span>
            </div>

            <div>
              <span className={labelCls}>DOCUMENT TYPE</span>
              <select value={cfg.docType} onChange={(e) => set("docType", e.target.value)} className={selectCls}>
                {DOC_TYPES.map((t) => <option key={t} value={t} className="bg-black">{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={labelCls}>TONE</span>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((t) => <button key={t} onClick={() => set("tone", t)} className={pillCls(cfg.tone === t)}>{t}</button>)}
                </div>
              </div>
              <div>
                <span className={labelCls}>LENGTH</span>
                <div className="flex flex-wrap gap-1.5">
                  {LENGTHS.map((t) => <button key={t} onClick={() => set("length", t)} className={pillCls(cfg.length === t)}>{t}</button>)}
                </div>
              </div>
            </div>

            <div>
              <span className={labelCls}>AUDIENCE</span>
              <div className="flex flex-wrap gap-1.5">
                {AUDIENCES.map((t) => <button key={t} onClick={() => set("audience", t)} className={pillCls(cfg.audience === t)}>{t}</button>)}
              </div>
            </div>

            <div>
              <span className={labelCls}>SECTIONS TO INCLUDE</span>
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <Checkbox checked={cfg.sections.includes(s)} onCheckedChange={() => toggleSection(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={labelCls}>DATABASE</span>
                <select value={cfg.database} onChange={(e) => set("database", e.target.value)} className={selectCls}>
                  {DATABASES.map((t) => <option key={t} value={t} className="bg-black">{t}</option>)}
                </select>
              </div>
              <div>
                <span className={labelCls}>OUTPUT FORMAT</span>
                <select value={cfg.format} onChange={(e) => set("format", e.target.value)} className={selectCls}>
                  {FORMATS.map((t) => <option key={t} value={t} className="bg-black">{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <span className={labelCls}>CONFIDENCE THRESHOLD — {cfg.confidence.toFixed(2)}</span>
              <Slider value={[cfg.confidence]} min={0.5} max={0.99} step={0.01} onValueChange={(v) => set("confidence", v[0])} className="mt-3" />
            </div>

            <div className="space-y-2.5">
              {[
                { k: "hallucinationGuard", label: "Hallucination Guard" },
                { k: "auditLogging", label: "Audit Logging" },
                { k: "autoGenerate", label: "Auto-Generate Sections" },
                { k: "includeEsi", label: "Include ESI Seal" },
              ].map(({ k, label }) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{label}</span>
                  <Switch checked={cfg[k]} onCheckedChange={(v) => set(k, v)} />
                </div>
              ))}
            </div>

            <div>
              <span className={labelCls}>LANGUAGE</span>
              <Input value={cfg.language} onChange={(e) => set("language", e.target.value)} className="bg-white/5 border-[#D4AF37]/20 text-white text-xs" />
            </div>

            <div>
              <span className={labelCls}>PROMPT / INSTRUCTIONS</span>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Direct the build — e.g. 'Emphasize the IP moat and 10-year ARR ramp…'"
                className="bg-white/5 border-[#D4AF37]/20 text-white text-xs placeholder-white/30 resize-none"
              />
            </div>

            <Button onClick={generate} disabled={generating} className="w-full bg-[#D4AF37] hover:bg-[#e6c454] text-black font-bold gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating…" : "Generate Document"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Document Upload & Claire 1.0 Analysis ── */}
        <Card className="bg-white/[0.03] border-[#D4AF37]/20 backdrop-blur-md">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white">Document Analysis</h2>
              <span className="ml-auto text-[10px] text-white/40">Claire 1.0</span>
            </div>

            <div>
              <span className={labelCls}>UPLOAD DOCUMENT FOR ANALYSIS</span>
              <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#D4AF37]/30 rounded-xl py-6 cursor-pointer hover:bg-[#D4AF37]/5 transition-colors">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /> : <Upload className="w-5 h-5 text-[#D4AF37]" />}
                <span className="text-xs text-white/60">{uploadedFile ? uploadedFile.name : "Click to upload (PDF, DOCX, TXT, MD)"}</span>
                <input type="file" className="hidden" onChange={onFile} accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx" />
              </label>
            </div>

            <Button onClick={applyExtraction} disabled={!uploadedFile || applying} className="w-full bg-white/10 hover:bg-white/15 text-white border border-[#D4AF37]/30 gap-2">
              {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {applying ? "Extracting…" : "Apply"}
            </Button>
            <p className="text-[10px] text-white/40 -mt-3">Apply initiates extraction &amp; Claire 1.0 evaluation of the uploaded document.</p>

            {extracted && (
              <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] tracking-widest text-[#D4AF37]/80">EXTRACTED</span>
                </div>
                <pre className="text-[11px] text-white/60 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">{JSON.stringify(extracted, null, 2)}</pre>
              </div>
            )}

            {analysis && (
              <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] tracking-widest text-[#D4AF37]/80">CLAIRE 1.0 — EVALUATION</span>
                </div>
                <p className="text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed">{analysis}</p>
              </div>
            )}

            {(extracted || analysis) && (
              <div>
                <span className={labelCls}>DIRECT CLAIRE — WHAT TO DO WITH THIS</span>
                <Textarea
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  rows={2}
                  placeholder="e.g. 'Merge the financials into the generated document and tighten the risk section.'"
                  className="bg-white/5 border-[#D4AF37]/20 text-white text-xs placeholder-white/30 resize-none"
                />
                <Button onClick={updateDocuments} disabled={!direction.trim() || updating} className="w-full mt-2 bg-[#D4AF37] hover:bg-[#e6c454] text-black font-bold gap-2">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {updating ? "Updating…" : "Update Documents"}
                </Button>
                <p className="text-[10px] text-white/40 mt-1">Documents are updated only after you direct Claire.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Generated Document Preview ── */}
        <Card className="lg:col-span-2 bg-white/[0.03] border-[#D4AF37]/20 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-white">Generated Document</h2>
            </div>
            {generatedDoc ? (
              <div className="max-h-[60vh] overflow-y-auto bg-black/40 rounded-lg p-4 border border-white/5">
                <CleanDocRenderer content={generatedDoc} />
              </div>
            ) : (
              <p className="text-xs text-white/40 py-10 text-center">Configure the form and hit “Generate Document”, or upload + Apply to have Claire 1.0 feed the build.</p>
            )}
          </CardContent>
        </Card>

        {/* ── Render Past Document Set (ESI woven through) ── */}
        <BobbyDocSetRenderer />
      </main>
    </div>
  );
}