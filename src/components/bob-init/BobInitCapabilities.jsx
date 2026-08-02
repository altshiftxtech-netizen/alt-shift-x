import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, FileText, CheckCircle2, Loader2, Copy, Eye, Image as ImageIcon, AlertTriangle } from "lucide-react";

// BobInitCapabilities — the shared "everything a mode needs" rail, used by ALL
// B.O.B.Init authoring modes (Command Prompt, project.json code, Text-to-Code).
// Every mode gets the same capabilities: brand mirroring (logo + colorway),
// reference document upload, and a copyable JSON preview of the assembled manifest.
const COLORWAYS = ["Generic_Office_Slate", "Sovereign_Gold", "Midnight", "Clean_White"];
const DOC_SLOTS = [
  { key: "concept", label: "Concept" },
  { key: "whitepaper", label: "White Paper" },
  { key: "valuation", label: "Valuation" },
  { key: "tenyear", label: "10-Year Plan" },
];

const labelCls = "text-[10px] tracking-[0.2em] text-[#3fb950]/70";
const inputCls = "w-full bg-[#010409] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#3fb950]/60 font-mono";

export default function BobInitCapabilities({ brand, setBrand, docs, setDocs, projectJson, hidePreview }) {
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const logoRef = useRef(null);
  const docRefs = useRef({});

  const uploadLogo = async (file) => {
    setLogoUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBrand((b) => ({ ...b, logoUrl: file_url }));
    } catch { /* ignore */ } finally {
      setLogoUploading(false);
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

  const previewText = projectJson
    ? (typeof projectJson === "string" ? projectJson : JSON.stringify(projectJson, null, 2))
    : "";

  const copyJson = async () => {
    if (!previewText) return;
    try {
      await navigator.clipboard.writeText(previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4 rounded-lg border border-[#30363d] bg-[#010409] p-3">
      {/* Brand mirror */}
      <div>
        <span className={`flex items-center gap-1.5 mb-2 ${labelCls}`}><ImageIcon className="w-3 h-3" /> BRAND MIRROR</span>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              {brand?.logoUrl && brand.logoUrl !== "[PENDING_UPLOAD]" ? (
                <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-2">
                  <img src={brand.logoUrl} alt="logo" className="w-5 h-5 rounded object-contain" />
                  <span className="text-[10px] font-mono text-[#c9d1d9] truncate flex-1">logo</span>
                  <button onClick={() => setBrand((b) => ({ ...b, logoUrl: "[PENDING_UPLOAD]" }))} className="text-[#8b949e] hover:text-white"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadLogo(f); }} />
                  <button type="button" onClick={() => logoRef.current?.click()} disabled={logoUploading} className="w-full flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] bg-[#0d1117] hover:bg-[#161b22] border border-dashed border-[#30363d] hover:border-[#3fb950]/50 px-2 py-2 rounded-lg disabled:opacity-50">
                    {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Upload logo
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5">
              <input type="color" value={brand?.colorHex || "#D4AF37"} onChange={(e) => setBrand((b) => ({ ...b, colorHex: e.target.value }))} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0" />
              <input type="text" value={brand?.colorHex || ""} onChange={(e) => setBrand((b) => ({ ...b, colorHex: e.target.value }))} placeholder="#D4AF37" className="flex-1 min-w-0 bg-transparent text-[10px] font-mono text-[#c9d1d9] focus:outline-none placeholder:text-[#484f58]" />
            </div>
          </div>
          <input type="url" value={brand?.url || ""} onChange={(e) => setBrand((b) => ({ ...b, url: e.target.value }))} placeholder="https://your-brand-url.com" className={inputCls} />
          <div className="flex items-start gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/5 px-2 py-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[9px] text-amber-400/80 font-mono leading-relaxed">
              Only upload material you are licensed to use. Do not mirror third-party brands, copyrighted logos, or trademarked assets without authorization. Unauthorized use is removed and may restrict your account.
            </p>
          </div>
        </div>
      </div>

      {/* Reference documents */}
      <div>
        <span className={`flex items-center gap-1.5 mb-2 ${labelCls}`}><FileText className="w-3 h-3" /> REFERENCE DOCUMENTS</span>
        <div className="grid grid-cols-2 gap-2">
          {DOC_SLOTS.map((s) => {
            const doc = docs?.[s.key];
            return (
              <div key={s.key}>
                {doc ? (
                  <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-2">
                    <FileText className="w-3 h-3 text-[#3fb950] shrink-0" />
                    <span className="text-[10px] font-mono text-[#c9d1d9] truncate flex-1">{doc.name}</span>
                    <button onClick={() => setDocs((d) => { const n = { ...d }; delete n[s.key]; return n; })} className="text-[#8b949e] hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <>
                    <input ref={(el) => (docRefs.current[s.key] = el)} type="file" accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadDoc(s.key, f); }} />
                    <button type="button" onClick={() => docRefs.current[s.key]?.click()} disabled={uploadingKey === s.key} className="w-full flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] bg-[#0d1117] hover:bg-[#161b22] border border-dashed border-[#30363d] hover:border-[#3fb950]/50 px-2 py-2 rounded-lg disabled:opacity-50">
                      {uploadingKey === s.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} {s.label}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Copyable JSON preview — hidden in code mode (the raw JSON is the source) */}
      {!hidePreview && (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`flex items-center gap-1.5 ${labelCls}`}><Eye className="w-3 h-3" /> JSON PREVIEW</span>
          <button type="button" onClick={copyJson} disabled={!previewText} className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8b949e] hover:text-[#3fb950] disabled:opacity-40">
            {copied ? <><CheckCircle2 className="w-3 h-3 text-[#3fb950]" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
        <pre className="text-[10px] font-mono text-[#8b949e] bg-[#0d1117] border border-[#30363d] rounded-lg p-3 max-h-44 overflow-auto whitespace-pre-wrap break-words min-h-[3rem]">
          {previewText || <span className="text-[#484f58]">// initialize a project to preview the manifest</span>}
        </pre>
      </div>
      )}
    </div>
  );
}