import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bot, X, ChevronRight, Send, Loader2, GripHorizontal, Minimize2, Maximize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useAgentStream from "@/hooks/useAgentStream";
import StopButton from "@/components/StopButton";

export default function BobAdvisorWidget() {
  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState(null);
  const [convId, setConvId] = useState(null);
  const { messages, isGenerating, stop: stopGenerating, onSent } = useAgentStream(convId, []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Dragging state
  const [pos, setPos] = useState(null); // null = use default bottom-right
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  const openChat = async () => {
    setOpen(true);
    setMinimized(false);
    if (!conv) {
      setInitializing(true);
      const newConv = await base44.agents.createConversation({
        agent_name: "bob_builder",
        metadata: { name: "BOB Advisor Session" }
      });
      setConv(newConv);
      setConvId(newConv.id);
      setInitializing(false);
    }
  };

  const sendMessage = async (text) => {
    if (!conv || sending) return;
    const msg = text || input;
    if (!msg.trim()) return;
    setSending(true);
    setInput("");
    await base44.agents.addMessage(conv, { role: "user", content: msg });
    onSent();
    setSending(false);
  };

  // Dragging logic
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return; // don't drag on buttons
    dragging.current = true;
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current || !panelRef.current) return;
      const panelW = panelRef.current.offsetWidth;
      const panelH = panelRef.current.offsetHeight;
      let x = e.clientX - dragOffset.current.x;
      let y = e.clientY - dragOffset.current.y;
      // Clamp to viewport
      x = Math.max(0, Math.min(window.innerWidth - panelW, x));
      y = Math.max(0, Math.min(window.innerHeight - panelH, y));
      setPos({ x, y });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Compute position style
  const positionStyle = pos
    ? { left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' }
    : { bottom: 24, right: 24 };

  const QUICK = [
    "How can I improve my conversion rate?",
    "Analyze my pricing strategy",
    "Tips to improve my trust score",
  ];

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all hover:scale-110 overflow-hidden"
          style={{ backgroundImage: 'url(https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          ref={panelRef}
          style={{ ...positionStyle, width: 384 }}
          className="fixed z-50 bg-slate-900 border border-violet-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          // height changes based on minimized state
        >
          {/* Header — drag handle */}
          <div
            onMouseDown={onMouseDown}
            className="bg-gradient-to-r from-violet-700 to-slate-800 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-violet-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">BOB Advisor</p>
                <p className="text-[10px] text-violet-300">Magna Dev · Yotta Protocol</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <GripHorizontal className="w-4 h-4 text-slate-500 mr-1" />
              <button
                onClick={() => setMinimized(m => !m)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                title={minimized ? "Expand" : "Minimize"}
              >
                {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ height: 400, maxHeight: '60vh' }}>
                {initializing && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                  </div>
                )}
                {!initializing && messages.length === 0 && (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 max-w-[80%]">
                        Hey! I'm BOB — your AI builder advisor. I can analyze your components, suggest pricing improvements, and help optimize conversions. What would you like to work on?
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-3">
                      {QUICK.map((q, i) => (
                        <button key={i} onClick={() => sendMessage(q)}
                          className="w-full text-left text-[11px] text-violet-300 hover:text-white border border-violet-800 hover:border-violet-500 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                          <ChevronRight className="w-3 h-3 flex-shrink-0" />{q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role !== 'user' && (
                      <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {(sending || isGenerating) && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-700 rounded-xl px-3 py-2 flex gap-1">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-700 p-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask BOB anything..."
                  className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-500"
                />
                {(sending || isGenerating) ? (
                  <StopButton onStop={stopGenerating} size="sm" />
                ) : (
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}