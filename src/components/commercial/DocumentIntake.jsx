import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { extractDocText, isDocFile } from "@/lib/extractDocText";
import { Loader2, Upload, FileText, Wand2, X, Check } from "lucide-react";

// One upload slot. Defined at module level (not inside DocumentIntake) so the
// file <input> keeps a stable identity across re-renders — re-creating it on
// every render remounts the input mid-selection and drops the upload.
function FileRow({ label, file, onPick, onClear, inputRef, hint, uploading }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-amber-200/60 block mb-1.5">{label}</label>
      {file ? (
        <div className="flex items-center gap-2 bg-black/40 border border-amber-900/30 rounded-lg px-2.5 py-2">
          <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] text-amber-100 truncate flex-1">{file.name}</span>
          <button onClick={onClear} className="text-amber-400/70 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.md,image/*" className="hidden" onChange={onPick} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="w-full flex items-center gap-2 text-[11px] font-semibold text-amber-200 bg-black/40 hover:bg-black/60 border border-dashed border-amber-700/50 hover:border-amber-500 px-2.5 py-2 rounded-lg disabled:opacity-50">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
          </button>
          {hint && <p className="text-[10px] text-amber-200/40 mt-1">{hint}</p>}
        </>
      )}
    </div>
  );
}

// Upload a brand document + optional script → AI extracts brand kit fields and a
// production brief → auto-populates the studio. The operator edits everything
// before anything is saved. Fields the doc doesn't mention are still populated
// (empty) so they're ready when the user reaches that step.
export default function DocumentIntake({ onExtracted }) {
  const [brandFile, setBrandFile] = useState(null);
  const [scriptFile, setScriptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const brandRef = useRef(null);
  const scriptRef = useRef(null);

  const pickFile = async (e, setter) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true); setError(""); setDone(false);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const url = res?.file_url || res?.data?.file_url;
      if (!url) throw new Error("Upload did not return a file URL");
      setter({ name: file.name, url });
    } catch (err) {
      setError(`Upload failed: ${err.message || "please try again"}`);
    } finally {
      setUploading(false);
    }
  };

  const run = async () => {
    if (!brandFile && !scriptFile) return;
    setExtracting(true); setError(""); setDone(false);
    try {
      // Extract text client-side for docs (Word/PDF the vision model can't parse).
      const brandText = brandFile && isDocFile(brandFile.name) ? await extractDocText(brandFile.url, brandFile.name) : "";
      const scriptText = scriptFile && isDocFile(scriptFile.name) ? await extractDocText(scriptFile.url, scriptFile.name) : "";
      const res = await base44.functions.invoke("commercialStudioIntake", {
        brand_file_url: brandFile && !isDocFile(brandFile.name) ? brandFile.url : "",
        script_file_url: scriptFile && !isDocFile(scriptFile.name) ? scriptFile.url : "",
        brand_text: brandText,
        script_text: scriptText,
      });
      if (res.data?.error) { setError(res.data.error); return; }
      onExtracted?.(res.data);
      setDone(true);
    } catch (err) {
      setError(err.message || "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="bg-[#12100f] border border-amber-900/30 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-amber-50 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" /> Document Intake</p>
      <p className="text-[11px] text-amber-200/50 -mt-1">Upload a brand doc &amp; script — we auto-fill every field for you to review and edit.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <FileRow label="Brand document" file={brandFile} onPick={(e) => pickFile(e, setBrandFile)} onClear={() => setBrandFile(null)} inputRef={brandRef} hint="Colors, fonts, tone, style" uploading={uploading} />
        <FileRow label="Script (optional)" file={scriptFile} onPick={(e) => pickFile(e, setScriptFile)} onClear={() => setScriptFile(null)} inputRef={scriptRef} hint="Becomes the production brief" uploading={uploading} />
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
      {done && <p className="text-[11px] text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Fields populated below — review &amp; edit before saving.</p>}

      <button onClick={run} disabled={extracting || uploading || (!brandFile && !scriptFile)}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-4 py-2.5 rounded-xl disabled:opacity-50">
        {extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</> : <><Wand2 className="w-4 h-4" /> Auto-populate fields</>}
      </button>
    </div>
  );
}