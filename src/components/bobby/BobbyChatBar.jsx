import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, Minus, Loader2, FileDown } from "lucide-react";
import CleanDocRenderer from "@/components/bobby/CleanDocRenderer";

const YIELD_RE = /\byield\b/i;

const DOC_SCHEMA = {
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
          body: {
            type: "string",
            description:
              "Markdown for a PRESENTATION-READY document. Choose the RIGHT visual tool for each block of data, do NOT dump raw numbers in prose: " +
              "(1) GFM tables (header row + delimiter row | :--- | + data rows, blank line before the table) for side-by-side comparisons or line-item breakdowns; " +
              "(2) ```chart-bar blocks (each line 'Label: number') for comparing quantities across categories; " +
              "(3) ```chart-pie blocks (each line 'Label: number') for share-of-whole / composition splits; " +
              "(4) ```chart-line blocks (each line 'Label: number', ordered) for trends over time/stages. " +
              "Prefer charts over tables whenever the data is numeric trends, shares, or ranked comparisons. Keep tables for dense multi-column reference data. Introduce every chart/table with one short sentence. No emojis, no raw ** or ## markers.",
          },
        },
        required: ["heading", "body"],
      },
    },
  },
  required: ["title", "subtitle", "sections"],
};

// SHA-256 ESI seal for a promoted document.
async function computeSeal(text) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return "ESI-" + Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "ESI-" + Date.now().toString(16);
  }
}

const convoText = (msgs) => msgs.map((m) => `${m.role === "user" ? "Operator" : "BOBby"}: ${m.text}`).join("\n");

// BobbyChatBar — floating, collapsible chat. The living document is built on the
// canvas as the conversation flows: after every exchange (prompt + reply) the
// draft document is regenerated from the full conversation and promoted to the
// canvas. "Yield Documents" (button or typing "yield") runs a final review pass
// and finalizes the document on the canvas. The operator collapses the chat
// manually whenever they want to read/navigate.
export default function BobbyChatBar({ document: activeDoc, onYieldDocument }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "BOBby online. Talk through your concept — the document builds on the canvas as we go. Say **yield** (or hit Yield) to review & finalize." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [yielding, setYielding] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const scrollRef = useRef(null);
  const draftRef = useRef(null);     // the current living document (avoids stale state in async)
  const draftSeqRef = useRef(0);    // cancels stale in-flight draft updates

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Regenerate the living document from the full conversation and promote it to
  // the canvas. Best-effort + sequenced so a newer exchange always wins.
  const updateDraft = async (convoMessages) => {
    const seq = ++draftSeqRef.current;
    setDrafting(true);
    try {
      const current = draftRef.current;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          (current
            ? "You are BOBby, the Build Yielder. Here is the current living document:\n" + JSON.stringify(current) +
              "\n\nUpdate and expand it to fully incorporate EVERYTHING discussed in the conversation below. Keep strong existing sections, refine them, and add new sections as the concept grows."
            : "You are BOBby, the Build Yielder. Create the initial living document from the conversation below."
          ) +
          " Return the complete structured document. Make it PRESENTATION-READY: use ```chart-bar blocks (each line 'Label: number') for quantity comparisons, ```chart-pie blocks for share/composition splits, ```chart-line blocks for trends, and GFM tables (header row + delimiter row | :--- | + data rows, blank line before) for dense reference data — prefer charts over tables for any numeric trend or share. Introduce every chart/table with one short sentence. Do not use emojis or raw ** / ## markers — render markdown properly.\n\nConversation:\n" + convoText(convoMessages),
        response_json_schema: DOC_SCHEMA,
      });
      if (seq !== draftSeqRef.current) return; // a newer exchange superseded this one
      const out = res?.output || res;
      const doc = {
        title: out.title || "Living Document",
        subtitle: out.subtitle || "Draft — updated as you chat",
        sections: (out.sections || []).map((s) => ({ heading: s.heading, body: s.body })),
      };
      draftRef.current = doc;
      const sealText = doc.sections.map((s) => s.heading + s.body).join("|") + "|" + doc.title;
      const esiSeal = await computeSeal(sealText);
      if (seq !== draftSeqRef.current) return;
      if (onYieldDocument) onYieldDocument({ document: doc, esiSeal, sealedAt: new Date().toISOString() });
    } catch {
      // draft update is best-effort — never block the conversation
    } finally {
      if (seq === draftSeqRef.current) setDrafting(false);
    }
  };

  // Final review + finalize: review the living document, fill gaps, ensure tables
  // are proper, then populate the finalized document on the canvas.
  const yieldDocuments = async (convoMessages = messages) => {
    draftSeqRef.current++; // invalidate any in-flight draft update
    setDrafting(false);
    setYielding(true);
    setOpen(true);
    try {
      const current = draftRef.current;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          (current
            ? "You are BOBby, the Build Yielder. Here is the current living document:\n" + JSON.stringify(current) +
              "\n\nReview it for completeness and accuracy. Fill any gaps, ensure EVERY comparison is a proper GFM table (header row + delimiter row | :--- | + data rows, blank line before each table), tighten the prose, and finalize it as the yielded document."
            : "You are BOBby, the Build Yielder. Build the final structured document from the conversation below."
          ) +
          " Return the complete final structured document, PRESENTATION-READY: use ```chart-bar blocks (each line 'Label: number') for quantity comparisons, ```chart-pie blocks for share/composition splits, ```chart-line blocks for trends, and GFM tables for dense reference data — prefer charts over tables for numeric trends or shares. Introduce every chart/table with one short sentence. Do not use emojis or raw ** / ## markers — render markdown properly.\n\nConversation:\n" + convoText(convoMessages),
        response_json_schema: DOC_SCHEMA,
      });
      const out = res?.output || res;
      const doc = {
        title: out.title || "Yielded Document",
        subtitle: out.subtitle || "Final — yielded by BOBby",
        sections: (out.sections || []).map((s) => ({ heading: s.heading, body: s.body })),
      };
      draftRef.current = doc;
      const sealText = doc.sections.map((s) => s.heading + s.body).join("|") + "|" + doc.title;
      const esiSeal = await computeSeal(sealText);
      if (onYieldDocument) onYieldDocument({ document: doc, esiSeal, sealedAt: new Date().toISOString() });
      setMessages((m) => [...m, { role: "bot", text: "**Documents yielded & finalized.** Promoted to the canvas — minimize this chat to read." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Yield failed: " + (e.message || "substrate error") }]);
    } finally {
      setYielding(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || yielding) return;
    setOpen(true); // reveal the exchange + indicator immediately
    const next = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    // "yield" keyword → review & finalize straight to the canvas.
    if (YIELD_RE.test(text)) {
      await yieldDocuments(next);
      return;
    }
    setSending(true);
    try {
      const docContext = activeDoc?.title ? `\n\nActive document context: "${activeDoc.title}".` : "";
      const convo = convoText(next);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          `You are BOBby, the Build Yielder on the Alt+Shift+X Sovereign Substrate. Help the operator think through documents, builds, and sovereign architecture. Reply in clean prose — you may use markdown headings/lists/tables, but never leave raw ** or ## markers; render them properly. Keep it tight and actionable.${docContext}\n\nConversation so far:\n${convo}\n\nBOBby:`,
      });
      const reply = typeof res === "string" ? res : res?.output || JSON.stringify(res);
      const withReply = [...next, { role: "bot", text: reply }];
      setMessages(withReply);
      // Build/update the living document on the canvas from the full exchange.
      updateDraft(withReply);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Substrate link interrupted. Retry in a moment." }]);
    } finally {
      setSending(false);
    }
  };

  const busy = sending || yielding || drafting;
  const hasUserTurn = messages.some((m) => m.role === "user");
  const statusText = yielding ? "reviewing & yielding…" : drafting ? "building document…" : "thinking…";

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
                  <Loader2 className="w-3 h-3 animate-spin" /> {statusText}
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