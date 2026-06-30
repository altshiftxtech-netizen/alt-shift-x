import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Youtube, Smile, Loader2, AtSign } from "lucide-react";
import { base44 } from "@/api/base44Client";

const QUICK_EMOJIS = ["🥂", "🔥", "🛠️", "✨", "🚀", "💡", "👏", "🙌", "🧠", "☕"];

/**
 * Social feed composer — same posting behaviour as SpeakeasyComposer, but
 * awards a "post" participation point and summons The Front Man on @mentions.
 */
export default function SocialComposer({ user, onPosted, award, groupId }) {
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [posting, setPosting] = useState(false);

  const mentionsAI = /@frontman|@host|\?/i.test(content);

  const submit = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    const data = {
      author_id: user.id,
      author_name: user.full_name || user.email,
      content: content.trim(),
      post_type: showVideo && videoUrl ? "video" : "text",
      mentions_ai: mentionsAI,
      reactions: {},
    };
    if (groupId) data.group_id = groupId;
    if (showVideo && videoUrl) { data.media_url = videoUrl; data.media_title = "Shared video"; }

    const post = await base44.entities.SpeakeasyPost.create(data);
    await award?.("post");

    if (mentionsAI) {
      base44.functions.invoke("speakeasyHost", { postId: post.id }).then(() => onPosted?.());
    }

    setContent(""); setVideoUrl(""); setShowVideo(false); setShowEmoji(false);
    setPosting(false);
    onPosted?.();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-xl p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D9DCE1]/30 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {(user.full_name || user.email || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share something with the room… ask @frontman a question and the host will answer."
            rows={2}
            className="w-full bg-transparent text-sm text-white placeholder:text-[#6B6F76] resize-none focus:outline-none"
          />
          {showVideo && (
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="Paste a YouTube link…"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#6B6F76] focus:outline-none focus:border-[#C8A95B]/40"
            />
          )}
          {showEmoji && (
            <div className="flex flex-wrap gap-1.5 mt-2 p-2 bg-white/5 border border-white/10 rounded-lg">
              {QUICK_EMOJIS.map(e => (
                <button key={e} onClick={() => setContent(c => c + e)} className="text-lg hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <button onClick={() => setShowVideo(v => !v)} title="Share YouTube"
                className={`p-2 rounded-lg transition-colors ${showVideo ? "bg-[#C8A95B]/20 text-[#C8A95B]" : "text-[#9CA0A8] hover:bg-white/5"}`}>
                <Youtube className="w-4 h-4" />
              </button>
              <button onClick={() => setShowEmoji(v => !v)} title="Emoji"
                className={`p-2 rounded-lg transition-colors ${showEmoji ? "bg-[#C8A95B]/20 text-[#C8A95B]" : "text-[#9CA0A8] hover:bg-white/5"}`}>
                <Smile className="w-4 h-4" />
              </button>
              {mentionsAI && (
                <span className="flex items-center gap-1 text-[10px] text-[#C8A95B] ml-1">
                  <AtSign className="w-3 h-3" /> Front Man will reply
                </span>
              )}
            </div>
            <Button onClick={submit} disabled={!content.trim() || posting}
              className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 h-8 gap-1.5 text-xs">
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}