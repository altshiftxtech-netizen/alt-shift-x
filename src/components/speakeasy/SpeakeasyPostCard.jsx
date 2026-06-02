import React, { useState } from "react";
import { Sparkles, MessageCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REACTIONS = ["🔥", "🥂", "👏", "🧠", "🚀"];

function ytId(url = "") {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function SpeakeasyPostCard({ post, currentUserId, onReply }) {
  const [reactions, setReactions] = useState(post.reactions || {});
  const vid = post.post_type === "video" ? ytId(post.media_url) : null;

  const react = async (emoji) => {
    const next = { ...reactions, [emoji]: (reactions[emoji] || 0) + 1 };
    setReactions(next);
    await base44.entities.SpeakeasyPost.update(post.id, { reactions: next });
  };

  return (
    <div className={`rounded-2xl border backdrop-blur-xl p-4 ${post.is_ai
      ? "border-[#C8A95B]/30 bg-gradient-to-b from-[#C8A95B]/[0.08] to-transparent"
      : "border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${post.is_ai
          ? "bg-gradient-to-br from-[#C8A95B] to-[#8a7338] text-[#0A0A0C]"
          : "bg-gradient-to-br from-[#D9DCE1]/30 to-white/5 border border-white/10 text-white"}`}>
          {post.is_ai ? <Sparkles className="w-4 h-4" /> : (post.author_name || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{post.author_name}</span>
            {post.is_ai && <span className="text-[9px] font-bold uppercase tracking-wider text-[#C8A95B] bg-[#C8A95B]/15 px-1.5 py-0.5 rounded-full">Host · altshiftx.tech</span>}
            {post.escalated && !post.is_ai && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                <AlertCircle className="w-2.5 h-2.5" /> Sent to admin
              </span>
            )}
          </div>
          <p className="text-sm text-[#D2D5DA] mt-1 whitespace-pre-wrap break-words">{post.content}</p>

          {vid && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10 aspect-video">
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${vid}`} title={post.media_title || "video"} allowFullScreen />
            </div>
          )}
          {post.post_type === "meme" && post.media_url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
              <img src={post.media_url} alt={post.media_title || "meme"} className="w-full object-cover" />
              {post.media_title && <p className="text-[11px] text-[#9CA0A8] italic px-3 py-2 bg-white/[0.03]">“{post.media_title}”</p>}
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            {REACTIONS.map(e => (
              <button key={e} onClick={() => react(e)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[#D2D5DA] transition-colors">
                <span>{e}</span>
                {reactions[e] ? <span className="text-[10px] text-[#9CA0A8]">{reactions[e]}</span> : null}
              </button>
            ))}
            {!post.parent_id && (
              <button onClick={() => onReply?.(post)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-[#9CA0A8] hover:text-white transition-colors ml-1">
                <MessageCircle className="w-3.5 h-3.5" /> {post.reply_count || 0}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}