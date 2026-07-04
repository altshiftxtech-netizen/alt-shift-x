import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import HallwayScene from "@/components/speakeasy/hallway/HallwayScene";
import HallwayFrame from "@/components/speakeasy/hallway/HallwayFrame";
import PortraitModal from "@/components/speakeasy/hallway/PortraitModal";
import { WING_A } from "@/components/speakeasy/hallway/portraitRegistry";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

// West Wing = Hallway A → portraits P1–P6 from the registry, split across the
// two corridor walls.
const LEFT_FRAMES = WING_A.slice(0, 3);
const RIGHT_FRAMES = WING_A.slice(3, 6);

function HallwayInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");
  const [selected, setSelected] = useState(null);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#050814" }}>
      <div className="absolute inset-0 z-10">
        <HallwayScene
          onDoor={() => navigate("/speakeasy/ballroom")}
          doorLabel="Ballroom"
          wallLeft="linear-gradient(100deg, #3a2a1a 0%, #241a10 60%, #140d07 100%)"
          wallRight="linear-gradient(260deg, #3a2a1a 0%, #241a10 60%, #140d07 100%)"
        >
          {/* Left wall — a row of frames tilted into the corridor perspective */}
          <div
            className="absolute top-[24%] left-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(34deg)", transformOrigin: "left center" }}
          >
            {LEFT_FRAMES.map((f) => (
              <HallwayFrame key={f.id} label={f.label} sublabel={f.feature.split(" — ")[0]} accent={f.accent} image={f.image} founder={f.founder}
                hoverPrice={f.gate ? "Vault Access" : f.price === 0 ? "Free" : `$${f.price}/mo`} hoverFeature={f.feature}
                onClick={() => setSelected(f)} />
            ))}
          </div>
          {/* Right wall — mirror tilt */}
          <div
            className="absolute top-[24%] right-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(-34deg)", transformOrigin: "right center" }}
          >
            {RIGHT_FRAMES.map((f) => (
              <HallwayFrame key={f.id} label={f.label} sublabel={f.feature.split(" — ")[0]} accent={f.accent} image={f.image} founder={f.founder}
                hoverPrice={f.gate ? "Vault Access" : f.price === 0 ? "Free" : `$${f.price}/mo`} hoverFeature={f.feature}
                onClick={() => setSelected(f)} />
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
        <h1 className="text-base font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>West Wing</h1>
      </div>

      {selected && <PortraitModal portrait={selected} onClose={() => setSelected(null)} />}
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