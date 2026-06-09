import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";

/**
 * BlogComments — public comment thread for a blog post. Anyone signed in can
 * post; authors and admins can delete their own / any comment.
 */
export default function BlogComments({ slug }) {
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const list = await base44.entities.BlogComment.filter({ article_slug: slug }, "-created_date", 200).catch(() => []);
    setComments(list || []);
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    load();
  }, [slug]);

  const submit = async () => {
    if (!body.trim()) return;
    if (!user) { base44.auth.redirectToLogin(); return; }
    setPosting(true);
    await base44.entities.BlogComment.create({
      article_slug: slug,
      author_name: user.full_name || "Anonymous",
      body: body.trim(),
    }).catch(() => {});
    setBody("");
    await load();
    setPosting(false);
  };

  const remove = async (id) => {
    await base44.entities.BlogComment.delete(id).catch(() => {});
    await load();
  };

  const canDelete = (c) => user && (c.created_by_id === user.id || user.role === "admin");

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-violet-600" /> Comments ({comments.length})
      </h2>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={user ? "Share your thoughts…" : "Sign in to leave a comment…"}
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-violet-400 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button onClick={submit} disabled={posting || !body.trim()}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 px-4 py-2 rounded-lg transition-colors">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Be the first to comment.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-800">{c.author_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{new Date(c.created_date).toLocaleDateString()}</span>
                  {canDelete(c) && (
                    <button onClick={() => remove(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}