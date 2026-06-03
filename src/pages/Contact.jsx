import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import PlatformSocials from "@/components/PlatformSocials";

export default function Contact() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [conv, setConv] = useState(null);

  useEffect(() => {
    base44.entities.ContactInfo.list("-created_date", 1)
      .then(data => { setInfo(data[0] || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!convId) return;
    const unsub = base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [convId]);

  const openChat = async () => {
    setChatOpen(true);
    if (!conv) {
      const newConv = await base44.agents.createConversation({
        agent_name: "customer_support",
        metadata: { name: "Support Chat" }
      });
      setConv(newConv);
      setConvId(newConv.id);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conv) return;
    setSending(true);
    const msg = input;
    setInput("");
    await base44.agents.addMessage(conv, { role: "user", content: msg });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SharedNav mode="user" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Contact Us</h1>
          <p className="text-slate-600 text-lg">We're here to help. Reach out any time.</p>
        </div>

        {!loading && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {info?.phone && (
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Phone</h3>
                  <a href={`tel:${info.phone}`} className="text-violet-600 font-medium hover:underline text-lg">
                    {info.phone}
                  </a>
                  <p className="text-xs text-slate-500">Tap to call</p>
                </CardContent>
              </Card>
            )}

            {info?.email && (
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <a href={`mailto:${info.email}`} className="text-blue-600 font-medium hover:underline text-base">
                    {info.email}
                  </a>
                  <p className="text-xs text-slate-500">Tap to email</p>
                </CardContent>
              </Card>
            )}

            {info?.support_hours && (
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Support Hours</h3>
                  <p className="text-slate-700 font-medium">{info.support_hours}</p>
                </CardContent>
              </Card>
            )}

            {!info && (
              <>
                <Card><CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center"><Phone className="w-6 h-6 text-violet-600" /></div>
                  <h3 className="font-semibold text-slate-900">Phone</h3>
                  <a href="tel:+15550000000" className="text-violet-600 font-medium hover:underline text-lg">+1 (555) 000-0000</a>
                </CardContent></Card>
                <Card><CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Mail className="w-6 h-6 text-blue-600" /></div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <a href="mailto:support@altshiftx.com" className="text-blue-600 font-medium hover:underline">support@altshiftx.com</a>
                </CardContent></Card>
                <Card><CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-emerald-600" /></div>
                  <h3 className="font-semibold text-slate-900">Support Hours</h3>
                  <p className="text-slate-700 font-medium">Mon–Fri 9am–5pm PST</p>
                </CardContent></Card>
              </>
            )}
          </div>
        )}

        {/* FAQ */}
        {info?.faq_items?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {info.faq_items.map((faq, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4">
                    <p className="font-semibold text-slate-900 mb-1">{faq.question}</p>
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Live Chat CTA */}
        <div className="text-center">
          <p className="text-slate-600 mb-4">Need instant help? Chat with our AI support assistant.</p>
          <button
            onClick={openChat}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Start Live Chat
          </button>
        </div>

        {/* Follow us */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">Follow us</p>
          <PlatformSocials variant="dark" />
          <p className="text-xs text-slate-400 pt-2">Powered by: Trust AR LLC.</p>
        </div>
      </div>

      {/* Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-[480px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Support Chat</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-slate-400 text-xs text-center mt-4">Hi! How can we help you today?</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-3 py-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-slate-300"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}