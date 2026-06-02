import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SpeakeasyGate from "@/components/speakeasy/SpeakeasyGate";
import SpeakeasyComposer from "@/components/speakeasy/SpeakeasyComposer";
import SpeakeasyPostCard from "@/components/speakeasy/SpeakeasyPostCard";
import SpeakeasySidebar from "@/components/speakeasy/SpeakeasySidebar";

function SpeakeasyFeed() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Group: top-level posts with their replies nested under them
  const topLevel = posts.filter(p => !p.parent_id);
  const repliesByParent = posts.reduce((acc, p) => {
    if (p.parent_id) (acc[p.parent_id] = acc[p.parent_id] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Feed */}
      <div className="space-y-4">
        {user && <SpeakeasyComposer user={user} onPosted={load} />}
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
              <SpeakeasyPostCard post={post} currentUserId={user?.id} />
              {(repliesByParent[post.id] || []).map(reply => (
                <div key={reply.id} className="ml-6 pl-3 border-l border-white/10">
                  <SpeakeasyPostCard post={reply} currentUserId={user?.id} />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <SpeakeasySidebar />
      </div>
    </div>
  );
}

export default function Speakeasy() {
  return (
    <SpeakeasyGate>
      <div className="min-h-screen bg-[#0A0A0C]">
        {/* Header */}
        <header className="border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-[#9CA0A8] hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9DCE1]/20 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#C8A95B]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Speakeasy</h1>
                <p className="text-[10px] text-[#9CA0A8] mt-0.5">A members lounge for builders · altshiftx.tech</p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0A0A0C] bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] px-2.5 py-1 rounded-full">Platinum</span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <SpeakeasyFeed />
        </main>
      </div>
    </SpeakeasyGate>
  );
}