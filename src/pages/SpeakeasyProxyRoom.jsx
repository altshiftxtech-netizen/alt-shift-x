import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Sparkles, DoorOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import ProxyScene from "@/components/speakeasy/proxy/ProxyScene";
import ProxyDoor from "@/components/speakeasy/proxy/ProxyDoor";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import ScavengerFixture from "@/components/speakeasy/proxy/ScavengerFixture";
import HuntUnlockModal from "@/components/speakeasy/proxy/HuntUnlockModal";
import MessageModal from "@/components/speakeasy/proxy/MessageModal";
import SpeakeasyLogo from "@/components/speakeasy/SpeakeasyLogo";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

// All room destinations. The two flanking the front room render as the scene's
// left/right door slots; the rest appear as quick links in the side panel.
const DOORS = [
  { label: "Marketplace", sublabel: "Components", to: "/marketplace", accent: GOLD },
  { label: "The Feed", sublabel: "Social", to: "/speakeasy/social", accent: "#8B6FB8" },
  { label: "Circles", sublabel: "Groups", to: "/speakeasy/groups", accent: "#e0719c" },
  { label: "Powder Room", sublabel: "Private", to: "/speakeasy/bathroom", accent: "#e0719c" },
  { label: "Hallway", sublabel: "Expansion", to: "/speakeasy/hallway", accent: "#8B6FB8" },
  { label: "The Table", sublabel: "Meetups", to: "/speakeasy/meet", accent: "#3fb950" },
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
    <div className="relative min-h-screen overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 20%, #15101f 0%, #0a0712 55%, #050308 100%)" }}>
      {/* Top bar */}
      <div className="relative z-30 flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Leave
        </button>
        <div className="flex items-center gap-2.5">
          <SpeakeasyLogo size={30} />
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A95B]">The Speakeasy</p>
            <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>Proxy Room</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#C8A95B] bg-black/40 border border-[#C8A95B]/20 rounded-full px-3 py-1">
          <Users className="w-3.5 h-3.5" /> {members.length}
        </div>
      </div>

      {/* Scene + controls panel */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-4 grid gap-4 items-start md:grid-cols-[1.2fr_.8fr]">
        {/* Perspective scene */}
        <ProxyScene>
          {/* Left & right door slots flanking the front room */}
          <ProxyDoor style={{ left: "6%", top: "50%" }} label={DOORS[0].label} sublabel={DOORS[0].sublabel}
            accent={DOORS[0].accent} onClick={() => navigate(DOORS[0].to)} />
          <ProxyDoor style={{ right: "8%", top: "50%" }} label={DOORS[1].label} sublabel={DOORS[1].sublabel}
            accent={DOORS[1].accent} onClick={() => navigate(DOORS[1].to)} />

          {/* Hidden scavenger fixtures */}
          {FIXTURES.map((f) => (
            <ScavengerFixture key={f.fixture_id} icon={f.icon} style={f.style}
              found={foundFixtures.includes(f.fixture_id)}
              onClick={() => inspectFixture(f.fixture_id)} />
          ))}

          {/* Live member avatars */}
          <AvatarCluster members={members} meId={me?.id} onMessage={(m) => setMsgTarget(m)} />
        </ProxyScene>

        {/* Room controls panel */}
        <aside className="rounded-[18px] overflow-hidden border border-white/10 bg-[rgba(17,17,23,0.55)] shadow-2xl md:sticky md:top-4">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2.5">
              <h2 className="text-base font-semibold text-white tracking-wide">Room Doors</h2>
              <span className="text-xs text-[#C8A95B] border border-[#C8A95B]/35 bg-[#C8A95B]/10 px-2.5 py-1.5 rounded-full">
                {members.length} present
              </span>
            </div>

            <div className="grid gap-2">
              {DOORS.map((d) => (
                <button key={d.label} onClick={() => navigate(d.to)}
                  className="flex items-center gap-3 text-left rounded-[14px] border border-white/10 bg-black/20 hover:bg-white/[0.06] px-3 py-2.5 transition-colors">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${d.accent}1a`, border: `1px solid ${d.accent}55` }}>
                    <DoorOpen className="w-4 h-4" style={{ color: d.accent }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white truncate">{d.label}</span>
                    <span className="block text-[11px] text-white/50 truncate">{d.sublabel}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="h-px bg-white/10" />

            <div className="rounded-[14px] border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] text-white/50">Hidden fixtures</p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {foundFixtures.length} of {FIXTURES.length} found
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer hint */}
      <div className="relative z-30 text-center pb-4">
        <p className="text-[11px] text-white/40 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#C8A95B]" />
          Walk the room · tap a door to explore · hover a guest to message · some fixtures hide prizes
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