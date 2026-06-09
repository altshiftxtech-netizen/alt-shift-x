import React, { useState, useEffect, useRef } from "react";
import {
  Send, Sparkles, Loader2, Paperclip, Mic, MicOff, X, ArrowRight,
  ShieldCheck, Activity, Share2, Bot, MessageSquare, LayoutDashboard, History, Mail, Newspaper
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import useAgentStream from "@/hooks/useAgentStream";
import StopButton from "@/components/StopButton";
import { buildDocContext } from "@/lib/extractDocText";
import UpKeeperMessage from "@/components/upkeeper/UpKeeperMessage";
import UpKeeperGate from "@/components/upkeeper/UpKeeperGate";
import SocialStudio from "@/components/upkeeper/SocialStudio";
import EmailCampaignStudio from "@/components/upkeeper/EmailCampaignStudio";
import ArticleStudio from "@/components/upkeeper/ArticleStudio";
import UpKeeperHistoryPanel from "@/components/upkeeper/UpKeeperHistoryPanel";
import ApproveComponentsButton from "@/components/upkeeper/ApproveComponentsButton";
import InviteAdminButton from "@/components/upkeeper/InviteAdminButton";
import UpKeeperProfileMenu from "@/components/upkeeper/UpKeeperProfileMenu";

const AVATAR = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/3f9a15d43_generated_image.png";

const SPLASH_SUGGESTIONS = [
  { label: "Run a full site health check", icon: "🩺" },
  { label: "Show me open security incidents", icon: "🛡️" },
  { label: "Draft an Instagram reel announcing our new feature", icon: "🎬" },
  { label: "Summarize what every agent reported today", icon: "📊" },
];

const QUICK_PROMPTS = [
  "What's broken on the site right now?",
  "Review recent error reports and prioritize fixes",
  "Compose a LinkedIn post about our platform",
  "Check governance & trust scores across components",
  "What changes are pending admin approval?",
];

export default function UpKeeper() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const isAdmin = user?.role === "admin";
  const allowed = user?.role === "admin" || user?.role === "staff";

  const [launched, setLaunched] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [conv, setConv] = useState(null);
  const [convId, setConvId] = useState(null);
  const { messages, setMessages, isGenerating, stop: stopGenerating, onSent } = useAgentStream(convId, []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch { setUser(null); }
      setChecking(false);
    })();
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) setTimeout(() => { const c = scrollContainerRef.current; if (c) c.scrollTop = c.scrollHeight; }, 60);
  }, [messages]);

  if (checking || !allowed) {
    return <UpKeeperGate checking={checking} role={user?.role} />;
  }

  const initConv = async () => {
    const c = await base44.agents.createConversation({
      agent_name: "the_upkeeper",
      metadata: { name: "UpKeeper Session" },
    });
    setConv(c); setConvId(c.id);
    return c;
  };

  const launch = async (seedText) => {
    setLaunched(true);
    const c = await initConv();
    if (seedText?.trim()) {
      setSending(true);
      await base44.agents.addMessage(c, { role: "user", content: seedText });
      onSent();
      setSending(false);
    }
  };

  // Launch from splash carrying any attached files into the first message.
  const launchWithFiles = async () => {
    setLaunched(true);
    const c = await initConv();
    const msg = input.trim();
    if (!msg && uploadedFiles.length === 0) return;
    setSending(true); setInput("");
    const filesToSend = uploadedFiles;
    const fileList = filesToSend.map((f) => f.name).join(", ");
    const docContext = await buildDocContext(filesToSend);
    const fullMsg = filesToSend.length > 0
      ? `${msg ? msg + "\n\n" : ""}[Attached files: ${fileList}]\nPlease analyze these.${docContext}`
      : msg;
    await base44.agents.addMessage(c, { role: "user", content: fullMsg, file_urls: filesToSend.map((f) => f.url) });
    onSent();
    setUploadedFiles([]); setSending(false);
  };

  // Open the workspace straight into Session History.
  const openHistory = async () => {
    setLaunched(true); setActiveTab("chat");
    await initConv();
  };

  // Wipe Board — start a brand-new session, keeping the workspace open.
  const wipeBoard = async () => {
    setMessages([]); setActiveTab("chat");
    await initConv();
  };

  // Reopen an existing session from history.
  const openSession = async (c) => {
    const full = await base44.agents.getConversation(c.id);
    setConv(full); setConvId(full.id);
    setMessages(full.messages || []);
    setActiveTab("chat");
  };

  const sendMessage = async (text) => {
    if (!conv || sending) return;
    const msg = text || input;
    if (!msg.trim()) return;
    setSending(true); setInput("");
    await base44.agents.addMessage(conv, { role: "user", content: msg });
    onSent();
    setSending(false);
  };

  const toggleRecording = async () => {
    if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); return; }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      setSending(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setInput((prev) => (prev ? prev + " " : "") + transcript);
      setSending(false);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push({ name: file.name, url: file_url });
    }
    setUploadedFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  const sendWithFiles = async () => {
    if (!conv || sending) return;
    const msg = input.trim();
    if (!msg && uploadedFiles.length === 0) return;
    setSending(true); setInput("");
    const filesToSend = uploadedFiles;
    const fileList = filesToSend.map((f) => f.name).join(", ");
    const docContext = await buildDocContext(filesToSend);
    const fullMsg = filesToSend.length > 0
      ? `${msg ? msg + "\n\n" : ""}[Attached files: ${fileList}]\nPlease analyze these.${docContext}`
      : msg;
    await base44.agents.addMessage(conv, { role: "user", content: fullMsg, file_urls: filesToSend.map((f) => f.url) });
    onSent();
    setUploadedFiles([]); setSending(false);
  };

  // ── SPLASH ─────────────────────────────────────────────────────────────────
  if (!launched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a120d] via-[#3a2418] to-[#1a120d] flex flex-col items-center justify-center px-4 py-12 relative">
        <div className="absolute top-4 right-4 z-10">
          <UpKeeperProfileMenu user={user} />
        </div>
        <div className="flex flex-col items-center mb-8">
          <img src={AVATAR} alt="The UpKeeper" className="w-28 h-28 rounded-full object-cover shadow-2xl shadow-orange-500/40 mb-6 ring-4 ring-orange-400/30" />
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center">
            The <span className="text-orange-400">UpKeeper</span>
          </h1>
          <p className="text-orange-200/70 text-lg mt-2 text-center max-w-md">
            Your site superintendent. Monitor, fix, and grow the platform — and create &amp; publish social content. Admins &amp; staff only.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[11px] bg-emerald-900/60 text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-700/40 animate-pulse">● LIVE</span>
            <span className="text-[11px] bg-orange-900/60 text-orange-300 px-2.5 py-1 rounded-full font-semibold border border-orange-700/40">
              {isAdmin ? "Admin · Full Control" : "Staff · Changes need approval"}
            </span>
          </div>
        </div>

        <div className="w-full max-w-2xl space-y-2">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-orange-900/60 border border-orange-700 text-orange-300 text-[11px] px-2.5 py-1 rounded-full">
                  <Paperclip className="w-3 h-3" />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button type="button" onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-orange-400 hover:text-white ml-0.5"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); launchWithFiles(); } }}
            placeholder={isRecording ? "🎙 Listening — speak your request…" : "What do you need the UpKeeper to do? (Ctrl+Enter to start)"}
            rows={3}
            className="w-full bg-[#241812] text-orange-50 text-sm px-4 py-3 rounded-2xl border border-orange-900/40 outline-none focus:border-orange-500 resize-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Attach files"
              className="flex items-center gap-1.5 text-orange-200/60 hover:text-orange-400 border border-orange-900/40 hover:border-orange-500 px-3 py-2 rounded-xl text-xs transition-all">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Attach
            </button>
            <button type="button" onClick={toggleRecording} title={isRecording ? "Stop recording" : "Voice to text"}
              className={`flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs transition-all ${isRecording ? "bg-red-600 border-red-500 text-white animate-pulse" : "text-orange-200/60 hover:text-orange-400 border-orange-900/40 hover:border-orange-500"}`}>
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />} {isRecording ? "Stop" : "Voice"}
            </button>
            <div className="flex-1" />
            <button onClick={launchWithFiles} disabled={!input.trim() && uploadedFiles.length === 0}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold text-sm">
              <Sparkles className="w-4 h-4" /> Start
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
          {SPLASH_SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => launch(s.label)}
              className="flex items-center gap-3 bg-[#241812]/80 hover:bg-[#3a2a24] border border-orange-900/40 hover:border-orange-500 text-orange-200/80 hover:text-white text-sm px-4 py-3 rounded-xl transition-all text-left group">
              <span className="text-xl">{s.icon}</span>
              <span className="flex-1">{s.label}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
            </button>
          ))}
        </div>

        <button onClick={() => { setLaunched(true); setActiveTab("social"); initConv(); }}
          className="flex items-center gap-3 mt-3 w-full max-w-2xl bg-orange-900/30 hover:bg-orange-800/40 border border-orange-700/50 hover:border-orange-500 text-orange-200/80 hover:text-white text-sm px-4 py-3 rounded-xl transition-all text-left group">
          <span className="w-8 h-8 rounded-lg bg-orange-800/60 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-4 h-4 text-orange-300" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Open Social Studio</p>
            <p className="text-[11px] text-orange-200/50">Create photos, reels &amp; videos and publish to linked accounts</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
        </button>

        <div className="mt-3 w-full max-w-2xl">
          <ApproveComponentsButton variant="splash" />
        </div>

        {isAdmin && (
          <div className="mt-3 w-full max-w-2xl">
            <InviteAdminButton variant="splash" />
          </div>
        )}

        <button onClick={openHistory}
          className="flex items-center gap-3 mt-3 w-full max-w-2xl bg-orange-900/30 hover:bg-orange-800/40 border border-orange-700/50 hover:border-orange-500 text-orange-200/80 hover:text-white text-sm px-4 py-3 rounded-xl transition-all text-left group">
          <span className="w-8 h-8 rounded-lg bg-orange-800/60 flex items-center justify-center flex-shrink-0">
            <History className="w-4 h-4 text-orange-300" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">View Session History</p>
            <p className="text-[11px] text-orange-200/50">Reopen a session or email its Maintenance Event Log (ESI)</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
        </button>
      </div>
    );
  }

  // ── WORKSPACE ───────────────────────────────────────────────────────────────
  const TABS = [
    { id: "chat", label: "UpKeeper Chat", icon: Bot },
    { id: "social", label: "Social Studio", icon: Share2 },
    { id: "email", label: "Email Studio", icon: Mail },
    { id: "articles", label: "Article Studio", icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a120d] via-[#2a1d16] to-[#1a120d]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={AVATAR} alt="The UpKeeper" className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-orange-500/30 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-black text-white">The <span className="text-orange-400">UpKeeper</span></h1>
              <p className="text-orange-200/60 text-xs mt-0.5">Site Superintendent · {isAdmin ? "Admin" : "Staff"} access</p>
            </div>
          </div>
          <div className="sm:ml-auto flex flex-wrap items-center gap-2">
            <span className="text-[10px] bg-emerald-900 text-emerald-400 px-2 py-1 rounded-full font-semibold animate-pulse">● LIVE</span>
            <button onClick={() => setLaunched(false)} className="text-xs text-orange-200/50 hover:text-orange-200 px-2 py-1 rounded-lg hover:bg-[#2a1d16] transition-colors">
              ← New Session
            </button>
            <UpKeeperProfileMenu user={user} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#241812] border border-orange-900/40 rounded-xl p-1 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === id ? "bg-orange-600 text-white shadow" : "text-orange-200/60 hover:text-white hover:bg-[#3a2a24]"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {activeTab === "chat" && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <UpKeeperHistoryPanel
                activeConvId={convId}
                onOpen={openSession}
                onWipeBoard={wipeBoard}
              />
              <div className="bg-[#241812] border border-orange-900/40 rounded-xl p-3">
                <p className="text-xs font-bold text-orange-200 flex items-center gap-1.5 mb-2"><Activity className="w-3.5 h-3.5 text-orange-400" /> Quick Ops</p>
                <div className="space-y-1">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => sendMessage(p)}
                      className="w-full text-left text-[11px] text-orange-200/60 hover:text-white hover:bg-[#3a2a24] px-2.5 py-1.5 rounded-lg transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-orange-900/40 space-y-1.5">
                  <ApproveComponentsButton variant="chat" />
                  {isAdmin && <InviteAdminButton variant="chat" />}
                </div>
              </div>
              {!isAdmin && (
                <div className="bg-[#241812] border border-amber-800/40 rounded-xl p-3 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-orange-200/60 leading-relaxed">Your changes &amp; posts are submitted for <strong className="text-amber-300">admin approval</strong> unless you're preauthorized.</p>
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <div className="bg-[#1a120d] border border-orange-900/40 rounded-xl flex flex-col" style={{ minHeight: "520px" }}>
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px]">
                  {messages.length === 0 && !sending && (
                    <div className="flex items-start gap-3 mt-2">
                      <img src={AVATAR} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="UpKeeper" />
                      <div className="bg-[#3a2a24] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-orange-50 text-sm">I'm The UpKeeper — your site superintendent. Ask me to check what's broken, plan a fix, pull platform metrics, or spin up social content. Every other agent reports up to me.</p>
                      </div>
                    </div>
                  )}
                  {messages.map((m, i) => <UpKeeperMessage key={i} m={m} />)}
                  {(sending || isGenerating) && (
                    <div className="flex items-start gap-2">
                      <img src={AVATAR} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="UpKeeper" />
                      <div className="bg-[#3a2a24] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                        {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </div>
                    </div>
                  )}
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-orange-900/60 border border-orange-700 text-orange-300 text-[11px] px-2.5 py-1 rounded-full">
                        <Paperclip className="w-3 h-3" />
                        <span className="max-w-[120px] truncate">{f.name}</span>
                        <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-orange-400 hover:text-white ml-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-orange-900/40 p-3 space-y-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendWithFiles(); } }}
                    placeholder={isRecording ? "🎙 Listening…" : "Ask The UpKeeper… Ctrl+Enter to send"}
                    rows={2}
                    disabled={sending}
                    className="w-full bg-[#241812] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-1.5 text-orange-200/60 hover:text-orange-400 border border-orange-900/40 hover:border-orange-500 px-2.5 py-1.5 rounded-lg text-xs transition-all">
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Attach
                    </button>
                    <button onClick={toggleRecording}
                      className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs transition-all ${isRecording ? "bg-red-600 border-red-500 text-white animate-pulse" : "text-orange-200/60 hover:text-orange-400 border-orange-900/40 hover:border-orange-500"}`}>
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />} {isRecording ? "Stop" : "Voice"}
                    </button>
                    <div className="flex-1" />
                    {(sending || isGenerating) ? (
                      <StopButton onStop={stopGenerating} />
                    ) : (
                      <button onClick={sendWithFiles} disabled={!input.trim() && uploadedFiles.length === 0}
                        className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold">
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <SocialStudio isAdmin={isAdmin} user={user} conversationId={convId} />
        )}

        {activeTab === "email" && <EmailCampaignStudio user={user} />}

        {activeTab === "articles" && <ArticleStudio user={user} />}
      </div>
    </div>
  );
}