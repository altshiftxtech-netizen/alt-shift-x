import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Scale, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Logo from "@/components/Logo";
import { base44 } from "@/api/base44Client";

/**
 * LegalPage — renders one or more SiteContent records (by key) sequentially as
 * a single continuous legal document, with a sticky table of contents built
 * from the H1/H2 headings in the body. Multi-part docs (ToS, Privacy, Builder
 * Agreement) pass multiple keys and they render in order as one document.
 *
 * @param {string[]} contentKeys — SiteContent keys in render order
 * @param {string}   crumb       — breadcrumb label shown in the nav
 */
export default function LegalPage({ contentKeys = [], crumb = "Legal" }) {
  const [records, setRecords] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    (async () => {
      // Retry up to 3x with backoff — transient 429 rate limits were silently
      // swallowing the fetch and rendering an empty "not available" page.
      while (attempt < 3) {
        attempt += 1;
        const results = await Promise.all(
          contentKeys.map((key) =>
            base44.entities.SiteContent.filter({ key, is_active: true })
              .then((rows) => (rows && rows[0]) || null)
              .catch(() => null)
          )
        );
        const filtered = results.filter(Boolean);
        if (cancelled) return;
        if (filtered.length > 0 || attempt === 3) { setRecords(filtered); return; }
        await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKeys.join("|")]);

  // Combine all parts into one markdown document.
  const combinedBody = useMemo(() => {
    if (!records) return "";
    return records.map((r) => r.body || "").join("\n\n");
  }, [records]);

  const title = records && records[0] ? records[0].title : crumb;

  // Build a table of contents from H2 headings (## ...), assigning slug ids.
  const toc = useMemo(() => {
    const items = [];
    combinedBody.split("\n").forEach((line) => {
      const m = /^##\s+(.+?)\s*$/.exec(line);
      if (m) {
        const text = m[1].replace(/[#*`]/g, "").trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (id) items.push({ text, id });
      }
    });
    return items;
  }, [combinedBody]);

  const articleRef = useRef(null);

  // After render, assign matching ids to the rendered <h2> elements so the ToC links work.
  useEffect(() => {
    if (!articleRef.current) return;
    const headings = articleRef.current.querySelectorAll("h2");
    headings.forEach((h) => {
      const text = (h.textContent || "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (id) h.id = id;
    });
  }, [combinedBody]);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2 sticky top-0 z-30">
        <Logo className="h-8 w-auto" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-600">{crumb}</span>
      </nav>

      {records === null ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : records.length === 0 ? (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center text-slate-500">
          This policy is not currently available. Please check back soon.
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* Sticky table of contents */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">On this page</p>
                <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-xs text-slate-500 hover:text-violet-700 leading-snug py-1"
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          <article ref={articleRef}>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Scale className="w-3.5 h-3.5" /> Legal
              </div>
              <h1 className="text-3xl font-black text-slate-900">{title}</h1>
            </div>

            <div className="prose prose-sm prose-slate max-w-none scroll-mt-24 [&_h2]:scroll-mt-24">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{combinedBody}</ReactMarkdown>
            </div>

            <div className="flex flex-wrap gap-3 mt-12 pt-6 border-t border-slate-200">
              <Link to="/legal/terms" className="text-xs text-violet-600 font-semibold hover:underline">Terms of Service</Link>
              <span className="text-slate-300">|</span>
              <Link to="/legal/privacy" className="text-xs text-violet-600 font-semibold hover:underline">Privacy Policy</Link>
              <span className="text-slate-300">|</span>
              <Link to="/" className="text-xs text-slate-500 hover:underline">Back to Platform</Link>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}