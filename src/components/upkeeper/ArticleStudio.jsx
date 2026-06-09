import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Newspaper, Sparkles, Loader2, Upload, Send, RefreshCw, Copy, Check, Download, Globe, FileEdit } from "lucide-react";

const CATEGORIES = [
  { key: "product", label: "Product" },
  { key: "promotion", label: "Promotion" },
  { key: "event", label: "Event" },
  { key: "site", label: "Site / Platform" },
  { key: "general", label: "General" },
];

const slugify = (s) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) +
  "-" + Math.random().toString(36).slice(2, 6);

// AI article generator with illustrations. Drafts in UpKeeper, then publishes to /blog.
export default function ArticleStudio({ user }) {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("product");
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef(null);

  const editArticle = (a) => {
    setEditingId(a.id);
    setCategory(a.category || "general");
    setDraft({
      title: a.title || "",
      excerpt: a.excerpt || "",
      body: a.body || "",
      tags: a.tags || [],
      hero_image_url: a.hero_image_url || "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setDraft(null); setEditingId(null); setTopic(""); };

  const load = async () => {
    const list = await base44.entities.Article.list("-created_date", 30).catch(() => []);
    setArticles(list);
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    const res = await base44.functions.invoke("generateArticle", { topic, category, withIllustration: true })
      .catch((e) => ({ data: { error: e.message } }));
    if (res?.data?.ok) {
      setDraft({
        title: res.data.title,
        excerpt: res.data.excerpt,
        body: res.data.body,
        tags: res.data.tags || [],
        hero_image_url: res.data.hero_image_url || "",
      });
    } else {
      alert("Generation failed: " + (res?.data?.error || "unknown error"));
    }
    setGenerating(false);
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setDraft((d) => ({ ...d, hero_image_url: file_url }));
    e.target.value = "";
  };

  const copyBody = async () => {
    await navigator.clipboard.writeText(draft?.body || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadMd = () => {
    const md = `# ${draft.title}\n\n${draft.body}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${slugify(draft.title)}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const save = async (status) => {
    if (!draft?.title || !draft?.body) return;
    setPublishing(true);
    const payload = {
      title: draft.title,
      category,
      excerpt: draft.excerpt,
      body: draft.body,
      hero_image_url: draft.hero_image_url || undefined,
      tags: draft.tags,
      author_name: user?.full_name || "The UpKeeper",
      status,
      published_at: status === "published" ? new Date().toISOString() : undefined,
    };
    if (editingId) {
      await base44.entities.Article.update(editingId, payload);
    } else {
      await base44.entities.Article.create({ ...payload, slug: slugify(draft.title) });
    }
    setDraft(null); setTopic(""); setEditingId(null);
    await load();
    setPublishing(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Composer */}
      <div className="bg-[#241812] border border-orange-900/40 rounded-2xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-orange-400" /> Article Generator
        </h3>

        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ key, label }) => (
              <button key={key} onClick={() => setCategory(key)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${category === key ? "bg-orange-600 text-white border-orange-500" : "bg-[#2a1d16] text-orange-200/70 border-orange-900/40 hover:border-orange-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-orange-200/70 block mb-1.5">What should the article cover?</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
            placeholder="e.g. How SAFEGUARD protects high-risk AI deployments — announce launch + benefits"
            className="w-full bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 resize-none" />
          <button onClick={generate} disabled={generating || !topic.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 px-4 py-2.5 rounded-xl disabled:opacity-50 transition-opacity">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Article + Illustration
          </button>
        </div>

        {draft && (
          <div className="space-y-3 pt-2 border-t border-orange-900/40">
            {editingId && (
              <div className="flex items-center justify-between bg-[#2a1d16] border border-orange-900/40 rounded-lg px-3 py-2">
                <span className="text-[11px] font-semibold text-orange-200 flex items-center gap-1.5"><FileEdit className="w-3.5 h-3.5 text-orange-400" /> Editing existing article</span>
                <button onClick={cancelEdit} className="text-[11px] font-semibold text-orange-300 hover:text-white">Cancel</button>
              </div>
            )}
            {draft.hero_image_url && (
              <img src={draft.hero_image_url} alt="" className="w-full max-h-48 object-cover rounded-lg border border-orange-900/40" />
            )}
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="w-full bg-[#1a120d] text-orange-50 text-sm font-bold px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600" />
            <textarea value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} rows={10}
              className="w-full bg-[#1a120d] text-orange-50 text-xs px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-600 resize-none font-mono" />

            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload image
              </button>
              <button onClick={copyBody}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadMd}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-200 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2.5 py-1.5 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => save("draft")} disabled={publishing}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-orange-100 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-3 py-2 rounded-lg disabled:opacity-50 transition-colors">
                <FileEdit className="w-3.5 h-3.5" /> Save draft
              </button>
              <button onClick={() => save("published")} disabled={publishing}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 px-3 py-2 rounded-lg disabled:opacity-50 transition-opacity">
                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />} Publish to blog
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing articles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-100">Articles</h3>
          <button onClick={load} className="text-orange-300 hover:text-white p-1 rounded-lg hover:bg-[#2a1d16]">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        {articles.length === 0 ? (
          <p className="text-xs text-orange-200/50 py-6 text-center">No articles yet. Generate one to get started.</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {articles.map((a) => (
              <div key={a.id} className="bg-[#241812] border border-orange-900/40 rounded-xl p-3 flex items-center gap-3">
                {a.hero_image_url && <img src={a.hero_image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-orange-50 truncate">{a.title}</p>
                  <p className="text-[11px] text-orange-200/50 capitalize">{a.category} · {a.status}</p>
                </div>
                <button onClick={() => editArticle(a)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-300 hover:text-white shrink-0 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2 py-1 rounded-lg transition-colors">
                  <FileEdit className="w-3 h-3" /> Edit
                </button>
                {a.status === "published" && (
                  <a href={`/blog/${a.slug}`} target="_blank" rel="noreferrer"
                    className="text-[11px] font-semibold text-orange-300 hover:text-white shrink-0">View →</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}