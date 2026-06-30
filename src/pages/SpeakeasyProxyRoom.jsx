import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
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
  { label: "Pipelines", sublabel: "Enterprise", to: "/pipelines", accent: "#5BC8C8" },
  { label: "Home", sublabel: "Lobby", to: "/", accent: GOLD },
];

// Even horizontal spread of the gate arches across the back-wall skeleton.
const GATE_TOP = "62%";
const gateLeft = (i, n) => `${8 + (i * (84 / (n - 1)))}%`;

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
    <div className="fixed inset-0 overflow-hidden bg-[#07050b]">
      {/* Full-bleed scene */}
      <ProxyScene>
        {/* Labeled arch gates sitting in a row across the back-wall skeleton. */}
        {DOORS.map((d, i) => (
          <ProxyDoor key={d.label} style={{ left: gateLeft(i, DOORS.length), top: GATE_TOP }}
            label={d.label} sublabel={d.sublabel} accent={d.accent}
            onClick={() => navigate(d.to)} />
        ))}

        {/* Hidden scavenger fixtures */}
        {FIXTURES.map((f) => (
          <ScavengerFixture key={f.fixture_id} icon={f.icon} style={f.style}
            found={foundFixtures.includes(f.fixture_id)}
            onClick={() => inspectFixture(f.fixture_id)} />
        ))}

        {/* Live member avatars */}
        <AvatarCluster members={members} meId={me?.id} onMessage={(m) => setMsgTarget(m)} />
      </ProxyScene>

      {/* Minimal floating chrome */}
      <button onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4" /> Leave
      </button>
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 text-xs text-[#E6C878] bg-black/40 border border-[#E6C878]/25 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <Users className="w-3.5 h-3.5" /> {members.length}
      </div>
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        <SpeakeasyLogo size={26} />
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#E6C878]">The Speakeasy</p>
          <h1 className="text-base font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>Proxy Room</h1>
        </div>
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