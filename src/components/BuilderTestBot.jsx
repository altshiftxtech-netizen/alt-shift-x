import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Bot, X, Send, Loader2, ExternalLink, Paperclip, Mic, MicOff } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import useAgentStream from "@/hooks/useAgentStream";
import useVoiceInput from "@/hooks/useVoiceInput";
import StopButton from "@/components/StopButton";

/**
 * BuilderTestBot — floating chat widget available ONLY to builder-role users.
 * Demonstrates the BOT-X agent capabilities to attract developers to upgrade.
 */
export default function BuilderTestBot() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [convId, setConvId] = useState(null);
  const { messages, isGenerating, stop: stopGenerating, onSent } = useAgentStream(convId, []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isBuilder, setIsBuilder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { recording, transcribing, toggle: toggleVoice } = useVoiceInput({
    onTranscript: (t) => setInput((prev) => (prev ? prev + " " : "") + t),
  });

  // Auto-focus the cursor into the input when the chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !conversation) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: (input.trim() ? input.trim() + "\n\n" : "") + `[Attached: ${file.name}] Please review this file.`,
        file_urls: [file_url],
      });
      setInput("");
      onSent();
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setUser(u);
        setIsBuilder(u.role === "builder" || u.role === "admin");
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const openChat = async () => {
    setOpen(true);
    if (!conversation) {
      const conv = await base44.agents.createConversation({
        agent_name: "builder_test_bot",
        metadata: { name: "BOT-X Demo Session" },
      });
      setConversation(conv);
      setConvId(conv.id);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    onSent();
    setSending(false);
  };

  // Only show to builders
  if (!user || !isBuilder) return null;

  return (
    <>
      {/* Floating trigger */}
      <div className="fixed bottom-20 right-6 z-50">
        {!open && (
          <button
            onClick={openChat}
            className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all"
          >
            <Bot className="w-4 h-4" />
            BOT-X Demo
          </button>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-violet-200">
          {/* Header */}
          <div className="bg-violet-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <div>
                <p className="text-sm font-bold">BOT-X</p>
                <p className="text-[10px] text-violet-300">Builder-Exclusive Test Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/builder/test-lab" className="text-[10px] text-violet-300 hover:text-white flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Full Lab
              </Link>
            </div>
            <button onClick={() => setOpen(false)} className="text-violet-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 bg-white h-72 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Bot className="w-8 h-8 text-violet-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Ask BOT-X anything about components, revenue share, or builder capabilities.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${msg.role === "user" ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-800"}`}>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown className="prose prose-xs max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content || ""}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {(sending || isGenerating) && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-xl px-3 py-2">
                  <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {isGenerating && (
            <div className="bg-white border-t border-slate-100 px-3 py-2 flex justify-center">
              <StopButton onStop={stopGenerating} variant="light" size="sm" />
            </div>
          )}
          <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center gap-2">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || sending}
              title="Attach a file"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
            </button>
            <button
              onClick={toggleVoice}
              disabled={transcribing}
              title={recording ? "Stop recording" : "Speak your message"}
              className={`p-2 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0 ${recording ? "bg-red-600 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
            >
              {transcribing ? <Loader2 className="w-3 h-3 animate-spin" /> : recording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
            <input
              ref={inputRef}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400"
              placeholder="Ask about revenue share, components..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="p-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}