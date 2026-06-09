import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Newspaper, MessageSquare, Loader2, Trash2, Eye, EyeOff, RefreshCw, ExternalLink, Smile } from "lucide-react";

const STATUS_STYLE = {
  published: "bg-emerald-900/50 text-emerald-300",
  draft: "bg-slate-700/50 text-slate-300",
};

/**
 * BlogManager — UpKeeper section to manage the blog: list articles, toggle
 * publish/draft, delete articles, and moderate comments & reactions per post.
 */
export default function BlogManager() {
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [a, c, r] = await Promise.all([
      base44.entities.Article.list("-created_date", 100).catch(() => []),
      base44.entities.BlogComment.list("-created_date", 500).catch(() => []),
      base44.entities.BlogReaction.list("-created_date", 1000).catch(() => []),
    ]);
    setArticles(a || []); setComments(c || []); setReactions(r || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const togglePublish = async (a) => {
    setBusy(true);
    const next = a.status === "published" ? "draft" : "published";
    await base44.entities.Article.update(a.id, {
      status: next,
      published_at: next === "published" ? (a.published_at || new Date().toISOString()) : a.published_at,
    }).catch(() => {});
    await load();
    setBusy(false);
  };

  const deleteArticle = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    setBusy(true);
    await base44.entities.Article.delete(a.id).catch(() => {});
    if (active?.id === a.id) setActive(null);
    await load();
    setBusy(false);
  };

  const deleteComment = async (id) => {
    setBusy(true);
    await base44.entities.BlogComment.delete(id).catch(() => {});
    await load();
    setBusy(false);
  };

  const deleteReaction = async (id) => {
    setBusy(true);
    await base44.entities.BlogReaction.delete(id).catch(() => {});
    await load();
    setBusy(false);
  };

  const commentsFor = (slug) => comments.filter((c) => c.article_slug === slug);
  const reactionsFor = (slug) => reactions.filter((r) => r.article_slug === slug);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange-400 animate-spin" /></div>;

  return (
    <div className="grid lg:grid-cols-5 gap-4">
      {/* Article list */}
      <div className="lg:col-span-2 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-orange-400" /> Articles ({articles.length})
          </h3>
          <button onClick={load} className="text-orange-300 hover:text-white p-1 rounded-lg hover:bg-[#2a1d16]"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
        {articles.length === 0 ? (
          <p className="text-xs text-orange-200/50 py-6 text-center">No articles yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {articles.map((a) => {
              const cCount = commentsFor(a.slug).length;
              const rCount = reactionsFor(a.slug).length;
              return (
                <button key={a.id} onClick={() => setActive(a)}
                  className={`w-full text-left bg-[#241812] border rounded-xl p-3 transition-colors ${active?.id === a.id ? "border-orange-500" : "border-orange-900/40 hover:border-orange-700"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-orange-50 truncate flex-1">{a.title}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[a.status] || STATUS_STYLE.draft}`}>{a.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-orange-200/50">
                    <span className="capitalize">{a.category}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {cCount}</span>
                    <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> {rCount}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail / moderation */}
      <div className="lg:col-span-3">
        {!active ? (
          <div className="bg-[#1a120d] border border-orange-900/40 rounded-xl h-full flex items-center justify-center text-orange-200/40 text-sm py-16">
            Select an article to manage its comments &amp; reactions
          </div>
        ) : (
          <div className="bg-[#1a120d] border border-orange-900/40 rounded-xl p-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-orange-50">{active.title}</p>
                <p className="text-[11px] text-orange-200/50 capitalize">{active.category} · {active.status}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {active.status === "published" && (
                  <a href={`/blog/${active.slug}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-orange-300 hover:text-white bg-[#2a1d16] border border-orange-900/40 px-2 py-1.5 rounded-lg">
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                )}
                <button onClick={() => togglePublish(active)} disabled={busy}
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-100 bg-[#2a1d16] hover:bg-[#3a2a24] border border-orange-900/40 px-2 py-1.5 rounded-lg disabled:opacity-50">
                  {active.status === "published" ? <><EyeOff className="w-3 h-3" /> Unpublish</> : <><Eye className="w-3 h-3" /> Publish</>}
                </button>
                <button onClick={() => deleteArticle(active)} disabled={busy}
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-300 hover:text-white bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 px-2 py-1.5 rounded-lg disabled:opacity-50">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>

            {/* Reactions */}
            <div>
              <p className="text-[11px] font-bold text-orange-200 mb-1.5 flex items-center gap-1.5"><Smile className="w-3.5 h-3.5 text-orange-400" /> Reactions ({reactionsFor(active.slug).length})</p>
              {reactionsFor(active.slug).length === 0 ? (
                <p className="text-[11px] text-orange-200/40">No reactions yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {reactionsFor(active.slug).map((r) => (
                    <button key={r.id} onClick={() => deleteReaction(r.id)} disabled={busy} title="Remove reaction"
                      className="flex items-center gap-1 bg-[#241812] border border-orange-900/40 hover:border-red-700 px-2 py-1 rounded-lg text-sm group">
                      <span>{r.emoji}</span>
                      <Trash2 className="w-3 h-3 text-orange-300/40 group-hover:text-red-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <p className="text-[11px] font-bold text-orange-200 mb-1.5 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-orange-400" /> Comments ({commentsFor(active.slug).length})</p>
              {commentsFor(active.slug).length === 0 ? (
                <p className="text-[11px] text-orange-200/40">No comments yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {commentsFor(active.slug).map((c) => (
                    <div key={c.id} className="bg-[#241812] border border-orange-900/40 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-orange-100">{c.author_name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-orange-200/40">{new Date(c.created_date).toLocaleDateString()}</span>
                          <button onClick={() => deleteComment(c.id)} disabled={busy} className="text-orange-300/50 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-orange-200/70 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}