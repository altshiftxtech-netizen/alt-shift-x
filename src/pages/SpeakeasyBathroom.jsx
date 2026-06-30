import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, BookOpen, LifeBuoy } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import KeeperNotebook from "@/components/speakeasy/proxy/KeeperNotebook";
import RoomWallpaper from "@/components/speakeasy/RoomWallpaper";

// Static community resources surfaced on the bathroom "notice board".
const NOTICE_LINKS = [
  { label: "Community Guidelines", icon: BookOpen, to: "/legal/acceptable-use" },
  { label: "Support & Contact", icon: LifeBuoy, to: "/contact" },
];

function BathroomInner() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen">
      <RoomWallpaper room="bathroom" overlay="heavy" />
      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/speakeasy/proxy-room")} className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to the Room
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A95B]">Private</p>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>The Powder Room</h1>
        </div>
        <span className="w-16" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-8">
        {/* Keeper greeting */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8973f] flex items-center justify-center text-white text-lg flex-shrink-0">🤵</div>
          <div className="bg-white rounded-2xl rounded-tl-sm border border-black/5 px-4 py-3 shadow-sm">
            <p className="text-sm text-[#2c2c2c]">Welcome. Take a breath — no one's watching in here. Check the notice board for community links.</p>
          </div>
        </div>

        {/* Notice board */}
        <div className="rounded-2xl border-2 border-[#d4af37]/40 bg-white p-5 shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b8973f] mb-3">Notice Board</p>
          <div className="space-y-2">
            {NOTICE_LINKS.map(({ label, icon: Icon, to }) => (
              <button key={label} onClick={() => navigate(to)}
                className="w-full flex items-center gap-2.5 text-left text-sm text-[#2c2c2c] hover:text-[#b8973f] bg-[#faf8f3] hover:bg-[#f3eede] border border-black/5 rounded-xl px-3.5 py-2.5 transition-colors">
                <Icon className="w-4 h-4 text-[#b8973f]" /> {label}
              </button>
            ))}
            <div className="flex items-center gap-2.5 text-sm text-[#2c2c2c] bg-[#faf8f3] border border-black/5 rounded-xl px-3.5 py-2.5">
              <MessageCircle className="w-4 h-4 text-[#b8973f]" /> Discord invite — coming soon
            </div>
          </div>
        </div>

        <KeeperNotebook />
      </div>
    </div>
  );
}

export default function SpeakeasyBathroom() {
  return (
    <ProxyRoomGate>
      <BathroomInner />
    </ProxyRoomGate>
  );
}