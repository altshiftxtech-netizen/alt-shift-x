import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const EMOJIS = ["👍", "❤️", "🎉", "🔥", "👏"];

/**
 * BlogReactions — emoji reaction bar for a blog post. Each visitor can pick one
 * reaction; clicking the same emoji removes it. Counts are shown per emoji.
 */
export default function BlogReactions({ slug }) {
  const [reactions, setReactions] = useState([]);
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const list = await base44.entities.BlogReaction.filter({ article_slug: slug }, "-created_date", 1000).catch(() => []);
    setReactions(list || []);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    load();
  }, [slug]);

  const mine = user ? reactions.find((r) => r.created_by_id === user.id) : null;

  const toggle = async (emoji) => {
    if (busy) return;
    if (!user) { base44.auth.redirectToLogin(); return; }
    setBusy(true);
    if (mine && mine.emoji === emoji) {
      await base44.entities.BlogReaction.delete(mine.id).catch(() => {});
    } else if (mine) {
      await base44.entities.BlogReaction.update(mine.id, { emoji }).catch(() => {});
    } else {
      await base44.entities.BlogReaction.create({ article_slug: slug, emoji }).catch(() => {});
    }
    await load();
    setBusy(false);
  };

  const countFor = (emoji) => reactions.filter((r) => r.emoji === emoji).length;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-200">
      <span className="text-sm font-semibold text-slate-500 mr-1">Reactions</span>
      {EMOJIS.map((emoji) => {
        const count = countFor(emoji);
        const active = mine?.emoji === emoji;
        return (
          <button key={emoji} onClick={() => toggle(emoji)} disabled={busy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${active ? "bg-violet-100 border-violet-400" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            <span>{emoji}</span>
            {count > 0 && <span className={`text-xs font-semibold ${active ? "text-violet-700" : "text-slate-500"}`}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}