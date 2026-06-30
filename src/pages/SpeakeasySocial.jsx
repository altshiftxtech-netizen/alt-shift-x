import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, ArrowLeft, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import SpeakeasyVideoBackground from "@/components/speakeasy/SpeakeasyVideoBackground";
import SocialComposer from "@/components/speakeasy/social/SocialComposer";
import SocialFeedCard from "@/components/speakeasy/social/SocialFeedCard";
import SocialReplyBox from "@/components/speakeasy/social/SocialReplyBox";
import ParticipationStanding from "@/components/speakeasy/social/ParticipationStanding";
import CommunityHighlights from "@/components/speakeasy/social/CommunityHighlights";
import useParticipation from "@/hooks/useParticipation";

function SocialFeedInner() {
  const navigate = useNavigate();
  const { score, award, reload } = useParticipation();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null); // post id currently being replied to

  const load = async () => {
    const data = await base44.entities.SpeakeasyPost.list("-created_date", 100);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    load();
    const unsub = base44.entities.SpeakeasyPost.subscribe(() => load());
    return () => unsub?.();
  }, []);

  const afterAward = () => { load(); reload(); };

  const topLevel = posts.filter(p => !p.parent_id);
  const repliesByParent = posts.reduce((acc, p) => {
    if (p.parent_id) (acc[p.parent_id] = acc[p.parent_id] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen relative">
      <SpeakeasyVideoBackground />

      <header className="relative z-40 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/speakeasy/proxy-room")} className="text-[#9CA0A8] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B6FB8]/30 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C8A95B]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Feed</h1>
              <p className="text-[10px] text-[#9CA0A8] mt-0.5">A calmer social room — built for genuine connection, not endless scrolling.</p>
            </div>
          </div>
          {score && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#C8A95B] bg-black/40 border border-[#C8A95B]/20 rounded-full px-3 py-1">
              <Heart className="w-3.5 h-3.5" /> {(score.points || 0).toLocaleString()} pts · {score.level}
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Feed */}
          <div className="space-y-4">
            {user && <SocialComposer user={user} onPosted={afterAward} award={award} />}
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-[#D9DCE1]/40" /></div>
            ) : topLevel.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/[0.02]">
                <Sparkles className="w-6 h-6 text-[#C8A95B] mx-auto mb-3" />
                <p className="text-sm text-[#9CA0A8]">The room is quiet. Pour the first drink — start a conversation. 🥂</p>
              </div>
            ) : (
              topLevel.map(post => (
                <div key={post.id} className="space-y-2">
                  <SocialFeedCard post={post} currentUserId={user?.id} award={award}
                    onReply={(p) => setReplyTo(replyTo === p.id ? null : p.id)} />
                  {(repliesByParent[post.id] || []).map(reply => (
                    <div key={reply.id} className="ml-6 pl-3 border-l border-white/10">
                      <SocialFeedCard post={reply} currentUserId={user?.id} award={award} />
                    </div>
                  ))}
                  {replyTo === post.id && user && (
                    <SocialReplyBox parent={post} user={user} award={award}
                      onReplied={() => { setReplyTo(null); afterAward(); }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <ParticipationStanding score={score} />
            <CommunityHighlights />
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A95B] mb-2">How points work</p>
              <ul className="text-[11px] text-[#9CA0A8] space-y-1.5 leading-relaxed">
                <li>✍️ <strong className="text-white">+5</strong> — share a post</li>
                <li>💬 <strong className="text-white">+3</strong> — a thoughtful reply</li>
                <li>❤️ <strong className="text-white">+1</strong> — appreciate someone's post</li>
              </ul>
              <p className="text-[10px] text-[#6B6F76] mt-2.5">No streaks. No countdowns. Just genuine participation, gently recognized.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SpeakeasySocial() {
  return (
    <ProxyRoomGate>
      <SocialFeedInner />
    </ProxyRoomGate>
  );
}