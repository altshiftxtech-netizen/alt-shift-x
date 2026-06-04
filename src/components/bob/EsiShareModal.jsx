import React, { useState, useEffect } from "react";
import { X, Loader2, Copy, Check, Mail, Share2, FileText, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Generates a shareable public URL for a project's ESI legal record and surfaces
// cloud destinations: Google Drive, Dropbox, OneDrive, plus email, copy-link and the
// native share sheet. Each cloud option opens that provider's "save from URL" flow.
export default function EsiShareModal({ conversation, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("ESI_Record.pdf");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("shareEsiRecord", { conversationId: conversation.id });
        if (res.data?.file_url) {
          setFileUrl(res.data.file_url);
          setFileName(res.data.file_name || "ESI_Record.pdf");
        } else {
          setError(res.data?.error || "Could not generate the share link.");
        }
      } catch (e) {
        setError(e?.response?.data?.error || "Could not generate the share link.");
      }
      setLoading(false);
    })();
  }, [conversation.id]);

  const enc = encodeURIComponent(fileUrl);

  // Cloud "save from URL" destinations
  const destinations = [
    {
      label: "Google Drive",
      color: "from-yellow-400 via-green-500 to-blue-500",
      href: `https://drive.google.com/`,
      note: "Opens Drive — paste the copied link with 'New → File upload by URL' or use the link.",
      // Drive has no direct save-from-URL deep link; we open Drive and rely on copied link.
      copyFirst: true,
    },
    {
      label: "Dropbox",
      color: "from-blue-500 to-blue-700",
      href: `https://www.dropbox.com/`,
      note: "Opens Dropbox — paste the copied link to save it.",
      copyFirst: true,
    },
    {
      label: "OneDrive",
      color: "from-sky-500 to-blue-600",
      href: `https://onedrive.live.com/`,
      note: "Opens OneDrive — paste the copied link to save it.",
      copyFirst: true,
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openDestination = async (d) => {
    if (d.copyFirst) {
      try { await navigator.clipboard.writeText(fileUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
    }
    window.open(d.href, "_blank", "noopener");
  };

  const emailLink = () => {
    const subject = encodeURIComponent(`ESI Legal Record — ${fileName}`);
    const body = encodeURIComponent(`Here is the ESI legal record:\n\n${fileUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: fileName, text: "ESI Legal Record", url: fileUrl }); } catch { /* cancelled */ }
    } else {
      copyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" /> Share ESI Record
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <p className="text-xs text-slate-400">Generating shareable record…</p>
            </div>
          ) : error ? (
            <p className="text-xs text-red-400 text-center py-6">{error}</p>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-4">
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-300 truncate flex-1">{fileName}</span>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Copy link */}
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2.5 mb-4 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copied!" : "Copy share link"}
              </button>

              {/* Cloud destinations */}
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Save to cloud</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {destinations.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => openDestination(d)}
                    title={d.note}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg bg-gradient-to-br ${d.color} text-white text-[10px] font-bold hover:opacity-90 transition-opacity`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mb-4 leading-relaxed">
                The share link is copied automatically — paste it into your cloud's "upload from link" option.
              </p>

              {/* Email + native share */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={emailLink}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2.5 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  onClick={nativeShare}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2.5 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> More…
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}