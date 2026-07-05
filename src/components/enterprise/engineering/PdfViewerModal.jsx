import React from "react";
import { X, FileText, ExternalLink } from "lucide-react";

/**
 * Internal PDF viewer for the Sovereign Guides. When a guide has a `url`, it's
 * rendered inline in an iframe; otherwise a "document pending" state is shown so
 * the repository UI is always coherent even before the PDFs are uploaded.
 */
export default function PdfViewerModal({ guide, onClose }) {
  if (!guide) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-4xl h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{ background: "#0a0c12", borderColor: "#C8A95B33" }}
      >
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
          <FileText className="w-4 h-4 text-[#C8A95B]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{guide.title}</p>
            <p className="text-[9px] font-mono text-white/35">{guide.code}</p>
          </div>
          {guide.url && (
            <a href={guide.url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white" title="Open in new tab">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 bg-white/[0.02]">
          {guide.url ? (
            <iframe title={guide.title} src={guide.url} className="w-full h-full" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.3)" }}>
                <FileText className="w-6 h-6 text-[#C8A95B]" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Document pending upload</p>
              <p className="text-xs text-white/45 max-w-sm">
                {guide.title} ({guide.code}) will render here once the Sovereign Guide PDF is attached to the repository.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}