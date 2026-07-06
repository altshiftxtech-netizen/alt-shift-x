import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Mic, Square, FlaskConical } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import useVoiceInput from "@/hooks/useVoiceInput";
import { EM } from "./emTokens";
import { DEFAULT_MODEL } from "./emModels";
import EmModelSwitcher from "./EmModelSwitcher";
import EmVerdictPanel from "./EmVerdictPanel";

// Sample BOB-EM-1.0 adjudication payload (GPM-V2.1 test fixture) — lets a dev
// preview how the Super-Tokens "unzip" into the verdict dashboard.
const SAMPLE_VERDICT = {
  gsp_lineage_audit_supertoken: "G2-EM-APEX|SC-OE-HP-BS|98.2",
  gsp_master_evaluation_hash: "12.04-4.3.4.2|C1|7f3a9",
  gsp_longitudinal_summary_hash: "180d|DRIFT.92",
};

const GREETING = {
  role: "assistant",
  content:
    "Welcome to **expertminds™**. I'll guide a structured, adaptive interview to capture your expertise and structure it into deployable knowledge assets.\n\nTo begin — what's your primary domain, and roughly how many years have you operated at a senior level in it?",
};

/**
 * Live ExpertMind extraction console. Runs the adaptive interview through the
 * model-switchable expertMindExtract function so the reasoning engine can be
 * hard-switched between any available model mid-session.
 */
export default function EmExtractionConsole({ onClose }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  // Talk-to-text: transcribed speech is appended to whatever's already typed.
  const { recording, transcribing, toggle } = useVoiceInput({
    onTranscript: (t) => setInput((prev) => (prev ? `${prev} ${t}` : t)),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const loadSampleVerdict = () => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Adjudication complete — structured verdict below." },
      { role: "verdict", verdict: SAMPLE_VERDICT },
    ]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await base44.functions.invoke("expertMindExtract", {
        messages: next.map((m) => ({ role: m.role, content: m.content })),
        model,
      });
      const reply = res.data?.reply || "…";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I hit a snag processing that. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="w-full max-w-2xl h-[85vh] rounded-2xl overflow-hidden flex flex-col" style={{ background: EM.surface, border: `1px solid ${EM.border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})` }}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "#fff" }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#fff" }} />
            </span>
            <div className="leading-none">
              <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: EM.accentSoft }}>expertminds™ · BOB-EM-1.0</p>
              <h3 className="text-white text-[15px] font-semibold mt-0.5">Extraction Console</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EmModelSwitcher value={model} onChange={setModel} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Transcript */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ background: EM.bg }}>
          {messages.map((m, i) =>
            m.role === "verdict" ? (
              <EmVerdictPanel key={i} response={m.verdict} />
            ) : (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: EM.primary, color: "#fff" }
                      : { background: EM.surface, color: EM.text, border: `1px solid ${EM.border}` }
                  }
                >
                  {m.role === "assistant"
                    ? <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-strong:font-semibold"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                    : m.content}
                </div>
              </div>
            )
          )}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-[13px]" style={{ background: EM.surface, border: `1px solid ${EM.border}`, color: EM.muted }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: EM.accent }} /> Extracting…
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-4 py-3.5 flex items-end gap-2" style={{ borderTop: `1px solid ${EM.border}`, background: EM.surface }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder={recording ? "Listening…" : transcribing ? "Transcribing…" : "Share your answer, or tap the mic…"}
            className="flex-1 resize-none rounded-xl px-3.5 py-2.5 text-[14px] focus:outline-none focus:ring-2"
            style={{ border: `1px solid ${EM.border}`, background: EM.bg, color: EM.text }}
          />
          {/* Demo: unzip the sample BOB-EM-1.0 verdict payload */}
          <button
            onClick={loadSampleVerdict}
            disabled={busy}
            title="Load sample verdict (GPM-V2.1 test payload)"
            className="p-2.5 rounded-xl disabled:opacity-40 transition-all"
            style={{ border: `1px solid ${EM.border}`, color: EM.accent, background: EM.surface }}
          >
            <FlaskConical className="w-4 h-4" />
          </button>
          {/* Talk-to-text mic */}
          <button
            onClick={toggle}
            disabled={busy || transcribing}
            title={recording ? "Stop recording" : "Speak your answer"}
            className="p-2.5 rounded-xl disabled:opacity-40 transition-all"
            style={
              recording
                ? { background: "#EF4444", color: "#fff", boxShadow: "0 0 0 4px rgba(239,68,68,0.25)" }
                : { border: `1px solid ${EM.border}`, color: EM.accent, background: EM.surface }
            }
          >
            {transcribing ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-opacity"
            style={{ background: EM.primary }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-2.5 flex items-center gap-1.5 text-[11px]" style={{ background: EM.surface, color: EM.muted }}>
          <Sparkles className="w-3 h-3" style={{ color: EM.accent }} /> Consent-based · governed extraction. Formal clinical/legal outputs require licensed review.
        </div>
      </div>
    </div>
  );
}