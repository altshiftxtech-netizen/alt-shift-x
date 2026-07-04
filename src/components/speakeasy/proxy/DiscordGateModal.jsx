import React from "react";
import { X, MessageCircle, ExternalLink, Gamepad2 } from "lucide-react";

const DISCORD_INVITE = "https://discord.gg/frP6cUX7tn";

/**
 * The Gamers' Lounge gate. Clicking the "Gamers" portrait in the Proxy Room
 * opens this velvet-and-gold invitation, which links out to the Speakeasy's
 * private Discord. Styled to match the room's other gates.
 */
export default function DiscordGateModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative max-w-sm w-full rounded-2xl border border-[#C8A95B]/40 bg-gradient-to-b from-[#15110a] to-[#0A0A0C] p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D9DCE1]/20 to-[#C8A95B]/30 border border-[#C8A95B]/40 flex items-center justify-center mb-4">
          <Gamepad2 className="w-7 h-7 text-[#C8A95B]" />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B] mb-1">Members Only</p>
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          The Gamers' Lounge
        </h2>
        <p className="text-xs text-[#9CA0A8] mb-5 leading-relaxed">
          Slip past the velvet rope into the Speakeasy's private Discord — where the after-hours crowd trades strategy,
          runs sessions, and keeps the lights on late.
        </p>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-4 h-4" /> Join the Discord <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button onClick={onClose} className="mt-3 text-[11px] text-white/40 hover:text-white/70">
          Maybe later
        </button>
      </div>
    </div>
  );
}