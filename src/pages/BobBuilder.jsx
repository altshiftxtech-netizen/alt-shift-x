import React, { useState, useEffect, useRef } from "react";
import { Bot, Upload, Copy, Code, CheckCircle2, AlertTriangle, Zap, Package, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";

export default function BobBuilder() {
  const [conv, setConv] = useState(null);
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [showCodePanel, setShowCodePanel] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    if (!convId) return;
    const unsub = base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return unsub;
  }, [convId]);

  const initConversation = async () => {
    const newConv = await base44.agents.createConversation({
      agent_name: "bob_builder",
      metadata: { name: "BOB Session " + new Date().toLocaleTimeString() }
    });
    setConv(newConv);
    setConvId(newConv.id);
  };

  const sendMessage = async (text) => {
    if (!conv || sending) return;
    const msg = text || input;
    if (!msg.trim()) return;
    setSending(true);
    setInput("");
    await base44.agents.addMessage(conv, { role: "user", content: msg });
    setSending(false);
  };

  const submitCode = async () => {
    if (!codeInput.trim()) return;
    const msg = `I'd like you to analyze this component code:\n\`\`\`\n${codeInput}\n\`\`\`\n\nPlease analyze its structure, identify the component type (X1/X2/X4), suggest improvements, flag any safety concerns, and generate publish-ready metadata.`;
    setShowCodePanel(false);
    await sendMessage(msg);
  };

  const QUICK_PROMPTS = [
    "Help me create a new X1 Risk & Compliance component",
    "Review my component for safety and trust score",
    "What's the best pricing for my component type?",
    "Generate metadata for my component",
    "How do I publish to the marketplace?",
    "Explain the Yotta Protocol standards"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      <SharedNav mode="builder" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Bot className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">BOB <span className="text-violet-400">BotOperatedBuilder</span></h1>
            <p className="text-slate-400 text-sm mt-0.5">Powered by Magna Dev · Yotta Protocols · YottaJoule Training</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <span className="text-[10px] bg-emerald-900 text-emerald-400 px-2 py-1 rounded-full font-semibold animate-pulse">● LIVE</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-200 flex items-center gap-2"><Zap className="w-4 h-4 text-violet-400" />Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)}
                    className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 text-violet-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    {p}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-4">
                <button onClick={() => setShowCodePanel(!showCodePanel)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors">
                  <Code className="w-4 h-4" /> Paste Component Code
                </button>
                <p className="text-[10px] text-slate-500 mt-2 text-center">BOB will analyze, improve, and generate metadata</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-violet-800 border">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">BOB automatically flags components with ill-intent indicators per the <strong className="text-slate-300">Sensitive Intelligence Policy</strong>. Building safely is non-negotiable.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="md:col-span-2 flex flex-col">
            {showCodePanel && (
              <Card className="bg-slate-800 border-violet-700 mb-4">
                <CardContent className="pt-4">
                  <p className="text-xs text-violet-400 font-semibold mb-2">Paste your component code below:</p>
                  <textarea
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    className="w-full h-48 bg-slate-900 text-green-400 font-mono text-xs p-3 rounded-lg border border-slate-600 outline-none focus:border-violet-500 resize-none"
                    placeholder="// Paste your component code here..."
                  />
                  <div className="flex gap-2 mt-3">
                    <Button onClick={submitCode} size="sm" className="bg-violet-600 hover:bg-violet-700">Analyze with BOB</Button>
                    <Button onClick={() => setShowCodePanel(false)} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800 border-slate-700 flex-1 flex flex-col min-h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex items-start gap-3 mt-4">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700 rounded-xl px-4 py-3 max-w-[85%]">
                      <p className="text-slate-200 text-sm">Hey! I'm BOB — your BotOperatedBuilder. I'm here to help you create, validate, and publish the safest and most powerful AI components on the market. Following Magna Dev's Yotta Protocols, we're going to build something exceptional together.</p>
                      <p className="text-slate-400 text-xs mt-2">Tell me what you want to build, or paste your component code for analysis.</p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                    {m.role !== 'user' && (
                      <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-700 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-slate-700 p-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask BOB anything about component building..."
                  className="flex-1 bg-slate-700 text-white text-sm px-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-500"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={sending || !input.trim()}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  Send
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}