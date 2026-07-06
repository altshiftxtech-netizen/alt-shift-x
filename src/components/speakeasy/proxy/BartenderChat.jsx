import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, X } from "lucide-react";

const AGENT = "the_bartender";
const RUNNING = ["pending", "in_progress", "running"];
const SETTLE_MS = 1400;
const WATCHDOG_MS = 45000;
const BRASS = "#C8A95B";

const hasText = (m) => m && typeof m.content === "string" && m.content.trim().length > 0;
const isAssistantText = (m) => m && m.role === "assistant" && hasText(m);

const QUICK = [
  "What is the Speakeasy?",
  "Where do the rooms lead?",
  "What's new here?",
  "Tell me about the founders",
];

/**
 * BartenderChat — the chat panel for the robot barkeep. Members ask about the
 * Speakeasy (rooms, features, what's new) and, in time, hear founder stories.
 * Uses the same proven streaming/settle/watchdog pattern as AiSearchConsultant,
 * styled to match the speakeasy (dark glass + brass).
 */
export default function BartenderChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [input, setInput] = useState("");
  const [conv, setConv] = useState(null);
  const bottomRef = useRef(null);

  const unsubRef = useRef(null);
  const settleRef = useRef(null);
  const watchdogRef = useRef(null);
  const pendingUserRef = useRef(null);
  const turnOpenRef = useRef(false);
  const lastTextRef = useRef("");

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
    if (!text || !conv) return;
    turnOpenRef.current = true;
    lastTextRef.current = "";
    setIsWorking(true);
    clearTimers();
    watchdogRef.current = setTimeout(finishTurn, WATCHDOG_MS);

    pendingUserRef.current = { role: "user", content: text };
    setMessages((prev) => [...prev, pendingUserRef.current]);
    await base44.agents.addMessage(conv, { role: "user", content: text });
  }, [conv, finishTurn]);

  // Create the conversation once when the panel opens.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await base44.agents.createConversation({
          agent_name: AGENT,
          metadata: { name: "At the bar", description: "Speakeasy info chat with the Bartender" },
        });
        if (!mounted) return;
        setConv(c);
        unsubRef.current = base44.agents.subscribeToConversation(c.id, handleUpdate);
      } catch (err) {
        console.error("Bartender chat failed to start:", err);
      }
    })();
    return () => {
      mounted = false;
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      clearTimers();
    };
  }, [handleUpdate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWorking]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const visible = messages.filter(hasText);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[22rem] max-w-[calc(100vw-2rem)] h-[30rem] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, rgba(20,16,11,0.96), rgba(10,8,6,0.98))", borderColor: `${BRASS}44`, backdropFilter: "blur(10px)" }}>
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: `${BRASS}33` }}>
        <div className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/e8ab3c475_Copilot_20260705_022631.png"
            alt="Robot Barkeep"
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ border: `1.5px solid ${BRASS}`, boxShadow: `0 0 10px ${BRASS}55` }}
            draggable="false"
          />
          <div>
            <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>The Bartender</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: BRASS }}>Speakeasy Info · Founder Lore</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visible.length === 0 && !isWorking && (
          <div className="text-center py-4">
            <p className="text-xs text-white/70 leading-relaxed">
              🥃 Evening. I'm the barkeep — ask me anything about the Speakeasy, the rooms, what's new, or the founders.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              {QUICK.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} disabled={!conv}
                  className="text-[10px] px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40"
                  style={{ borderColor: `${BRASS}55`, color: BRASS }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {visible.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap"
              style={msg.role === "user"
                ? { background: BRASS, color: "#1a120b" }
                : { background: "rgba(255,255,255,0.08)", color: "#eae4d8", border: `1px solid ${BRASS}22` }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isWorking && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"
              style={{ background: "rgba(255,255,255,0.08)", color: BRASS }}>
              <Loader2 className="w-3 h-3 animate-spin" /> Polishing a glass…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="p-3 border-t flex gap-2" style={{ borderColor: `${BRASS}33` }}>
        <input
          placeholder={conv ? "Ask the barkeep…" : "Pouring…"}
          value={input}
          disabled={!conv}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-white/10 text-white placeholder:text-white/40 text-xs rounded-lg px-3 py-2 outline-none border"
          style={{ borderColor: `${BRASS}33` }}
        />
        <button onClick={handleSend} disabled={!input.trim() || !conv}
          className="px-3 rounded-lg disabled:opacity-40 flex items-center justify-center"
          style={{ background: BRASS, color: "#1a120b" }}>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}