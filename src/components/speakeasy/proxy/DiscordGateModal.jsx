import React from "react";
import { X, MessageCircle, ExternalLink, Gamepad2 } from "lucide-react";

const DISCORD_INVITE = "https://discord.gg/frP6cUX7tn";
const GOLD = "#C8A95B";

// The Gamers' portrait founder — mirrors the poster art in the Proxy Room.
const PORTRAIT = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/e583d06f8_generated_image.png";

/**
 * The Gamers' Lounge gate. Clicking the "Gamers" portrait in the Proxy Room
 * opens this velvet-and-gold invitation, which links out to the Speakeasy's
 * private Discord. Deep velvet backdrop, gold art-deco trim, founder portrait —
 * styled to match the room's other gates.
 */
export default function DiscordGateModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-md"
      style={{ background: "radial-gradient(circle at center, rgba(40,8,20,0.85) 0%, rgba(0,0,0,0.92) 100%)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{
          border: `2px solid ${GOLD}`,
          background: "linear-gradient(180deg, #2a0d18 0%, #14060d 55%, #0A0A0C 100%)",
          boxShadow: `0 0 60px 6px ${GOLD}33, inset 0 0 40px rgba(0,0,0,0.6)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold art-deco corner flourishes */}
        <span className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg pointer-events-none" style={{ borderColor: `${GOLD}88` }} />
        <span className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg pointer-events-none" style={{ borderColor: `${GOLD}88` }} />
        <span className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg pointer-events-none" style={{ borderColor: `${GOLD}88` }} />
        <span className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 rounded-br-lg pointer-events-none" style={{ borderColor: `${GOLD}88` }} />

        <button onClick={onClose} className="absolute top-3 right-3 z-10 text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center">
          {/* Founder portrait in a gilded frame */}
          <div
            className="w-24 h-28 mx-auto mb-4 rounded-lg overflow-hidden"
            style={{ border: `2px solid ${GOLD}`, boxShadow: `0 0 20px ${GOLD}55` }}
          >
            <img src={PORTRAIT} alt="Gamers' Lounge founder" className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Gamepad2 className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Members Only</p>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Gamers' Lounge
          </h2>

          {/* Gold divider */}
          <div className="w-16 h-px mx-auto mb-3" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

          <p className="text-xs text-[#B9A788] mb-6 leading-relaxed">
            Slip past the velvet rope into the Speakeasy's private Discord — where the after-hours crowd trades strategy,
            runs sessions, and keeps the lights on late.
          </p>

          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})`, color: "#0A0A0C" }}
          >
            <MessageCircle className="w-4 h-4" /> Join the Discord <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button onClick={onClose} className="mt-3 text-[11px] text-white/40 hover:text-white/70">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}