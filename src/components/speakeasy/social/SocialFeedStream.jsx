import React, { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SocialComposer from "@/components/speakeasy/social/SocialComposer";
import SocialFeedCard from "@/components/speakeasy/social/SocialFeedCard";
import SocialReplyBox from "@/components/speakeasy/social/SocialReplyBox";

/**
 * The shared post stream — composer + threaded feed + reactions/replies.
 * Used by both the main Feed and by group circles. When `groupId` is set the
 * stream is scoped to that circle; otherwise it shows the main public Feed
 * (posts with no group_id).
 */
export default function SocialFeedStream({ user, groupId = null, award, onActivity, emptyText }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);

  const load = async () => {
    const query = groupId ? { group_id: groupId } : {};
    let data = await base44.entities.SpeakeasyPost.filter(query, "-created_date", 100);
    // The main Feed must exclude group posts (filter can't express "field absent").
    if (!groupId) data = (data || []).filter((p) => !p.group_id);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.SpeakeasyPost.subscribe(() => load());
    return () => unsub?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const afterAward = () => { load(); onActivity?.(); };

  const topLevel = posts.filter((p) => !p.parent_id);
  const repliesByParent = posts.reduce((acc, p) => {
    if (p.parent_id) (acc[p.parent_id] = acc[p.parent_id] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {user && <SocialComposer user={user} groupId={groupId} onPosted={afterAward} award={award} />}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-[#D9DCE1]/40" /></div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/[0.02]">
          <Sparkles className="w-6 h-6 text-[#C8A95B] mx-auto mb-3" />
          <p className="text-sm text-[#9CA0A8]">{emptyText || "The room is quiet. Pour the first drink — start a conversation. 🥂"}</p>
        </div>
      ) : (
        topLevel.map((post) => (
          <div key={post.id} className="space-y-2">
            <SocialFeedCard post={post} currentUserId={user?.id} award={award}
              onReply={(p) => setReplyTo(replyTo === p.id ? null : p.id)} />
            {(repliesByParent[post.id] || []).map((reply) => (
              <div key={reply.id} className="ml-6 pl-3 border-l border-white/10">
                <SocialFeedCard post={reply} currentUserId={user?.id} award={award} />
              </div>
            ))}
            {replyTo === post.id && user && (
              <SocialReplyBox parent={post} user={user} groupId={groupId} award={award}
                onReplied={() => { setReplyTo(null); afterAward(); }} />
            )}
          </div>
        ))
      )}
    </div>
  );
}