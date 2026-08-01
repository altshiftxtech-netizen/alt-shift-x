import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Layers, ShieldCheck, FileText, X } from "lucide-react";
import CleanDocRenderer from "@/components/bobby/CleanDocRenderer";

const labelCls = "text-[10px] tracking-[0.2em] text-[#D4AF37]/70 mb-2 block";

// BobbyDocSetRenderer — upload a set of past documents, BOBby consolidates
// them into a single rendered document set with the ESI seal woven through
// every section. Clean rendering (tables/graphs, no emojis) via CleanDocRenderer.
export default function BobbyDocSetRenderer() {
  const [files, setFiles] = useState([]);
  const [rendering, setRendering] = useState(false);
  const [docSet, setDocSet] = useState(null);
  const [error, setError] = useState("");
  const [certifying, setCertifying] = useState(false);
  const [certification, setCertification] = useState(null);

  const onPick = async (e) => {
    const picked = [...(e.target.files || [])];
    if (!picked.length) return;
    setError("");
    const uploaded = await Promise.all(
      picked.map(async (f) => {
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
          return { name: f.name, url: file_url };
        } catch {
          return null;
        }
      })
    );
    setFiles((prev) => [...prev, ...uploaded.filter(Boolean)]);
    e.target.value = "";
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  // SHA-256 ESI seal (woven through every section).
  const computeSeal = async (text) => {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return "ESI-" + Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return "ESI-" + Date.now().toString(16);
    }
  };

  const renderSet = async () => {
    if (files.length < 2) {
      setError("Upload at least 2 past documents to render a consolidated set.");
      return;
    }
    setRendering(true);
    setError("");
    setDocSet(null);
    try {
      const schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                heading: { type: "string" },
                body: { type: "string", description: "Markdown. May use GFM tables and ```chart-bar blocks." },
              },
              required: ["heading", "body"],
            },
          },
        },
        required: ["title", "subtitle", "sections"],
      };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are BOBby, the Build Yielder on the Sovereign Substrate. Consolidate the uploaded past documents into ONE coherent document set. " +
          "Synthesize across them — do not just concatenate. Produce clean sections (use GFM tables where useful, and ```chart-bar blocks for numeric trends). " +
          "Do NOT include emojis anywhere. Each section body should weave in the ESI seal line: 'ESI-SEAL woven through this section.' Return the consolidated set.",
        file_urls: files.map((f) => f.url),
        response_json_schema: schema,
      });
      const set = res?.output || res;
      // Weave ESI seal through every section + compute a set-level seal.
      const sealText = set.sections.map((s) => s.heading + s.body).join("|") + "|" + set.title;
      const esiSeal = await computeSeal(sealText);
      const sealed = {
        title: set.title || "Consolidated Document Set",
        subtitle: set.subtitle || "Rendered by BOBby · ESI woven through",
        esiSeal,
        sections: (set.sections || []).map((s) => ({
          heading: s.heading,
          body: `${s.body}\n\n> ESI-SEAL: ${esiSeal} — woven through this section by BOBby.`,
        })),
      };
      setDocSet(sealed);
    } catch (e) {
      setError("Render failed: " + (e.message || "substrate error"));
    } finally {
      setRendering(false);
    }
  };

  // Forensic certification — extract original timestamps + historical ESI from
  // the uploaded past document set to certify authenticity as a Sovereign Record.
  const certifyRecord = async () => {
    if (files.length < 1) {
      setError("Upload at least 1 past document to certify.");
      return;
    }
    setCertifying(true);
    setError("");
    setCertification(null);
    try {
      const schema = {
        type: "object",
        properties: {
          originalityTimestamp: { type: "string", description: "Earliest original timestamp extracted from the evidence (ISO date, e.g. 2026-07-15)" },
          historicalEsi: { type: "number", description: "Historical ESI (Environment-Sovereign-Index) marker extracted from the evidence, 0-100" },
          authenticityStatus: { type: "string", enum: ["certified", "partial", "contested"] },
          evidenceItems: {
            type: "array",
            items: {
              type: "object",
              properties: {
                document: { type: "string" },
                timestamp: { type: "string" },
                esiMarker: { type: "string" },
              },
            },
          },
          summary: { type: "string" },
        },
        required: ["originalityTimestamp", "historicalEsi", "authenticityStatus", "summary"],
      };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are BOBby, the forensic certifier on the Sovereign Substrate. From the uploaded past document set, extract the ORIGINAL timestamps (earliest creation/signature/filing dates) and any historical ESI (Environment-Sovereign-Index) markers present in the evidence. Certify the authenticity of the history — this transforms the history into a certified Sovereign Record. Return the originality timestamp, historical ESI score, authenticity status, per-document evidence items, and a one-paragraph summary. Do NOT use emojis.",
        file_urls: files.map((f) => f.url),
        response_json_schema: schema,
      });
      const cert = res?.output || res;
      const sealText = (cert.originalityTimestamp || "") + "|" + (cert.historicalEsi ?? "") + "|" + (cert.summary || "");
      const certSeal = await computeSeal(sealText);
      setCertification({ ...cert, certSeal });
    } catch (e) {
      setError("Certification failed: " + (e.message || "substrate error"));
    } finally {
      setCertifying(false);
    }
  };

  return (
    <Card className="bg-white/[0.03] border-[#D4AF37]/20 backdrop-blur-md">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-sm font-bold text-white">Render Past Document Set</h2>
          <span className="ml-auto text-[10px] text-white/40">BOBby · ESI woven through</span>
        </div>

        <div>
          <span className={labelCls}>UPLOAD PAST DOCUMENTS (2+)</span>
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#D4AF37]/30 rounded-xl py-5 cursor-pointer hover:bg-[#D4AF37]/5 transition-colors">
            <Upload className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs text-white/60">Add PDFs, DOCX, TXT, MD</span>
            <input type="file" multiple className="hidden" onChange={onPick} accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx" />
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5">
                <FileText className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="text-xs text-white/70 truncate flex-1">{f.name}</span>
                <button onClick={() => removeFile(i)} className="text-white/30 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={renderSet} disabled={rendering || files.length < 2} className="flex-1 bg-[#D4AF37] hover:bg-[#e6c454] text-black font-bold gap-2">
            {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            {rendering ? "Rendering…" : "Render Document Set"}
          </Button>
          <Button onClick={certifyRecord} disabled={certifying || files.length < 1} variant="outline" className="flex-1 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 gap-2">
            {certifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {certifying ? "Certifying…" : "Certify Sovereign Record"}
          </Button>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}

        {docSet && (
          <div className="space-y-5 mt-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="text-[10px] tracking-widest text-[#D4AF37]/80">ESI-SEAL</span>
              <code className="text-[10px] text-white/60 truncate font-mono">{docSet.esiSeal}</code>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{docSet.title}</h3>
              <p className="text-xs text-[#D4AF37]/80 mb-3">{docSet.subtitle}</p>
              <div className="h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent mb-4" />
              <div className="space-y-6">
                {docSet.sections.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-mono text-[#D4AF37]/60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <h4 className="text-base font-bold text-white">{s.heading}</h4>
                    </div>
                    <CleanDocRenderer content={s.body} className="pl-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {certification && (
          <div className="mt-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.04] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-bold text-white">Certified Sovereign Record</h3>
              <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full ${certification.authenticityStatus === "certified" ? "bg-emerald-500/15 text-emerald-400" : certification.authenticityStatus === "contested" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                {String(certification.authenticityStatus || "").toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                <p className="text-[10px] text-[#D4AF37]/60 tracking-widest">ORIGINALITY TIMESTAMP</p>
                <p className="text-white font-mono">{certification.originalityTimestamp || "—"}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                <p className="text-[10px] text-[#D4AF37]/60 tracking-widest">HISTORICAL ESI</p>
                <p className="text-white font-mono">{certification.historicalEsi ?? "—"}%</p>
              </div>
            </div>
            {certification.evidenceItems?.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-xs">
                  <thead><tr className="bg-[#D4AF37]/10 text-[#D4AF37]"><th className="px-3 py-1.5 text-left">Document</th><th className="px-3 py-1.5 text-left">Timestamp</th><th className="px-3 py-1.5 text-left">ESI Marker</th></tr></thead>
                  <tbody>
                    {certification.evidenceItems.map((e, i) => (
                      <tr key={i} className="border-t border-white/10 text-white/70">
                        <td className="px-3 py-1.5">{e.document || "—"}</td>
                        <td className="px-3 py-1.5 font-mono">{e.timestamp || "—"}</td>
                        <td className="px-3 py-1.5 font-mono">{e.esiMarker || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <CleanDocRenderer content={certification.summary} />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/5">
              <span className="text-[10px] tracking-widest text-[#D4AF37]/80">CERTIFICATION SEAL</span>
              <code className="text-[10px] text-white/60 truncate font-mono">{certification.certSeal}</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}