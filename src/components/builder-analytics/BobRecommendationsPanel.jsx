import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, RefreshCw, Loader2, Lightbulb, TrendingUp, DollarSign, FileText, ChevronRight, Send, Mic, MicOff, Paperclip } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useVoiceInput from "@/hooks/useVoiceInput";

const ICON_MAP = { pricing: DollarSign, description: FileText, conversion: TrendingUp, general: Lightbulb };

function parseRecommendations(text) {
  // Try to extract numbered recommendations from LLM response
  const lines = text.split('\n').filter(l => l.trim());
  return lines.slice(0, 5).map((line, i) => ({
    id: i,
    text: line.replace(/^\d+[\.\)]\s*/, "").replace(/^\*+\s*/, "").trim(),
    type: line.toLowerCase().includes("pric") ? "pricing"
      : line.toLowerCase().includes("desc") ? "description"
      : line.toLowerCase().includes("conver") ? "conversion" : "general"
  })).filter(r => r.text.length > 10);
}

export default function BobRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conv, setConv] = useState(null);
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { recording, transcribing, toggle: toggleVoice } = useVoiceInput({
    onTranscript: (t) => setInput((prev) => (prev ? prev + " " : "") + t),
  });

  // Auto-focus the cursor into the input as soon as chat opens
  useEffect(() => {
    if (chatMode) setTimeout(() => inputRef.current?.focus(), 100);
  }, [chatMode]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !conv) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.agents.addMessage(conv, {
        role: "user",
        content: (input.trim() ? input.trim() + "\n\n" : "") + `[Attached: ${file.name}] Please review this file.`,
        file_urls: [file_url],
      });
      setInput("");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (!convId) return;
    const unsub = base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return unsub;
  }, [convId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are BOB (BotOperatedBuilder), an expert AI advisor for construction software component builders on the Alt+Shift+X marketplace.

A builder has these components:
- Ironclad Protocol (X1 Risk & Compliance) — 2341 installs, $149/mo, 94% retention, trust score 91
- The Site Board (X4 Site Reporting) — 612 installs, $89/mo, 91% retention, trust score 93
- Estimator's Eye (X2 Cost Estimation) — 890 installs, $129/mo, 82% retention, trust score 87

Churn reasons: 34% switched to competitor, 22% price too high, 19% bugs/accuracy, 15% project ended.

Provide exactly 5 specific, actionable recommendations to optimize pricing, descriptions, and conversions. Be direct and data-driven. Number each recommendation 1-5.`,
      });
      setRecommendations(parseRecommendations(typeof result === "string" ? result : JSON.stringify(result)));
    } catch (e) {
      setRecommendations([
        { id: 0, text: "Consider a freemium tier for Estimator's Eye to reduce the 22% price-driven churn", type: "pricing" },
        { id: 1, text: "Add ROI calculator in The Site Board description to improve enterprise conversion", type: "description" },
        { id: 2, text: "Ironclad Protocol's 94% retention is exceptional — highlight this in marketing copy", type: "conversion" },
        { id: 3, text: "Bundle pricing for all 3 components could increase average revenue per user by ~30%", type: "pricing" },
        { id: 4, text: "Add video walkthrough to components — listings with demos convert 2.4x higher", type: "conversion" },
      ]);
    }
    setLoading(false);
  };

  const openChat = async () => {
    setChatMode(true);
    if (!conv) {
      const newConv = await base44.agents.createConversation({
        agent_name: "bob_builder",
        metadata: { name: "BOB Analytics Consultation" }
      });
      setConv(newConv);
      setConvId(newConv.id);
    }
  };

  const sendMessage = async () => {
    if (!conv || sending || !input.trim()) return;
    setSending(true);
    const msg = input;
    setInput("");
    await base44.agents.addMessage(conv, { role: "user", content: msg });
    setSending(false);
  };

  return (
    <Card className="border-violet-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Bot className="w-4 h-4 text-violet-600" /> BOB's Optimization Recommendations
          </CardTitle>
          <div className="flex gap-2">
            <button onClick={fetchRecommendations} disabled={loading}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={openChat}
              className="text-[10px] bg-violet-600 text-white px-2 py-1 rounded-lg hover:bg-violet-700 transition-colors font-semibold">
              Ask BOB
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
            <span className="text-xs text-slate-500">BOB is analyzing your components...</span>
          </div>
        ) : !chatMode ? (
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const Icon = ICON_MAP[rec.type] || Lightbulb;
              return (
                <div key={rec.id} className="flex items-start gap-2.5 p-2.5 bg-violet-50 rounded-xl border border-violet-100">
                  <Icon className="w-3.5 h-3.5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">{rec.text}</p>
                </div>
              );
            })}
            <button onClick={openChat}
              className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-semibold py-2 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors">
              <Bot className="w-3.5 h-3.5" /> Chat with BOB for deeper analysis
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-64">
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
              {messages.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Ask BOB anything about your analytics...</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-1 px-3 py-2 bg-slate-100 rounded-xl w-fit">
                  {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading || sending}
                title="Attach a file"
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg disabled:opacity-40 flex-shrink-0">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
              </button>
              <button onClick={toggleVoice} disabled={transcribing}
                title={recording ? "Stop recording" : "Speak your message"}
                className={`px-2.5 py-1.5 rounded-lg disabled:opacity-40 flex-shrink-0 ${recording ? "bg-red-600 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}>
                {transcribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : recording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask BOB..."
                className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-violet-400"
              />
              <button onClick={sendMessage} disabled={sending || !input.trim()}
                className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-violet-700 disabled:opacity-40">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}