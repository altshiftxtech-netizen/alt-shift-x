import React, { useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";

/**
 * Lightweight DM composer shown when a member messages another avatar.
 * Sends through the existing SpeakeasyPost feed as a directed note so it works
 * today without new backend wiring; can be upgraded to true 1:1 DMs later.
 */
export default function MessageModal({ open, target, onClose, onSend }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    await onSend?.(target, text.trim());
    setSending(false);
    setText("");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-sm w-full rounded-2xl border border-[#C8A95B]/30 bg-[#0A0A0C] p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8A95B] mb-1 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" /> Message
        </p>
        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          {target?.user_name}
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          autoFocus
          placeholder="Slide a note across the bar…"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white p-3 outline-none focus:border-[#C8A95B]/50 resize-none placeholder:text-white/30"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold py-2 rounded-xl hover:opacity-90 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" /> {sending ? "Sending…" : "Send Note"}
        </button>
      </div>
    </div>
  );
}