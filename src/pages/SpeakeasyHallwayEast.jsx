import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import HallwayScene from "@/components/speakeasy/hallway/HallwayScene";
import HallwayFrame from "@/components/speakeasy/hallway/HallwayFrame";
import PortraitModal from "@/components/speakeasy/hallway/PortraitModal";
import FounderLoreBar from "@/components/speakeasy/lore/FounderLoreBar";
import DirectorsCutReader from "@/components/speakeasy/lore/DirectorsCutReader";
import { getLore } from "@/components/speakeasy/lore/founderLore";
import { WING_B } from "@/components/speakeasy/hallway/portraitRegistry";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";
import useFounderLore from "@/hooks/useFounderLore";
import useSovereignAccess from "@/hooks/useSovereignAccess";

// East Wing = Hallway B → portraits P7–P12. Elias Bytewell (P12) is pulled out
// to sit at the far end, larger and gold-trimmed.
const ELIAS = WING_B[WING_B.length - 1];
const LEFT_FRAMES = WING_B.slice(0, 3);        // P7–P9
const RIGHT_FRAMES = WING_B.slice(3, 5);       // P10–P11 (Elias mounts on the right wall too)

function HallwayEastInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");
  const [selected, setSelected] = useState(null);
  const { loreUnlocked, cinemaUnlocked } = useFounderLore();
  const { status } = useSovereignAccess();
  const isSovereign = status === "sovereign";
  const [directorMode, setDirectorMode] = useState(false);
  const wingFounders = WING_B.map((p) => p.founder);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#04070f" }}>
      <div className="absolute inset-0 z-10">
        <HallwayScene
          onDoor={() => navigate("/biz-center")}
          doorLabel="Business Center"
          wallLeft="linear-gradient(100deg, #26344a 0%, #1a2333 60%, #10151f 100%)"
          wallRight="linear-gradient(260deg, #26344a 0%, #1a2333 60%, #10151f 100%)"
        >
          <div
            className="absolute top-[24%] left-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(34deg)", transformOrigin: "left center" }}
          >
            {LEFT_FRAMES.map((f) => (
              <HallwayFrame key={f.id} label={f.label} sublabel={f.feature.split(" — ")[0]} accent={f.accent} image={f.image} founder={f.founder}
                hoverPrice={f.price === 0 ? "Free" : `$${f.price}/mo`} hoverFeature={f.feature}
                riddle={loreUnlocked ? getLore(f.founder).riddle : undefined}
                onClick={() => setSelected(f)} />
            ))}
          </div>
          <div
            className="absolute top-[24%] right-[2%] flex gap-4 sm:gap-6 items-start"
            style={{ transform: "perspective(900px) rotateY(-34deg)", transformOrigin: "right center" }}
          >
            {RIGHT_FRAMES.map((f) => (
              <HallwayFrame key={f.id} label={f.label} sublabel={f.feature.split(" — ")[0]} accent={f.accent} image={f.image} founder={f.founder}
                hoverPrice={f.price === 0 ? "Free" : `$${f.price}/mo`} hoverFeature={f.feature}
                riddle={loreUnlocked ? getLore(f.founder).riddle : undefined}
                onClick={() => setSelected(f)} />
            ))}
            {/* Elias Bytewell — the crown-jewel portrait mounts on the wall alongside
                its neighbors, with a larger gold-trim halo. Hides the free Legacy Kit
                behind the "eb" keystroke. */}
            <div style={{ filter: `drop-shadow(0 0 24px ${ELIAS.accent}88)` }}>
              <HallwayFrame label={ELIAS.label} sublabel={ELIAS.feature.split(" — ")[0]} accent={ELIAS.accent} image={ELIAS.image} founder={ELIAS.founder}
                hoverPrice={`$${ELIAS.price}/mo`} hoverFeature={ELIAS.feature}
                riddle={loreUnlocked ? getLore(ELIAS.founder).riddle : undefined}
                onClick={() => setSelected(ELIAS)} />
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
        <h1 className="text-base font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>East Wing</h1>
      </div>

      {/* FounderLore action bar — unlock history + Director's Cut (Sovereign) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full px-4">
        <FounderLoreBar
          loreUnlocked={loreUnlocked}
          cinemaUnlocked={cinemaUnlocked}
          isSovereign={isSovereign}
          directorMode={directorMode}
          onToggleDirector={() => setDirectorMode((v) => !v)}
        />
      </div>

      {selected && <PortraitModal portrait={selected} onClose={() => setSelected(null)} />}
      {directorMode && <DirectorsCutReader founders={wingFounders} onClose={() => setDirectorMode(false)} />}
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