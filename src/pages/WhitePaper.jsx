import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Logo from "@/components/Logo";
import { base44 } from "@/api/base44Client";

/**
 * WhitePaper — public-facing render of the SiteContent record
 * `altshiftx_platform_white_paper_public`. Routed at /white-paper.
 */
export default function WhitePaper() {
  const [record, setRecord] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    let cancelled = false;
    base44.entities.SiteContent.filter({ key: "altshiftx_platform_white_paper_public", is_active: true })
      .then((rows) => { if (!cancelled) setRecord((rows && rows[0]) || null); })
      .catch(() => { if (!cancelled) setRecord(null); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2 sticky top-0 z-30">
        <Logo className="h-8 w-auto" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-600">White Paper</span>
      </nav>

      {record === undefined ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : record === null ? (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center text-slate-500">
          The white paper is not currently available. Please check back soon.
        </div>
      ) : (
        <article className="max-w-3xl mx-auto px-6 py-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <FileText className="w-3.5 h-3.5" /> Platform White Paper
            </div>
            <h1 className="text-3xl font-black text-slate-900">{record.title}</h1>
          </div>

          <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-a:text-violet-600 prose-table:text-xs">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{record.body}</ReactMarkdown>
          </div>

          <div className="flex flex-wrap gap-3 mt-12 pt-6 border-t border-slate-200">
            <Link to="/" className="text-xs text-slate-500 hover:underline">Back to Platform</Link>
            <span className="text-slate-300">|</span>
            <Link to="/marketplace" className="text-xs text-violet-600 font-semibold hover:underline">Browse the Marketplace</Link>
          </div>
        </article>
      )}
    </div>
  );
}