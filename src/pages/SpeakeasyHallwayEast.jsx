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
  a: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/31c99b709_generated_image.png",
  b: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/6bc2448d5_generated_image.png",
  c: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/bc1013179_generated_image.png",
  d: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/ae6533818_generated_image.png",
  extraM: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/31c99b709_generated_image.png",
  extraF: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/6bc2448d5_generated_image.png",
};

const LEFT_FRAMES = [
  { label: "Pipelines", sublabel: "Enterprise", accent: "#5EA9C8", to: "/pipelines", image: FOUNDERS.a, founder: "Orrin Datamore" },
  { label: "The Table", sublabel: "Meetups", accent: "#7FB3D5", to: "/speakeasy/meet", image: FOUNDERS.b, founder: "Vera Logicson" },
  { label: "Circles", sublabel: "Groups", accent: "#6F9BC8", to: "/speakeasy/groups", image: FOUNDERS.extraM, founder: "Cassian Verge" },
];
const RIGHT_FRAMES = [
  { label: "Tutorials", sublabel: "Learn", accent: "#8B9DC8", to: "/tutorials", image: FOUNDERS.c, founder: "Soren Patchley" },
  { label: "The Room", sublabel: "Proxy Room", accent: "#A9C8E0", to: "/speakeasy/proxy-room", image: FOUNDERS.d, founder: "Nira Loopin" },
  { label: "The Feed", sublabel: "Social", accent: "#9DB8D5", to: "/speakeasy/social", image: FOUNDERS.extraF, founder: "Lira Frostwell" },
];

function HallwayEastInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#04070f" }}>
      <div className="absolute inset-0 z-10">
        <HallwayScene
          onDoor={() => navigate("/speakeasy/social")}
          wallLeft="linear-gradient(100deg, #26344a 0%, #1a2333 60%, #10151f 100%)"
          wallRight="linear-gradient(260deg, #26344a 0%, #1a2333 60%, #10151f 100%)"
        >
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

      {/* Floating chrome — matches the Proxy Room */}
      <button onClick={() => navigate("/speakeasy/proxy-room")}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4" /> Back to the Room
      </button>
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 text-xs text-[#7FB3D5] bg-black/40 border border-[#7FB3D5]/25 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <Users className="w-3.5 h-3.5" /> {members.length}
      </div>
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#7FB3D5]">Expansion</p>
        <h1 className="text-base font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The East Wing</h1>
      </div>
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