import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Mic } from "lucide-react";
import VoiceButton from "@/components/VoiceButton";
import StopButton from "@/components/StopButton";

const AGENT = "sales_consultant";
const RUNNING = ["pending", "in_progress", "running"];
const SETTLE_MS = 1400;
const WATCHDOG_MS = 45000;

const hasText = (m) => m && typeof m.content === "string" && m.content.trim().length > 0;
const isAssistantText = (m) => m && m.role === "assistant" && hasText(m);

/**
 * AiSearchConsultant — entry card + clean chat for the Sales Consultant agent.
 * Uses ONE reliable send path with an optimistic user bubble, a subscription
 * that reconciles streamed updates, plus a settle timer and watchdog so the
 * "thinking" indicator can never hang and a reply always lands.
 */
export default function AiSearchConsultant({ voiceQuery = "", onVoiceQueryConsumed }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const voiceFiredRef = useRef("");

  useEffect(() => {
    if (voiceQuery && voiceQuery.trim() && voiceQuery !== voiceFiredRef.current) {
      voiceFiredRef.current = voiceQuery;
      setQuery(voiceQuery);
      const t = setTimeout(() => {
        start(voiceQuery);
        onVoiceQueryConsumed && onVoiceQueryConsumed();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [voiceQuery]);

  const start = async (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setLoading(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT,
        metadata: { name: "Consultation", description: `Query: ${q}` },
      });
      setConversation({ conv, firstMessage: q });
      setQuery("");
    } catch (err) {
      alert("Failed to start consultation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (conversation) {
    return (
      <ChatInterface
        conv={conversation.conv}
        firstMessage={conversation.firstMessage}
        onClose={() => setConversation(null)}
      />
    );
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
            onKeyDown={(e) => e.key === "Enter" && start()}
            className="text-sm"
          />
          <VoiceButton onTranscript={(t) => setQuery((p) => (p ? p + " " : "") + t)} />
          <Button onClick={() => start()} disabled={loading || !query.trim()} className="gap-2 bg-violet-600 hover:bg-violet-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatInterface({ conv, firstMessage, onClose }) {
  const [messages, setMessages] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const unsubRef = useRef(null);
  const settleRef = useRef(null);
  const watchdogRef = useRef(null);
  const pendingUserRef = useRef(null);
  const turnOpenRef = useRef(false);
  const lastTextRef = useRef("");
  const sentFirstRef = useRef(false);

  const clearTimers = () => {
    if (settleRef.current) { clearTimeout(settleRef.current); settleRef.current = null; }
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
  };

  const finishTurn = useCallback(() => {
    clearTimers();
    turnOpenRef.current = false;
    setIsWorking(false);
  }, []);

  const detectWorking = (msgs) => {
    if (!turnOpenRef.current) return false;
    if (!msgs || msgs.length === 0) return true;
    const last = msgs[msgs.length - 1];
    if (last.role === "user") return true;
    const anySpoke = msgs.some(isAssistantText);
    const lastToolRunning = (last.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status));
    if (lastToolRunning) return true;
    if (last.status && RUNNING.includes(last.status)) return true;
    if (anySpoke) return false;
    const anyToolRunning = msgs.some(
      (m) => m.role === "assistant" && (m.tool_calls || []).some((t) => t.status && RUNNING.includes(t.status))
    );
    return anyToolRunning || !anySpoke;
  };

  const handleUpdate = useCallback((data) => {
    let msgs = data.messages || [];
    const pending = pendingUserRef.current;
    if (pending) {
      const serverHasIt = msgs.some((m) => m.role === "user" && (m.content || "") === pending.content);
      if (serverHasIt) {
        pendingUserRef.current = null;
      } else {
        let at = msgs.length;
        while (at > 0 && msgs[at - 1].role === "assistant") at--;
        msgs = [...msgs.slice(0, at), pending, ...msgs.slice(at)];
      }
    }
    setMessages(msgs);

    if (!turnOpenRef.current) { setIsWorking(false); return; }
    if (!detectWorking(msgs)) { finishTurn(); return; }
    setIsWorking(true);

    const last = msgs[msgs.length - 1];
    if (isAssistantText(last) && last.content !== lastTextRef.current) {
      lastTextRef.current = last.content;
      if (settleRef.current) clearTimeout(settleRef.current);
      settleRef.current = setTimeout(finishTurn, SETTLE_MS);
    }
  }, [finishTurn]);

  const sendMessage = useCallback(async (content) => {
    const text = (content || "").trim();
    if (!text) return;
    turnOpenRef.current = true;
    lastTextRef.current = "";
    setIsWorking(true);
    clearTimers();
    watchdogRef.current = setTimeout(finishTurn, WATCHDOG_MS);

    pendingUserRef.current = { role: "user", content: text };
    setMessages((prev) => [...prev, pendingUserRef.current]);
    await base44.agents.addMessage(conv, { role: "user", content: text });
  }, [conv, finishTurn]);

  // Subscribe once, then fire the seeded first message through the same path.
  useEffect(() => {
    unsubRef.current = base44.agents.subscribeToConversation(conv.id, handleUpdate);
    if (firstMessage && !sentFirstRef.current) {
      sentFirstRef.current = true;
      sendMessage(firstMessage);
    }
    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      clearTimers();
    };
  }, [conv.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWorking]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
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
          .filter((msg) => hasText(msg))
          .map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-900"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        {isWorking && (
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
        />
        <VoiceButton size="sm" onTranscript={(t) => setInput((p) => (p ? p + " " : "") + t)} />
        {isWorking ? (
          <StopButton onStop={finishTurn} variant="light" size="sm" />
        ) : (
          <Button onClick={handleSend} disabled={!input.trim()} size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Send className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}