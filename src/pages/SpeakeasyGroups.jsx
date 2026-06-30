import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import SpeakeasyVideoBackground from "@/components/speakeasy/SpeakeasyVideoBackground";
import GroupCard from "@/components/speakeasy/groups/GroupCard";
import CreateGroupDialog from "@/components/speakeasy/groups/CreateGroupDialog";

function GroupsInner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [myGroupIds, setMyGroupIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const all = await base44.entities.SpeakeasyGroup.filter({ archived: false }, "-member_count", 100);
    setGroups(all || []);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const mine = await base44.entities.SpeakeasyGroupMember.filter({ user_id: me.id });
      setMyGroupIds(mine.map((m) => m.group_id));
    } catch { /* gate handles auth */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openGroup = (g) => navigate(`/speakeasy/groups/${g.slug}`);

  return (
    <div className="min-h-screen relative">
      <SpeakeasyVideoBackground />

      <header className="relative z-40 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/speakeasy/social")} className="text-[#9CA0A8] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B6FB8]/30 to-[#C8A95B]/20 border border-white/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#C8A95B]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>Circles</h1>
              <p className="text-[10px] text-[#9CA0A8] mt-0.5">Small rooms for focused conversation — find your people.</p>
            </div>
          </div>
          {user && (
            <Button onClick={() => setCreating(true)} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 h-8 gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> New Circle
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-[#D9DCE1]/40" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Users className="w-7 h-7 text-[#C8A95B] mx-auto mb-3" />
            <p className="text-sm text-[#9CA0A8] mb-4">No circles yet. Be the first to found one.</p>
            {user && (
              <Button onClick={() => setCreating(true)} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 gap-1.5">
                <Plus className="w-4 h-4" /> Found a Circle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} joined={myGroupIds.includes(g.id)} onOpen={openGroup} />
            ))}
          </div>
        )}
      </main>

      {creating && user && (
        <CreateGroupDialog user={user} onClose={() => setCreating(false)}
          onCreated={(g) => { setCreating(false); openGroup(g); }} />
      )}
    </div>
  );
}

export default function SpeakeasyGroups() {
  return (
    <ProxyRoomGate>
      <GroupsInner />
    </ProxyRoomGate>
  );
}