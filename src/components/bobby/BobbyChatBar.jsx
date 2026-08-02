import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, Minus, Loader2, FileDown } from "lucide-react";
import CleanDocRenderer from "@/components/bobby/CleanDocRenderer";

const YIELD_RE = /\byield\b/i;

// SHA-256 ESI seal for a promoted document.
async function computeSeal(text) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return "ESI-" + Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "ESI-" + Date.now().toString(16);
  }
}

// BobbyChatBar — a floating, collapsible chat panel. Minimizes to a single gold
// button so the operator can view & navigate the document unobstructed. Bot
// replies render through CleanDocRenderer (markdown rendered, so no literal
// ** or ## markers). "Yield Documents" — via the button or by typing "yield" —
// promotes the conversation into a structured document on the canvas through
// onYieldDocument.
export default function BobbyChatBar({ document: activeDoc, onYieldDocument }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "BOBby online. Talk through your concept, then say **yield documents** (or hit Yield) to promote it to the canvas." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [yielding, setYielding] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Promote the conversation into a structured document on the canvas.
  const yieldDocuments = async (convoMessages = messages) => {
    setYielding(true);
    setOpen(true);
    try {
      const convo = convoMessages.map((m) => `${m.role === "user" ? "Operator" : "BOBby"}: ${m.text}`).join("\n");
      const schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                heading: { type: "string" },
                body: { type: "string", description: "Markdown. GFM tables and ```chart-bar blocks allowed." },
              },
              required: ["heading", "body"],
            },
          },
        },
        required: ["title", "subtitle", "sections"],
      };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are BOBby, the Build Yielder on the Sovereign Substrate. Consolidate the following conversation into ONE coherent structured document the operator can read on the canvas. " +
          "Synthesize the concept into clean sections (use GFM tables where useful, ```chart-bar blocks for numeric trends). Do NOT use emojis. " +
          "Each section body may weave in an ESI seal note. Return the consolidated document.\n\nConversation:\n" + convo,
        response_json_schema: schema,
      });
      const out = res?.output || res;
      const doc = {
        title: out.title || "Yielded Document",
        subtitle: out.subtitle || "Promoted by BOBby from conversation",
        sections: (out.sections || []).map((s) => ({ heading: s.heading, body: s.body })),
      };
      const sealText = doc.sections.map((s) => s.heading + s.body).join("|") + "|" + doc.title;
      const esiSeal = await computeSeal(sealText);
      const sealedAt = new Date().toISOString();
      if (onYieldDocument) onYieldDocument({ document: doc, esiSeal, sealedAt });
      setMessages((m) => [...m, { role: "bot", text: "**Documents yielded.** Promoted to the canvas — minimize this chat when you're ready to read." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Yield failed: " + (e.message || "substrate error") }]);
    } finally {
      setYielding(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || yielding) return;
    setOpen(true); // reveal the exchange + yielding indicator immediately
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    // "yield" keyword → promote the conversation straight to the canvas.
    if (YIELD_RE.test(text)) {
      await yieldDocuments(next);
      return;
    }
    setSending(true);
    try {
      const docContext = activeDoc?.title ? `\n\nActive document context: "${activeDoc.title}".` : "";
      const convo = next.map((m) => `${m.role === "user" ? "Operator" : "BOBby"}: ${m.text}`).join("\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are BOBby, the Build Yielder on the Alt+Shift+X Sovereign Substrate. Help the operator think through documents, builds, and sovereign architecture. Reply in clean prose — you may use markdown headings/lists/tables, but never leave raw ** or ## markers; render them properly. Keep it tight and actionable.${docContext}\n\nConversation so far:\n${convo}\n\nBOBby:`,
      });
      const reply = typeof res === "string" ? res : res?.output || JSON.stringify(res);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Substrate link interrupted. Retry in a moment." }]);
    } finally {
      setSending(false);
    }
  };

  const busy = sending || yielding;
  const hasUserTurn = messages.some((m) => m.role === "user");

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open ? (
        <div className="w-[22rem] max-w-[calc(100vw-2rem)] max-h-[60vh] flex flex-col rounded-xl border border-[#D4AF37]/30 bg-black/90 backdrop-blur-md shadow-2xl shadow-black/60 overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] font-bold tracking-wider text-white">BOBby</span>
            <span className="text-[9px] text-white/40 truncate hidden sm:inline">build yielder</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto p-1 rounded text-white/50 hover:text-white hover:bg-white/10"
              aria-label="Minimize chat"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-[8rem]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed break-words bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-white whitespace-pre-wrap">
                    {m.text}
                  </div>
                ) : (
                  <div className="max-w-[90%] px-3 py-2 rounded-lg text-xs leading-relaxed break-words bg-white/5 border border-white/10 text-white/80">
                    <CleanDocRenderer content={m.text} />
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg text-xs text-white/50 bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> {yielding ? "yielding documents…" : "yielding…"}
                </div>
              </div>
            )}
          </div>

          {/* yield + input */}
          <div className="border-t border-[#D4AF37]/20 px-2.5 py-2 space-y-2 shrink-0">
            <button
              type="button"
              onClick={() => yieldDocuments()}
              disabled={busy || !hasUserTurn}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold tracking-wider hover:bg-[#D4AF37]/25 disabled:opacity-40 transition-colors"
            >
              {yielding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              YIELD DOCUMENTS
            </button>
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask BOBby… or type “yield”"
                className="flex-1 min-w-0 bg-white/5 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50"
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || !input.trim()}
                className="shrink-0 px-3 py-2 rounded-lg bg-[#D4AF37] text-black text-xs font-bold disabled:opacity-40 flex items-center gap-1.5"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-[#D4AF37] text-black shadow-lg shadow-black/40 hover:bg-[#e6c454] transition-colors"
          aria-label="Open BOBby chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide">BOBby</span>
        </button>
      )}
    </div>
  );
}