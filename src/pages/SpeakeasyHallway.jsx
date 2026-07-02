import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import HallwayScene from "@/components/speakeasy/hallway/HallwayScene";
import HallwayFrame from "@/components/speakeasy/hallway/HallwayFrame";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

// Framed-picture gateways lining the corridor walls — each frame is an avenue
// to a page, the hallway equivalent of the proxy room's doors. Add more here
// as new rooms/pages open up.
// Founder portraits (BOB-style builders on the left, Upkeeper-style masters on the right).
const FOUNDERS = {
  bobA: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/ae6533818_generated_image.png",
  bobB: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/bc1013179_generated_image.png",
  keeperA: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/31c99b709_generated_image.png",
  keeperB: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/6bc2448d5_generated_image.png",
  extraM: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/ae6533818_generated_image.png",
  extraF: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/6bc2448d5_generated_image.png",
};

const LEFT_FRAMES = [
  { label: "Circles", sublabel: "Community Groups", accent: "#8B6FB8", to: "/speakeasy/groups", image: FOUNDERS.bobA, founder: "Elias Bytewell" },
  { label: "The Feed", sublabel: "Social", accent: GOLD, to: "/speakeasy/social", image: FOUNDERS.bobB, founder: "Marin Codell" },
  { label: "Market", sublabel: "Components", accent: "#C89B5E", to: "/marketplace", image: FOUNDERS.extraM, founder: "Dorian Stackwell" },
];
const RIGHT_FRAMES = [
  { label: "Meet", sublabel: "Live Sessions", accent: "#5EA9C8", to: "/speakeasy/meet", image: FOUNDERS.keeperA, founder: "Thane Circuit" },
  { label: "The Room", sublabel: "Proxy Room", accent: "#e0719c", to: "/speakeasy/proxy-room", image: FOUNDERS.keeperB, founder: "Jax Kernel" },
  { label: "Tutorials", sublabel: "Learn", accent: "#B87FB8", to: "/tutorials", image: FOUNDERS.extraF, founder: "Isolde Cachet" },
];

function HallwayInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#050814" }}>
      <div className="absolute inset-0 z-10">
        <HallwayScene
          onDoor={() => navigate("/speakeasy/ballroom")}
          wallLeft="linear-gradient(100deg, #3a2a1a 0%, #241a10 60%, #140d07 100%)"
          wallRight="linear-gradient(260deg, #3a2a1a 0%, #241a10 60%, #140d07 100%)"
        >
          {/* Left wall — a row of frames tilted into the corridor perspective */}
          <div
            className="absolute top-[24%] left-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(34deg)", transformOrigin: "left center" }}
          >
            {LEFT_FRAMES.map((f) => (
              <HallwayFrame key={f.label} label={f.label} sublabel={f.sublabel} accent={f.accent} image={f.image} founder={f.founder} onClick={() => navigate(f.to)} />
            ))}
          </div>
          {/* Right wall — mirror tilt */}
          <div
            className="absolute top-[24%] right-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(-34deg)", transformOrigin: "right center" }}
          >
            {RIGHT_FRAMES.map((f) => (
              <HallwayFrame key={f.label} label={f.label} sublabel={f.sublabel} accent={f.accent} image={f.image} founder={f.founder} onClick={() => navigate(f.to)} />
            ))}
          </div>
        </HallwayScene>
      </div>

      {/* Floating chrome — matches the Proxy Room */}
      <button onClick={() => navigate("/speakeasy/proxy-room")}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4" /> Back to the Room
      </button>
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 text-xs text-[#C8A95B] bg-black/40 border border-[#C8A95B]/25 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <Users className="w-3.5 h-3.5" /> {members.length}
      </div>
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#C8A95B]">Expansion</p>
        <h1 className="text-base font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Hallway</h1>
      </div>
    </div>
  );
}

export default function SpeakeasyHallway() {
  return (
    <ProxyRoomGate>
      <HallwayInner />
    </ProxyRoomGate>
  );
}