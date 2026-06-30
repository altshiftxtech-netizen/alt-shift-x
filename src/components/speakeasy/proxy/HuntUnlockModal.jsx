import React from "react";
import { X, Gift, Mail, Loader2, Sparkles } from "lucide-react";

/**
 * Reveal modal shown when a member clicks a scavenger fixture.
 * Handles three states: claiming (spinner), success (prize reveal), and
 * already-claimed. Pure presentation — claim logic lives in the page.
 */
export default function HuntUnlockModal({ open, state, result, onClose }) {
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

        {state === "claiming" && (
          <div className="py-6">
            <Loader2 className="w-8 h-8 text-[#C8A95B] animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#9CA0A8]">Inspecting the fixture…</p>
          </div>
        )}

        {state === "error" && (
          <div className="py-6">
            <p className="text-sm text-white/70">{result?.message || "Nothing hidden here… for now."}</p>
          </div>
        )}

        {(state === "success" || state === "already") && (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D9DCE1]/20 to-[#C8A95B]/30 border border-[#C8A95B]/40 flex items-center justify-center mb-4">
              <Gift className="w-7 h-7 text-[#C8A95B]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B] mb-1">
              {state === "already" ? "Already Discovered" : "You Found It!"}
            </p>
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {result?.item_name}
            </h2>
            {result?.description && <p className="text-xs text-[#9CA0A8] mb-3 leading-relaxed">{result.description}</p>}
            <div className="rounded-xl border border-[#C8A95B]/20 bg-white/[0.03] px-4 py-3 mb-4">
              <p className="text-[10px] uppercase tracking-wider text-[#C8A95B]/70">Your Prize</p>
              <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A95B]" />
                {result?.prize_value || result?.prize_type}
              </p>
            </div>
            {state === "success" && result?.email_sent && (
              <p className="text-[11px] text-[#9CA0A8] flex items-center justify-center gap-1 mb-4">
                <Mail className="w-3 h-3 text-[#C8A95B]" /> Prize details emailed to you.
              </p>
            )}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold py-2 rounded-xl hover:opacity-90"
            >
              Back to the Room
            </button>
          </>
        )}
      </div>
    </div>
  );
}