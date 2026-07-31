import React, { useState, useRef } from "react";
import { Upload, FileCode2, X, Plus, Key } from "lucide-react";

export default function CodeInjector({ uploadedFiles, setUploadedFiles, apiFields, setApiFields }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = (files) => {
    const accepted = Array.from(files).filter((f) => /\.(js|py|go)$/.test(f.name));
    setUploadedFiles((prev) => [...prev, ...accepted]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));

  const addApiField = () => setApiFields((prev) => [...prev, { key: "", value: "" }]);
  const updateApiField = (idx, field, val) =>
    setApiFields((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f)));
  const removeApiField = (idx) => setApiFields((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117]/60 backdrop-blur-md p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FileCode2 className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400">Hard-Coded Code & API Injection</h3>
      </div>

      {/* Drag-and-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all ${dragging ? "border-cyan-500 bg-cyan-500/10" : "border-[#30363d] hover:border-cyan-500/50 hover:bg-[#161b22]"}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".js,.py,.go"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="w-6 h-6 text-[#484f58] mx-auto mb-2" />
        <p className="text-xs text-[#8b949e]">Drag & drop <code className="text-amber-400">.js</code> / <code className="text-amber-400">.py</code> / <code className="text-amber-400">.go</code> files</p>
        <p className="text-[10px] text-[#484f58] mt-1">Uploaded code is hard-coded into Component.code for invariant execution</p>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1.5">
          {uploadedFiles.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#010409] px-3 py-2">
              <FileCode2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="text-xs font-mono text-[#c9d1d9] flex-1 truncate">{f.name}</span>
              <span className="text-[10px] font-mono text-[#484f58]">{(f.size / 1024).toFixed(1)}KB</span>
              <button onClick={() => removeFile(idx)} className="text-[#484f58] hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* API key-value inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono text-[#8b949e]">API Fields (hard-coded before PWA render)</span>
          </div>
          <button onClick={addApiField} className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {apiFields.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={f.key}
                onChange={(e) => updateApiField(idx, "key", e.target.value)}
                placeholder="API_ENDPOINT"
                className="flex-1 rounded-lg border border-[#30363d] bg-[#010409] px-2.5 py-1.5 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-cyan-500/50 placeholder:text-[#484f58]"
              />
              <input
                value={f.value}
                onChange={(e) => updateApiField(idx, "value", e.target.value)}
                placeholder="https://api.example.com"
                className="flex-1 rounded-lg border border-[#30363d] bg-[#010409] px-2.5 py-1.5 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-cyan-500/50 placeholder:text-[#484f58]"
              />
              <button onClick={() => removeApiField(idx)} className="text-[#484f58] hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {apiFields.length === 0 && (
            <p className="text-[10px] text-[#484f58] font-mono italic">No API fields added. Click "Add" to inject environment variables.</p>
          )}
        </div>
      </div>
    </div>
  );
}