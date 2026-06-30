import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Users, Sparkles, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import PerspectiveRoom from "@/components/speakeasy/proxy/PerspectiveRoom";
import PerspectiveDoor from "@/components/speakeasy/proxy/PerspectiveDoor";
import OuterArchDoor from "@/components/speakeasy/proxy/OuterArchDoor";
import SpeakeasyBar from "@/components/speakeasy/proxy/SpeakeasyBar";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import ScavengerFixture from "@/components/speakeasy/proxy/ScavengerFixture";
import HuntUnlockModal from "@/components/speakeasy/proxy/HuntUnlockModal";
import MessageModal from "@/components/speakeasy/proxy/MessageModal";
import SpeakeasyLogo from "@/components/speakeasy/SpeakeasyLogo";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

// Inner doors line the two angled side walls, receding toward the back wall.
// `side` + `depth` (0 near → 1 far) place each door flat against its wall.
const LEFT_DOORS = [
  { label: "Circles", sublabel: "Groups", to: "/speakeasy/groups", accent: "#e0719c", depth: 0.15 },
  { label: "Hallway", sublabel: "Expansion", to: "/speakeasy/hallway", accent: "#8B6FB8", depth: 0.85 },
];
const RIGHT_DOORS = [
  { label: "Powder Room", sublabel: "Private", to: "/speakeasy/bathroom", accent: "#e0719c", depth: 0.15 },
  { label: "The Table", sublabel: "Meetups", to: "/speakeasy/meet", accent: "#3fb950", depth: 0.85 },
];

// Marketplace & The Feed sit as large framed archways on the flat OUTER walls,
// flanking the perspective box — exactly like the draft.
const OUTER_DOORS = [
  { label: "Marketplace", sublabel: "Components", to: "/marketplace", accent: GOLD, side: "left" },
  { label: "The Feed", sublabel: "Social", to: "/speakeasy/social", accent: "#8B6FB8", side: "right" },
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

      {/* Stage: two outer archways flanking the central perspective box */}
      <div className="relative z-10 mx-auto max-w-7xl h-[calc(100vh-150px)] min-h-[520px] flex items-center gap-2 sm:gap-4 px-3">
        {/* Marketplace — flat outer-left wall */}
        <div className="hidden md:flex flex-shrink-0">
          {OUTER_DOORS.filter((d) => d.side === "left").map((d) => (
            <OuterArchDoor key={d.label} label={d.label} sublabel={d.sublabel} accent={d.accent}
              onClick={() => navigate(d.to)} />
          ))}
        </div>

        {/* The 3D perspective room box */}
        <div className="relative flex-1 h-full min-w-0">
          <PerspectiveRoom>
            {/* Top-center exit portal on the back wall */}
            <button onClick={() => navigate(-1)} aria-label="Exit"
              className="group absolute left-1/2 -translate-x-1/2 top-[8%] w-12 h-12 rounded-lg border-2 z-20 transition-all hover:brightness-125"
              style={{ borderColor: GOLD, background: "rgba(8,6,12,0.9)", boxShadow: `0 0 24px ${GOLD}66` }}>
              <span className="absolute inset-1.5 rounded-md border" style={{ borderColor: `${GOLD}55` }} />
            </button>

            {/* Inner doors lining the two angled side walls */}
            {LEFT_DOORS.map((d) => (
              <PerspectiveDoor key={d.label} side="left" depth={d.depth}
                label={d.label} sublabel={d.sublabel} accent={d.accent}
                onClick={() => navigate(d.to)} />
            ))}
            {RIGHT_DOORS.map((d) => (
              <PerspectiveDoor key={d.label} side="right" depth={d.depth}
                label={d.label} sublabel={d.sublabel} accent={d.accent}
                onClick={() => navigate(d.to)} />
            ))}

            {/* Central bar + barkeeper */}
            <SpeakeasyBar />

            {/* Hidden scavenger fixtures */}
            {FIXTURES.map((f) => (
              <ScavengerFixture key={f.fixture_id} icon={f.icon} style={f.style}
                found={foundFixtures.includes(f.fixture_id)}
                onClick={() => inspectFixture(f.fixture_id)} />
            ))}

            {/* Live member avatars */}
            <AvatarCluster members={members} meId={me?.id} onMessage={(m) => setMsgTarget(m)} />
          </PerspectiveRoom>
        </div>

        {/* The Feed — flat outer-right wall */}
        <div className="hidden md:flex flex-shrink-0">
          {OUTER_DOORS.filter((d) => d.side === "right").map((d) => (
            <OuterArchDoor key={d.label} label={d.label} sublabel={d.sublabel} accent={d.accent}
              onClick={() => navigate(d.to)} />
          ))}
        </div>
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