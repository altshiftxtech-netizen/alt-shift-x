import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import HallwayScene from "@/components/speakeasy/hallway/HallwayScene";
import HallwayFrame from "@/components/speakeasy/hallway/HallwayFrame";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

// The East Wing — a second, cooler-toned corridor. Same architecture as the
// main hallway, but its own set of framed gateways, founders, and accents.
const FOUNDERS = {
  a: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b20053b5a_generated_image.png",
  b: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/de6700d7f_generated_image.png",
  c: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/124ad03c2_generated_image.png",
  d: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/d04130e10_generated_image.png",
};

const LEFT_FRAMES = [
  { label: "Pipelines", sublabel: "Enterprise", accent: "#5EA9C8", to: "/pipelines", image: FOUNDERS.a, founder: "Orrin Datamore" },
  { label: "The Table", sublabel: "Meetups", accent: "#7FB3D5", to: "/speakeasy/meet", image: FOUNDERS.b, founder: "Vera Logicson" },
];
const RIGHT_FRAMES = [
  { label: "Tutorials", sublabel: "Learn", accent: "#8B9DC8", to: "/tutorials", image: FOUNDERS.c, founder: "Soren Patchley" },
  { label: "The Room", sublabel: "Proxy Room", accent: "#A9C8E0", to: "/speakeasy/proxy-room", image: FOUNDERS.d, founder: "Nira Loopin" },
];

function HallwayEastInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#04070f" }}>
      <div className="relative z-30 flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/speakeasy/proxy-room")} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to the Room
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#7FB3D5]">Expansion</p>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>The East Wing</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#7FB3D5] bg-black/40 border border-[#7FB3D5]/20 rounded-full px-3 py-1">
          <Users className="w-3.5 h-3.5" /> {members.length}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl h-[calc(100vh-180px)] min-h-[480px] px-4">
        <HallwayScene onDoor={() => navigate("/speakeasy/social")}>
          <div
            className="absolute top-[24%] left-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(34deg)", transformOrigin: "left center" }}
          >
            {LEFT_FRAMES.map((f) => (
              <HallwayFrame key={f.label} label={f.label} sublabel={f.sublabel} accent={f.accent} image={f.image} founder={f.founder} onClick={() => navigate(f.to)} />
            ))}
          </div>
          <div
            className="absolute top-[24%] right-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(-34deg)", transformOrigin: "right center" }}
          >
            {RIGHT_FRAMES.map((f) => (
              <HallwayFrame key={f.label} label={f.label} sublabel={f.sublabel} accent={f.accent} image={f.image} founder={f.founder} onClick={() => navigate(f.to)} />
            ))}
          </div>
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div className="pointer-events-auto">
              <AvatarCluster members={members} meId={me?.id} />
            </div>
          </div>
        </HallwayScene>
      </div>

      <p className="relative z-30 text-center pb-4 text-[11px] text-white/40">The cooler corridor of the Speakeasy. Step through any picture to enter a room.</p>
    </div>
  );
}

export default function SpeakeasyHallwayEast() {
  return (
    <ProxyRoomGate>
      <HallwayEastInner />
    </ProxyRoomGate>
  );
}