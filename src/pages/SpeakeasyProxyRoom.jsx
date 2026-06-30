import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Users, Sparkles, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import ProxyDoor from "@/components/speakeasy/proxy/ProxyDoor";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import ScavengerFixture from "@/components/speakeasy/proxy/ScavengerFixture";
import HuntUnlockModal from "@/components/speakeasy/proxy/HuntUnlockModal";
import MessageModal from "@/components/speakeasy/proxy/MessageModal";
import RoomWallpaper from "@/components/speakeasy/RoomWallpaper";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

// The feature doors along the back wall. These map to existing routes so there
// are no 404s. The room/hallway/bathroom are placeholders within this page for now.
const FEATURE_DOORS = [
  { label: "Marketplace", sublabel: "Components", to: "/marketplace", accent: GOLD },
  { label: "Social", sublabel: "The Feed", to: "/speakeasy/social", accent: "#8B6FB8" },
  { label: "Circles", sublabel: "Groups", to: "/speakeasy/groups", accent: "#e0719c" },
  { label: "The Table", sublabel: "Meetups", to: "/speakeasy/meet", accent: "#3fb950" },
  { label: "Pipelines", sublabel: "Enterprise", to: "/pipelines", accent: "#4169e1" },
];

// Hidden scavenger fixtures. fixture_id must match a SpeakeasyHuntItem record
// for a real prize; unmatched clicks gracefully report "nothing here yet".
const FIXTURES = [
  { fixture_id: "bar-mirror", icon: "🪞", style: { left: "72%", top: "30%" } },
  { fixture_id: "wall-painting", icon: "🖼️", style: { left: "20%", top: "26%" } },
  { fixture_id: "chandelier-gem", icon: "💎", style: { left: "50%", top: "12%" } },
  { fixture_id: "floor-coin", icon: "🪙", style: { left: "38%", top: "82%" } },
];

function ProxyRoomInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("proxy_room");

  const [huntOpen, setHuntOpen] = useState(false);
  const [huntState, setHuntState] = useState("claiming"); // claiming | success | already | error
  const [huntResult, setHuntResult] = useState(null);
  const [foundFixtures, setFoundFixtures] = useState([]);

  const [msgTarget, setMsgTarget] = useState(null);

  // Load which fixtures this member has already found (so they render as found).
  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const finds = await base44.entities.SpeakeasyHuntFind.filter({ user_id: user.id });
        setFoundFixtures(finds.map((f) => f.fixture_id));
      } catch { /* guest/free never reaches here past the gate */ }
    })();
  }, []);

  const inspectFixture = async (fixture_id) => {
    setHuntResult(null);
    setHuntState("claiming");
    setHuntOpen(true);
    try {
      const res = await base44.functions.invoke("claimHuntItem", { fixture_id });
      const data = res.data || {};
      if (data.error) {
        setHuntState("error");
        setHuntResult({ message: "Nothing hidden here… for now." });
        return;
      }
      if (data.already_claimed) {
        setHuntState("already");
        setHuntResult(data);
      } else {
        setHuntState("success");
        setHuntResult(data);
        setFoundFixtures((prev) => [...new Set([...prev, fixture_id])]);
      }
    } catch {
      setHuntState("error");
      setHuntResult({ message: "Nothing hidden here… for now." });
    }
  };

  const sendNote = async (target, text) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.SpeakeasyPost.create({
        author_id: user.id,
        author_name: user.full_name || user.email,
        post_type: "text",
        content: `@${target.user_name} ${text}`,
      });
    } catch { /* best-effort */ }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <RoomWallpaper room="proxy_room" />
      {/* Ambient gold vignette + floor */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 65%, rgba(200,169,91,0.10), transparent 60%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, rgba(200,169,91,0.06))", borderTop: "1px solid rgba(200,169,91,0.15)" }} />

      {/* Top bar */}
      <div className="relative z-30 flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Leave
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A95B]">The Speakeasy</p>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Proxy Room</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#C8A95B] bg-black/40 border border-[#C8A95B]/20 rounded-full px-3 py-1">
          <Users className="w-3.5 h-3.5" /> {members.length}
        </div>
      </div>

      {/* Room stage */}
      <div className="relative z-10 mx-auto max-w-5xl h-[calc(100vh-180px)] min-h-[460px] px-4">
        {/* Back-wall feature doors */}
        <ProxyDoor label="Hallway" sublabel="Expansion" accent="#8B6FB8"
          onClick={() => navigate("/speakeasy/hallway")}
          style={{ left: "4%", top: "34%" }} />
        <ProxyDoor label="Bathroom" sublabel="Private" accent={GOLD}
          onClick={() => navigate("/speakeasy/bathroom")}
          style={{ right: "4%", top: "34%", left: "auto" }} />

        <div className="absolute left-1/2 top-[20%] -translate-x-1/2 flex items-end gap-5 sm:gap-10">
          {FEATURE_DOORS.map((d) => (
            <ProxyDoor key={d.label} label={d.label} sublabel={d.sublabel} accent={d.accent}
              onClick={() => navigate(d.to)} style={{ position: "relative", left: 0, top: 0 }} />
          ))}
        </div>

        {/* The bar */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-64 sm:w-80 h-16 rounded-xl"
          style={{ background: "linear-gradient(180deg, #2a2018, #15100a)", border: "1px solid rgba(200,169,91,0.4)", boxShadow: "0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(200,169,91,0.3)" }}>
          <p className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[#C8A95B]/60" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Bar
          </p>
        </div>

        {/* Hidden scavenger fixtures */}
        {FIXTURES.map((f) => (
          <ScavengerFixture key={f.fixture_id} icon={f.icon} style={f.style}
            found={foundFixtures.includes(f.fixture_id)}
            onClick={() => inspectFixture(f.fixture_id)} />
        ))}

        {/* Live member avatars */}
        <AvatarCluster members={members} meId={me?.id} onMessage={(m) => setMsgTarget(m)} />
      </div>

      {/* Footer hint */}
      <div className="relative z-30 text-center pb-4">
        <p className="text-[11px] text-white/40 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#C8A95B]" />
          Tap the doors to explore · hover a guest to message · some fixtures hide prizes
        </p>
      </div>

      <HuntUnlockModal open={huntOpen} state={huntState} result={huntResult} onClose={() => setHuntOpen(false)} />
      <MessageModal open={!!msgTarget} target={msgTarget} onClose={() => setMsgTarget(null)} onSend={sendNote} />
    </div>
  );
}

export default function SpeakeasyProxyRoom() {
  return (
    <ProxyRoomGate>
      <ProxyRoomInner />
    </ProxyRoomGate>
  );
}