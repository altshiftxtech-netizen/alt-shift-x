import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send, Loader2 } from "lucide-react";

export default function AiSearchConsultant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const startConsultation = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Create conversation with Sales Consultant agent
      const conv = await base44.agents.createConversation({
        agent_name: "sales_consultant",
        metadata: {
          name: "Sales Consultation",
          description: `User query: ${query}`
        }
      });

      // Send user message
      await base44.agents.addMessage(conv, {
        role: "user",
        content: query
      });

      setConversation(conv);
      setShowChat(true);
      setQuery("");
    } catch (err) {
      alert("Failed to start consultation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showChat && conversation) {
    return <ChatInterface conversation={conversation} onClose={() => setShowChat(false)} />;
  }

  return (
    <Card className="bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <p className="font-semibold text-slate-900">AI Sales Consultant</p>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Get personalized component recommendations, analyze capabilities, or ask technical questions. Our AI analyzes your needs and suggests the best solutions—including transparent recommendations for products beyond our platform.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about components, analysis, or project needs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startConsultation()}
            className="text-sm"
          />
          <Button onClick={startConsultation} disabled={loading || !query.trim()} className="gap-2 bg-violet-600 hover:bg-violet-700">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatInterface({ conversation, onClose }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(conversation.messages || []);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setSending(true);
    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: input
      });

      // Subscribe to updates
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages);
      });

      setInput("");
      return () => unsubscribe();
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-96 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-600 to-blue-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <p className="text-sm font-semibold text-white">Sales Consultant</p>
        </div>
        <button onClick={onClose} className="text-white hover:opacity-80">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg text-xs ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-900'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Follow-up question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="text-xs"
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()} size="sm" className="bg-violet-600 hover:bg-violet-700">
          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        </Button>
      </div>
    </Card>
  );
}