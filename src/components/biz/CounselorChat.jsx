import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Search, MessageSquare } from "lucide-react";
import { TEMPLATES, STRATEGY_MODULES } from "./bizData";
import DraftingAidNotice from "./DraftingAidNotice";

const TEMPLATE_CTX = TEMPLATES.map((t) => `${t.label} (${t.stage})`).join(", ");
const STRATEGY_CTX = STRATEGY_MODULES.map((m) => `${m.title}: ${m.tagline}`).join("; ");

/**
 * The search + chat layer. Acts as a "solutionist business counselor" that
 * routes a question to: (a) which template you need, (b) strategy explainers,
 * (c) tradeoffs and operating playbooks. Can jump the user to a template.
 */
export default function CounselorChat({ onOpenTemplate }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm **BOB²**, your solutionist business counselor. Ask me *\"what template do I need?\"*, or about pricing models, deal structure, IP protection, or risk. I'll point you to the right document and explain the tradeoffs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are BOB² "BuilderOperatedBiz", a solutionist business counselor for software builders. You are NOT a lawyer; never give legal advice — give business/strategy guidance and point to drafting-aid templates.

Available document templates: ${TEMPLATE_CTX}.
Strategy modules: ${STRATEGY_CTX}.

If the user asks "what template do I need", recommend the single best-matching template by its exact label and set suggested_template_key.
Explain options, tradeoffs, and operating playbooks concisely (go-to-market, deal structuring, risk allocation, compliance-first ops). Keep answers under ~150 words, use markdown.

User question: ${q}`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            suggested_template_key: { type: "string" },
          },
          required: ["answer"],
        },
      });
      const key = res.suggested_template_key;
      const tpl = TEMPLATES.find((t) => t.key === key);
      setMessages((m) => [...m, { role: "assistant", content: res.answer, template: tpl }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach the reasoning engine. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-1 pb-3"><DraftingAidNotice compact /></div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-[#C8A95B] text-[#1a1207] font-medium"
                : "bg-white/[0.06] border border-white/10 text-white/85"
            }`}>
              {m.role === "assistant"
                ? <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                : m.content}
              {m.template && (
                <Button size="sm" onClick={() => onOpenTemplate(m.template)}
                  className="mt-2.5 h-7 bg-[#C8A95B]/90 text-[#1a1207] hover:bg-[#C8A95B] text-xs font-bold">
                  {m.template.icon} Open {m.template.label}
                </Button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2.5 bg-white/[0.06] border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin text-[#C8A95B]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Search templates or ask the counselor…"
            className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:border-[#C8A95B]/60"
          />
        </div>
        <Button onClick={send} disabled={busy || !input.trim()}
          className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}