import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import ProxyScene from "@/components/speakeasy/proxy/ProxyScene";
import ProxyBar from "@/components/speakeasy/proxy/ProxyBar";
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
// Uniform gold-cream frame for every doorway, matching the reference art.
const FRAME = "#D8C18A";

// Fancy ballroom founder portraits, one unique painting per poster.
const PORTRAITS = [
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b9853d6ba_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/44f47ed67_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/c54413bd4_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/d53c9d278_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/a916ad0b2_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/e583d06f8_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/cdb3ba45f_generated_image.png",
  "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/0d65c0a7a_generated_image.png",
];

// Each gate is placed to sit in the room's perspective:
//  • Back-wall gates fill the four recessed doorway slots flanking the bar.
//  • Side-wall gates are skewed + scaled to recede along the angled walls.
const DOORS = [
  // ── Left side wall — Tutorials & Hallway, skewed into the wall perspective ──
  { label: "Tutorials", sublabel: "Learn", to: "/tutorials",
    style: { left: "5%", top: "48%" }, tilt: "perspective(700px) rotateY(38deg) scale(0.92)", image: PORTRAITS[0] },
  { label: "Hallway", sublabel: "Expansion", to: "/speakeasy/hallway",
    style: { left: "18%", top: "46%" }, tilt: "perspective(700px) rotateY(38deg) scale(0.8)", image: PORTRAITS[1] },
  // ── Back wall — four small doorway slots flanking the bar ──
  { label: "Market", sublabel: "Components", to: "/marketplace",
    style: { left: "30%", top: "26%" }, tilt: "scale(0.56)", image: PORTRAITS[2] },
  { label: "The Feed", sublabel: "Social", to: "/speakeasy/social",
    style: { left: "39%", top: "26%" }, tilt: "scale(0.56)", image: PORTRAITS[3] },
  { label: "Circles", sublabel: "Groups", to: "/speakeasy/groups",
    style: { left: "61%", top: "26%" }, tilt: "scale(0.56)", image: PORTRAITS[4] },
  { label: "Powder Room", sublabel: "Private", to: "/speakeasy/bathroom",
    style: { left: "70%", top: "26%" }, tilt: "scale(0.56)", image: PORTRAITS[5] },
  // ── Right side wall — mirror of the left ──
  { label: "Pipelines", sublabel: "Enterprise", to: "/pipelines",
    style: { left: "82%", top: "46%" }, tilt: "perspective(700px) rotateY(-38deg) scale(0.8)", image: PORTRAITS[6] },
  { label: "The Table", sublabel: "Meetups", to: "/speakeasy/meet",
    style: { left: "95%", top: "48%" }, tilt: "perspective(700px) rotateY(-38deg) scale(0.92)", image: PORTRAITS[7] },
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
    <div className="fixed inset-0 overflow-hidden bg-[#07050b]">
      {/* Full-bleed scene */}
      <ProxyScene>
        {/* Freestanding bar — the room's centerpiece, sitting on the floor up front. */}
        <ProxyBar style={{ left: "50%", bottom: "10%" }} />

        {/* Gates placed in the room's perspective — back wall + angled side walls. */}
        {DOORS.map((d) => (
          <ProxyDoor key={d.label} style={d.style} tilt={d.tilt} image={d.image}
            label={d.label} sublabel={d.sublabel} accent={FRAME}
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

        {/* Elegant gold arrows pointing to the Hallway doorways on each side wall */}
        <div className="absolute z-20 pointer-events-none flex flex-col items-center gap-1" style={{ left: "4%", top: "82%" }}>
          <svg width="76" height="26" viewBox="0 0 76 26" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(230,200,120,0.6))" }}>
            <path d="M74 13 H14" stroke="#E6C878" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 4 L6 13 L22 22" stroke="#E6C878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#E6C878]" style={{ fontFamily: "'Playfair Display', serif" }}>Hallway</span>
        </div>
        <div className="absolute z-20 pointer-events-none flex flex-col items-center gap-1" style={{ right: "4%", top: "82%" }}>
          <svg width="76" height="26" viewBox="0 0 76 26" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(230,200,120,0.6))" }}>
            <path d="M2 13 H62" stroke="#E6C878" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 4 L70 13 L54 22" stroke="#E6C878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#E6C878]" style={{ fontFamily: "'Playfair Display', serif" }}>Hallway</span>
        </div>
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