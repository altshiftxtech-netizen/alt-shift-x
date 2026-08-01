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

        <Button onClick={renderSet} disabled={rendering || files.length < 2} className="w-full bg-[#D4AF37] hover:bg-[#e6c454] text-black font-bold gap-2">
          {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
          {rendering ? "Rendering Set…" : "Render Document Set"}
        </Button>
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
      </CardContent>
    </Card>
  );
}