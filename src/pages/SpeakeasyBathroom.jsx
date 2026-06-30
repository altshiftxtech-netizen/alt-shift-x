import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, BookOpen, LifeBuoy } from "lucide-react";
import ProxyRoomGate from "@/components/speakeasy/proxy/ProxyRoomGate";
import KeeperNotebook from "@/components/speakeasy/proxy/KeeperNotebook";
import MarblePowderRoom from "@/components/speakeasy/bathroom/MarblePowderRoom";
import SpeakeasyLogo from "@/components/speakeasy/SpeakeasyLogo";

// Static community resources surfaced on the powder room "notice board".
const NOTICE_LINKS = [
  { label: "Community Guidelines", icon: BookOpen, to: "/legal/acceptable-use" },
  { label: "Support & Contact", icon: LifeBuoy, to: "/contact" },
];

function BathroomInner() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg, #2a1f28 0%, #1a131a 100%)" }}>
      {/* Top bar */}
      <div className="relative z-30 flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/speakeasy/proxy-room")} className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to the Room
        </button>
        <div className="flex items-center gap-2.5">
          <SpeakeasyLogo size={28} />
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Private</p>
            <h1 className="text-lg font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Powder Room</h1>
          </div>
        </div>
        <span className="w-16" />
      </div>

      {/* 3D marble perspective room */}
      <div className="relative z-10 mx-auto max-w-6xl h-[calc(100vh-150px)] min-h-[560px] px-2">
        <MarblePowderRoom>
          {/* Marble vanity counter across the foreground */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[78%] max-w-[560px] h-10 rounded-xl z-10"
            style={{
              background: "linear-gradient(180deg, #f3f0ea, #cfc7ba)",
              border: "1px solid rgba(201,161,74,0.5)",
              boxShadow: "0 14px 40px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.7)",
            }}
          >
            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-16 h-4 rounded-full"
              style={{ background: "radial-gradient(ellipse at 40% 30%, #e9eef3, #aeb8c2)", border: "1px solid rgba(201,161,74,0.4)" }} />
          </div>

          {/* Floating glass content card — keeper greeting + notice board + notebook */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-5 z-20">
            <div className="rounded-3xl border border-[#d4af37]/30 bg-white/85 backdrop-blur-xl p-6 shadow-2xl">
              {/* Keeper greeting */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8973f] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">🤵</div>
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
        </MarblePowderRoom>
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