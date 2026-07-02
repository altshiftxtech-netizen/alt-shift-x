import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import HallwayScene from "@/components/speakeasy/hallway/HallwayScene";
import HallwayFrame from "@/components/speakeasy/hallway/HallwayFrame";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

// Framed-picture gateways lining the corridor walls — each frame is an avenue
// to a page, the hallway equivalent of the proxy room's doors. Add more here
// as new rooms/pages open up.
const LEFT_FRAMES = [
  { label: "Circles", sublabel: "Community Groups", accent: "#8B6FB8", to: "/speakeasy/groups", top: "20%", left: "9%" },
  { label: "The Feed", sublabel: "Social", accent: GOLD, to: "/speakeasy/social", top: "46%", left: "14%" },
];
const RIGHT_FRAMES = [
  { label: "Meet", sublabel: "Live Sessions", accent: "#5EA9C8", to: "/speakeasy/meet", top: "20%", right: "9%" },
  { label: "The Room", sublabel: "Proxy Room", accent: "#e0719c", to: "/speakeasy/proxy-room", top: "46%", right: "14%" },
];

function HallwayInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#050814" }}>
      <div className="relative z-30 flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/speakeasy/proxy-room")} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to the Room
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A95B]">Expansion</p>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>The Hallway</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#C8A95B] bg-black/40 border border-[#C8A95B]/20 rounded-full px-3 py-1">
          <Users className="w-3.5 h-3.5" /> {members.length}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl h-[calc(100vh-180px)] min-h-[480px] px-4">
        <HallwayScene onDoor={() => navigate("/speakeasy/bathroom")}>
          {LEFT_FRAMES.map((f) => (
            <HallwayFrame key={f.label} side="left" label={f.label} sublabel={f.sublabel} accent={f.accent}
              onClick={() => navigate(f.to)} style={{ top: f.top, left: f.left }} />
          ))}
          {RIGHT_FRAMES.map((f) => (
            <HallwayFrame key={f.label} side="right" label={f.label} sublabel={f.sublabel} accent={f.accent}
              onClick={() => navigate(f.to)} style={{ top: f.top, right: f.right }} />
          ))}
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div className="pointer-events-auto">
              <AvatarCluster members={members} meId={me?.id} />
            </div>
          </div>
        </HallwayScene>
      </div>

      <p className="relative z-30 text-center pb-4 text-[11px] text-white/40">A quiet corridor connecting the rooms of the Speakeasy. Step through any picture to enter a room.</p>
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