import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import ProxyDoor from "@/components/speakeasy/proxy/ProxyDoor";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

const GOLD = "#C8A95B";

function HallwayInner() {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)" }}>
      {/* Gold sconce glow down the sides */}
      <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none" style={{ background: "radial-gradient(circle at 0% 40%, rgba(200,169,91,0.12), transparent 70%)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 40%, rgba(139,71,137,0.14), transparent 70%)" }} />

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

      <div className="relative z-10 mx-auto max-w-4xl h-[calc(100vh-180px)] min-h-[460px] px-4">
        {/* Three TBD expansion doors */}
        <ProxyDoor label="Room A" sublabel="Coming Soon" accent="#555" onClick={() => {}} style={{ left: "6%", top: "30%" }} />
        <ProxyDoor label="Room B" sublabel="Coming Soon" accent="#555" onClick={() => {}} style={{ right: "6%", top: "30%", left: "auto" }} />
        <ProxyDoor label="Room C" sublabel="Coming Soon" accent="#555" onClick={() => {}} style={{ left: "50%", top: "16%", transform: "translateX(-50%)" }} />

        {/* Lounge seating area */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[20%] flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-16 h-12 rounded-xl rounded-b-sm" style={{ background: "linear-gradient(180deg, #241b2e, #15101c)", border: "1px solid rgba(200,169,91,0.25)" }} />
          ))}
        </div>
        <p className="absolute left-1/2 -translate-x-1/2 bottom-[14%] text-[10px] uppercase tracking-[0.3em] text-[#C8A95B]/50">Lounge</p>

        <AvatarCluster members={members} meId={me?.id} />
      </div>

      <p className="relative z-30 text-center pb-4 text-[11px] text-white/40">A quiet corridor. More doors are being built.</p>
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