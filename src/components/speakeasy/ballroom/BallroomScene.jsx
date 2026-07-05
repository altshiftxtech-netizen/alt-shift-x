import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import AvatarCluster from "@/components/speakeasy/proxy/AvatarCluster";
import useSpeakeasyPresence from "@/hooks/useSpeakeasyPresence";
import Gen2LineagePanel from "@/components/speakeasy/ballroom/Gen2LineagePanel";

/**
 * A full-screen palatial ballroom that lives beyond a hallway's matte black
 * back-wall door. The supplied high-res image is the immersive backdrop, framed
 * so it fills and snaps to the screen. Members appear as presence avatars on the
 * floor, and a single control returns to the originating hallway.
 */
function BallroomInner({ image, title, kicker, accent, backTo, backLabel, showVault }) {
  const navigate = useNavigate();
  const { members, me } = useSpeakeasyPresence("hallway");
  const [vaultOpen, setVaultOpen] = useState(false);

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

      {/* Clickable door over the ballroom's back-wall door — opens the Gen-2 Vault */}
      {showVault && (
        <button
          onClick={() => setVaultOpen(true)}
          className="group absolute z-30 flex flex-col items-center focus:outline-none"
          style={{ left: "50%", top: "42%", transform: "translate(-50%, -50%)" }}
        >
          {/* Door hotspot — a warm glow that intensifies on hover */}
          <div
            className="rounded-md transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(200,169,91,0.55)]"
            style={{
              width: "clamp(90px, 14vw, 170px)",
              height: "clamp(150px, 24vw, 300px)",
              background: "rgba(200,169,91,0.06)",
              border: "1px solid rgba(200,169,91,0.25)",
              boxShadow: "0 0 20px rgba(200,169,91,0.2)",
            }}
          />
          {/* "Gen-2 Vault" label below the door */}
          <div
            className="mt-3 rounded-full border px-4 py-1.5 backdrop-blur-md transition-transform group-hover:scale-105"
            style={{ background: "rgba(20,16,11,0.85)", borderColor: "#C8A95B66", color: "#E6C878", boxShadow: "0 0 24px rgba(200,169,91,0.25)" }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
              Gen-2 Vault
            </span>
          </div>
        </button>
      )}

      {/* The Gen-2 Vault — the Speakeasy & Barkeep component lineage */}
      {showVault && <Gen2LineagePanel open={vaultOpen} onClose={() => setVaultOpen(false)} />}
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