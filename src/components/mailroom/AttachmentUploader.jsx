import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Paperclip, Loader2, X } from "lucide-react";

// Compact attachment picker for the email composer. Uploads each file to storage
// and hands back { name, url } objects the campaign stores + Resend attaches.
export default function AttachmentUploader({ attachments, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const added = [];
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        added.push({ name: file.name, url: file_url });
      } catch { /* skip failed upload */ }
    }
    onChange([...(attachments || []), ...added]);
    setUploading(false);
    e.target.value = "";
  };

  const remove = (i) => onChange((attachments || []).filter((_, j) => j !== i));

  return (
    <div>
      <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Attachments</label>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
        {uploading ? "Uploading…" : "Attach files"}
      </button>
      {(attachments || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {attachments.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-orange-900/40 border border-orange-700/60 text-orange-200 text-[11px] px-2.5 py-1 rounded-full">
              <Paperclip className="w-3 h-3" />
              <span className="max-w-[140px] truncate">{f.name}</span>
              <button type="button" onClick={() => remove(i)} className="text-orange-400 hover:text-white"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}