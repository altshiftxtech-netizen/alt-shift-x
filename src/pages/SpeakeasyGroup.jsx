import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Loader2, LogIn, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import SpeakeasyVideoBackground from "@/components/speakeasy/SpeakeasyVideoBackground";
import SocialFeedStream from "@/components/speakeasy/social/SocialFeedStream";
import LevelUpCelebration from "@/components/speakeasy/social/LevelUpCelebration";
import useParticipation from "@/hooks/useParticipation";

function GroupInner() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { score, award, reload, leveledUpTo, clearLevelUp } = useParticipation();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const rows = await base44.entities.SpeakeasyGroup.filter({ slug });
    const g = rows[0] || null;
    setGroup(g);
    try {
      const me = await base44.auth.me();
      setUser(me);
      if (g) {
        const mine = await base44.entities.SpeakeasyGroupMember.filter({ group_id: g.id, user_id: me.id });
        setMembership(mine[0] || null);
      }
    } catch { /* gate handles auth */ }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  const join = async () => {
    if (!user || !group || busy) return;
    setBusy(true);
    const m = await base44.entities.SpeakeasyGroupMember.create({
      group_id: group.id, group_slug: group.slug, user_id: user.id,
      user_name: user.full_name || user.email, joined_at: new Date().toISOString(),
    });
    await base44.entities.SpeakeasyGroup.update(group.id, { member_count: (group.member_count || 0) + 1 });
    setMembership(m);
    setGroup({ ...group, member_count: (group.member_count || 0) + 1 });
    setBusy(false);
  };

  const leave = async () => {
    if (!membership || busy) return;
    setBusy(true);
    await base44.entities.SpeakeasyGroupMember.delete(membership.id);
    await base44.entities.SpeakeasyGroup.update(group.id, { member_count: Math.max(0, (group.member_count || 1) - 1) });
    setMembership(null);
    setGroup({ ...group, member_count: Math.max(0, (group.member_count || 1) - 1) });
    setBusy(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center relative"><SpeakeasyVideoBackground /><Loader2 className="relative z-10 w-6 h-6 animate-spin text-[#C8A95B]/60" /></div>;
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-6">
        <SpeakeasyVideoBackground />
        <div className="relative z-10 text-center">
          <p className="text-sm text-[#9CA0A8] mb-4">This circle doesn't exist.</p>
          <Button onClick={() => navigate("/speakeasy/groups")} variant="outline" className="border-white/20 text-white">Back to Circles</Button>
        </div>
      </div>
    );
  }

  const accent = group.accent || "#C8A95B";

  return (
    <div className="min-h-screen relative">
      <SpeakeasyVideoBackground />

      <header className="relative z-40 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate("/speakeasy/groups")} className="text-[#9CA0A8] hover:text-white transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border border-white/10"
              style={{ background: `linear-gradient(135deg, ${accent}33, transparent)` }}>{group.emoji || "🛋️"}</div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white leading-none truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{group.name}</h1>
              <p className="text-[10px] text-[#9CA0A8] mt-0.5 flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count || 0} members</p>
            </div>
          </div>
          {user && (
            membership ? (
              <Button onClick={leave} disabled={busy} variant="outline" className="border-white/15 text-[#9CA0A8] hover:text-white h-8 gap-1.5 text-xs">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />} Leave
              </Button>
            ) : (
              <Button onClick={join} disabled={busy} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 h-8 gap-1.5 text-xs">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />} Join
              </Button>
            )
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {group.description && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 mb-4">
            <p className="text-sm text-[#D2D5DA] leading-relaxed">{group.description}</p>
            <p className="text-[10px] text-[#6B6F76] mt-2">Founded by {group.created_by_name || "a member"}</p>
          </div>
        )}

        {membership ? (
          <SocialFeedStream
            user={user}
            groupId={group.id}
            award={award}
            onActivity={reload}
            emptyText="No posts in this circle yet. Start the conversation. 🥂"
          />
        ) : (
          <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Heart className="w-6 h-6 text-[#C8A95B] mx-auto mb-3" />
            <p className="text-sm text-[#9CA0A8] mb-4">Join this circle to read and join the conversation.</p>
            {user && (
              <Button onClick={join} disabled={busy} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 gap-1.5">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Join Circle
              </Button>
            )}
          </div>
        )}
      </main>

      {leveledUpTo && <LevelUpCelebration level={leveledUpTo} onClose={clearLevelUp} />}
    </div>
  );
}

export default function SpeakeasyGroup() {
  return (
    <ProxyRoomGate>
      <GroupInner />
    </ProxyRoomGate>
  );
}