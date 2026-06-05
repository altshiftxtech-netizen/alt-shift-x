import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Mic } from "lucide-react";
import VoiceButton from "@/components/VoiceButton";
import useAgentStream from "@/hooks/useAgentStream";
import StopButton from "@/components/StopButton";

export default function AiSearchConsultant({ voiceQuery = "", onVoiceQueryConsumed }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const voiceFiredRef = useRef("");

  // Auto-fire when a voice command is injected — guard against double-fire
  useEffect(() => {
    if (voiceQuery && voiceQuery.trim() && voiceQuery !== voiceFiredRef.current) {
      voiceFiredRef.current = voiceQuery;
      setQuery(voiceQuery);
      const t = setTimeout(() => {
        startConsultation(voiceQuery);
        onVoiceQueryConsumed && onVoiceQueryConsumed();
      }, 450);
      return () => clearTimeout(t);
    }
  }, [voiceQuery]);

  const startConsultation = async (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setLoading(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "sales_consultant",
        metadata: { name: "Consultation", description: `Query: ${q}` }
      });
      await base44.agents.addMessage(conv, { role: "user", content: q });
      // Seed the chat with the user's first message so it shows instantly and
      // the streaming hook knows a reply is incoming.
      setConversation({ ...conv, messages: [...(conv.messages || []), { role: "user", content: q }] });
      setShowChat(true);
      setQuery("");
    } catch (err) {
      alert("Failed to start consultation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showChat && conversation) {
    return <ChatInterface conversation={conversation} onClose={() => { setShowChat(false); setConversation(null); }} />;
  }

  return (
    <Card className="backdrop-blur-md bg-white/40 border-2 border-white/60 shadow-2xl">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <p className="font-semibold text-slate-900">AI Sales Consultant</p>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">
            <Mic className="w-2.5 h-2.5" /> Voice-enabled
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Get personalized component recommendations or ask technical questions. Voice commands supported — just say your query.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about components, analysis, or project needs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startConsultation()}
            className="text-sm"
          />
          <VoiceButton onTranscript={(t) => setQuery((p) => (p ? p + " " : "") + t)} />
          <Button onClick={() => startConsultation()} disabled={loading || !query.trim()} className="gap-2 bg-violet-600 hover:bg-violet-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatInterface({ conversation, onClose }) {
  const [input, setInput] = useState("");
  const { messages, isGenerating, stop: stopGenerating, onSent } = useAgentStream(conversation.id, conversation.messages || []);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // The first user message was already added before this view mounted — open a
  // turn so the pending indicator shows and we wait for the agent's reply.
  useEffect(() => {
    onSent();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: input });
      onSent();
      setInput("");
    } catch (err) {
      alert("Failed to send: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="fixed bottom-6 right-24 w-96 h-[28rem] backdrop-blur-lg bg-white/30 border-2 border-white/50 shadow-2xl flex flex-col z-40">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-600/90 to-blue-600/90 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <p className="text-sm font-semibold text-white">Sales Consultant</p>
        </div>
        <button onClick={onClose} className="text-white hover:opacity-80 text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages
          // Never render empty/ghost bubbles (e.g. an assistant message that
          // only holds a running tool_call and no text yet).
          .filter((msg) => typeof msg.content === "string" && msg.content.trim().length > 0)
          .map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === "user" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-900"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Consultant is thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Follow-up question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="text-xs"
          disabled={sending}
        />
        <VoiceButton size="sm" onTranscript={(t) => setInput((p) => (p ? p + " " : "") + t)} />
        {isGenerating ? (
          <StopButton onStop={stopGenerating} variant="light" size="sm" />
        ) : (
          <Button onClick={handleSend} disabled={!input.trim()} size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Send className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}