import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SPEAKEASY_SHARE_URL } from "./founderLore";

/**
 * Copies a founder's riddle + a Speakeasy link to the clipboard, formatted for
 * engineers to drop into a dev forum / Slack. Word-of-mouth social proof.
 */
export default function CopyRiddleButton({ founder, riddle, accent = "#C8A95B", className = "" }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e) => {
    e?.stopPropagation?.();
    const text = `"${riddle}"\n— ${founder}, one of the 12 founders of The Speakeasy.\nCrack the rest: ${SPEAKEASY_SHARE_URL}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 border transition-colors ${className}`}
      style={{ borderColor: `${accent}66`, color: accent, background: "rgba(0,0,0,0.35)" }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy Riddle"}
    </button>
  );
}