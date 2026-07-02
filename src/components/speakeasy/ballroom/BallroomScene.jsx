import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";

/**
 * A full-screen palatial ballroom that lives beyond a hallway's matte black
 * back-wall door. The supplied high-res image is the immersive backdrop, framed
 * so it fills and snaps to the screen. Members appear as presence avatars on the
 * floor, and a single control returns to the originating hallway.
 */
function BallroomInner({ image, title, kicker, accent, backTo, backLabel }) {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* High-grade ballroom backdrop — cover-fit so it fills the screen */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />
      {/* subtle vignette for depth + text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)" }}
      />

      {/* Presence avatars drifting across the ballroom floor */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <AvatarCluster members={members} meId={me?.id} />
        </div>
      </div>

      {/* Floating chrome */}
      <button
        onClick={() => navigate(backTo)}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/50 border border-white/15 rounded-full px-3 py-1.5 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" /> {backLabel}
      </button>
      <div
        className="absolute top-4 right-4 z-30 flex items-center gap-1.5 text-xs bg-black/50 border rounded-full px-3 py-1.5 backdrop-blur-sm"
        style={{ color: accent, borderColor: `${accent}40` }}
      >
        <Users className="w-3.5 h-3.5" /> {members.length}
      </div>
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em]" style={{ color: accent }}>{kicker}</p>
        <h1
          className="text-base font-bold text-white leading-none"
          style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

export default function BallroomScene(props) {
  return (
    <ProxyRoomGate>
      <BallroomInner {...props} />
    </ProxyRoomGate>
  );
}