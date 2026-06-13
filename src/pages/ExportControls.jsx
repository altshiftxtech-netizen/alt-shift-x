import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Export Controls & Sanctions Policy page.
 * Renders the live `sanctions_policy_page` SiteContent record (managed by The
 * UpKeeper) in the same legal-page layout as Terms of Service.
 * Served at both /export-controls and /sanctions-policy.
 */
export default function ExportControls() {
  const content = useSiteContent("sanctions_policy_page");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2">
        <Logo className="h-8 w-auto" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-500">Export Controls & Sanctions Policy</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {content === null ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Compliance
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-3">{content.title}</h1>
            </div>

            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content.body}</ReactMarkdown>
            </div>

            <div className="flex gap-3 mt-10 pt-6 border-t border-slate-200">
              <Link to="/terms" className="text-xs text-violet-600 font-semibold hover:underline">Terms of Service</Link>
              <span className="text-slate-300">|</span>
              <Link to="/privacy" className="text-xs text-violet-600 font-semibold hover:underline">Privacy Policy</Link>
              <span className="text-slate-300">|</span>
              <Link to="/" className="text-xs text-slate-500 hover:underline">Back to Platform</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}