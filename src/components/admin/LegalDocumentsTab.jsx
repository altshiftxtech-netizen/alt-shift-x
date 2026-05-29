import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Save, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const DOCS = [
  { slug: "privacy_policy", title: "Privacy Policy", route: "/privacy" },
  { slug: "terms_of_service", title: "Terms of Service", route: "/terms" },
];

function DocEditor({ slug, title }) {
  const [record, setRecord] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    base44.entities.LegalDocument.filter({ slug })
      .then(data => {
        if (data && data[0]) {
          setRecord(data[0]);
          setContent(data[0].content || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (record) {
        await base44.entities.LegalDocument.update(record.id, { content, last_updated_by: "admin" });
      } else {
        const r = await base44.entities.LegalDocument.create({ slug, title, content, last_updated_by: "admin" });
        setRecord(r);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert("Save failed: " + e.message);
    }
    setSaving(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["txt", "md", "doc", "docx", "pdf"].includes(ext)) {
      setUploadError("Unsupported file type. Please upload a .txt, .md, .doc, .docx, or .pdf file.");
      setUploading(false);
      return;
    }

    try {
      if (ext === "txt" || ext === "md") {
        // Read directly
        const text = await file.text();
        setContent(text);
      } else {
        // Upload and extract via LLM integration
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              content: { type: "string", description: "Full plain text content of the document, preserving all structure and section headings." }
            }
          }
        });
        if (result.status === "success" && result.output?.content) {
          setContent(result.output.content);
        } else {
          setUploadError("Could not extract text from file. Try a .txt or .md file instead.");
        }
      }
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
    }
    setUploading(false);
    e.target.value = "";
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
          {record?.version && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">v{record.version}</span>}
          {record?.last_updated_by && (
            <span className="text-[10px] text-slate-400">· last saved by {record.last_updated_by}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Upload button */}
          <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.doc,.docx,.pdf" onChange={handleFileUpload} />
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => fileRef.current.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Uploading…" : "Upload Document"}
          </Button>
          {/* Save button */}
          <Button
            size="sm"
            className="text-xs gap-1.5 bg-slate-900 hover:bg-slate-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
             saved ? <CheckCircle2 className="w-3.5 h-3.5" /> :
             <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mx-5 mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{uploadError}
        </div>
      )}

      {/* Upload hint */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-[11px] text-slate-400">
          Edit the content directly below, or upload a .txt, .md, .doc, .docx, or .pdf file to replace it. Changes are saved to the database and reflected on the live page.
        </p>
      </div>

      {/* Textarea */}
      <div className="px-5 pb-5 pt-2">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={20}
          className="w-full text-sm text-slate-700 font-mono leading-relaxed border border-slate-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-y bg-slate-50"
          placeholder={`Enter the ${title} content here…`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default function LegalDocumentsTab() {
  const [activeDoc, setActiveDoc] = useState("privacy_policy");

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
        {DOCS.map(doc => (
          <button
            key={doc.slug}
            onClick={() => setActiveDoc(doc.slug)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeDoc === doc.slug ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {doc.title}
          </button>
        ))}
      </div>

      {DOCS.filter(d => d.slug === activeDoc).map(doc => (
        <DocEditor key={doc.slug} slug={doc.slug} title={doc.title} />
      ))}
    </div>
  );
}