import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, X, Loader2 } from "lucide-react";

// BobbyChatBar — pinned to the bottom of the BOBby shell. Lets the operator
// chat with the BOBby bot (powered by InvokeLLM). Collapsible message rail so
// it never crowds the canvas on small screens.
export default function BobbyChatBar({ document }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "BOBby online. Ask me about your documents, the Sovereign Substrate, or your build." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const docContext = document?.title ? `\n\nActive document context: "${document.title}".` : "";
      const convo = next.map((m) => `${m.role === "user" ? "Operator" : "BOBby"}: ${m.text}`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are BOBby, the Build Yielder — a concise, professional assistant on the Alt+Shift+X Sovereign Substrate. Help the operator with documents, builds, and sovereign architecture. Keep replies tight and actionable.${docContext}\n\nConversation so far:\n${convo}\n\nBOBby:`,
      });
      const reply = typeof res === "string" ? res : res?.output || JSON.stringify(res);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Substrate link interrupted. Retry in a moment." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-[#D4AF37]/20 bg-black/80 backdrop-blur-md shrink-0">
      {open && (
        <div ref={scrollRef} className="max-h-56 overflow-y-auto px-3 sm:px-4 py-3 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed break-words ${
                  m.role === "user"
                    ? "bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-white"
                    : "bg-white/5 border border-white/10 text-white/80"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-lg text-xs text-white/50 bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> yielding…
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 p-2 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
          aria-label="Toggle chat"
        >
          {open ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask BOBby…"
          className="flex-1 min-w-0 bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="shrink-0 px-3 py-2 rounded-lg bg-[#D4AF37] text-black text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 transition-opacity"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}