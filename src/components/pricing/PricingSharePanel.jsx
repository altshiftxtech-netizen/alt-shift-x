import React, { useState, useEffect, useRef } from "react";
import { Share2, Check, Copy } from "lucide-react";

const SHARE_TEXT = "Alt+Shift+X Marketplace — free to join, pay per component. Builders earn up to 85% revenue share. Check out the pricing:";

export default function PricingSharePanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const url = typeof window !== "undefined" ? `${window.location.origin}/pricing` : "/pricing";

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const platforms = [
    { label: "Twitter / X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`, color: "hover:bg-sky-50 hover:text-sky-600" },
    { label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, color: "hover:bg-blue-50 hover:text-blue-600" },
    { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "hover:bg-blue-50 hover:text-blue-600" },
    { label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + url)}`, color: "hover:bg-emerald-50 hover:text-emerald-600" },
    { label: "Email", url: `mailto:?subject=${encodeURIComponent("Alt+Shift+X Pricing")}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + url)}`, color: "hover:bg-slate-50 hover:text-slate-700" },
  ];

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Alt+Shift+X Pricing", text: SHARE_TEXT, url }); } catch { /* cancelled */ }
    } else {
      setOpen(v => !v);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (navigator.share ? nativeShare() : setOpen(v => !v))}
        className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-all"
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-56">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Share pricing</p>
          {platforms.map(p => (
            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 text-xs text-slate-600 px-2 py-1.5 rounded-lg transition-all ${p.color}`}>
              {p.label}
            </a>
          ))}
          <button
            onClick={copy}
            className="flex items-center gap-2 text-xs text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all w-full mt-1 border-t border-slate-100 pt-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}