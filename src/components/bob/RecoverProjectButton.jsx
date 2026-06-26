import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { parseRecoveryFile, recoverProject } from "@/lib/projectRecovery";

// Lets a builder re-import a downloaded JSON recovery file and resume that
// project as a fresh BOB conversation. On success it calls onRecovered(conv)
// so the panel can open it and refresh.
export default function RecoverProjectButton({ onRecovered }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const data = await parseRecoveryFile(file);
      const conv = await recoverProject(data);
      onRecovered?.(conv);
    } catch (err) {
      setError(err.message || "Could not recover this file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title="Recover a project from a downloaded .json file"
        className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 hover:text-white bg-amber-900/30 hover:bg-amber-800 border border-amber-700/50 px-2 py-1 rounded-md transition-colors"
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        Recover File
      </button>
      {error && <span className="text-[9px] text-red-400">{error}</span>}
    </>
  );
}