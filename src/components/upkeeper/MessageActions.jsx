import React, { useState } from "react";
import { Copy, Check, Download } from "lucide-react";

// Copy + download controls shown at the bottom of an UpKeeper assistant reply.
export default function MessageActions({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    const blob = new Blob([text || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upkeeper-response-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-orange-900/30">
      <button onClick={copy} className="flex items-center gap-1 text-[11px] text-orange-200/60 hover:text-orange-300 transition-colors">
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button onClick={download} className="flex items-center gap-1 text-[11px] text-orange-200/60 hover:text-orange-300 transition-colors">
        <Download className="w-3 h-3" /> Download
      </button>
    </div>
  );
}