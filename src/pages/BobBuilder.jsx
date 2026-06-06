import React, { useState, useEffect, useRef } from "react";
import {
  Bot, Code, AlertTriangle, Zap, ChevronRight, Send, FileText, FileDown,
  Rocket, LayoutTemplate, X, Save, CheckCircle2, Loader2, Package, BookOpen,
  Sparkles, ArrowRight, Mic, MicOff, Paperclip, History, Camera, Lock, LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import BobFrameworkForm from "@/components/bob/BobFrameworkForm";
import BobHistoryPanel from "@/components/bob/BobHistoryPanel";
import BobVoiceSettings from "@/components/bob/BobVoiceSettings";
import BobChatInput from "@/components/bob/BobChatInput";
import BobPendingIndicator from "@/components/bob/BobPendingIndicator";
import NextStepActions from "@/components/bob/NextStepActions";
import BobTricks from "@/components/bob/BobTricks";
import StopButton from "@/components/StopButton";
import useBobAccess from "@/hooks/useBobAccess";
import useBobChat from "@/hooks/useBobChat";
import { buildDocContext } from "@/lib/extractDocText";
import {
  playTileDrop, playChime, playCashIn, sayHi, sayThinking,
  sayQuestion, sayReady, sayTiles, saySubmitted,
} from "@/lib/bobSounds";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
  "Help me create a new X1 Risk & Compliance component",
  "Review my component for safety and trust score",
  "What's the best pricing for my component type?",
  "Generate full metadata for my component",
  "Explain the Yotta Protocol standards",
  "Build a component framework for construction finance",
];

const SPLASH_SUGGESTIONS = [
  { label: "Build a Risk Compliance Component", icon: "🛡️" },
  { label: "Design a Site Reporting X4", icon: "📋" },
  { label: "Optimize my component pricing", icon: "💡" },
  { label: "Review my trust score", icon: "⭐" },
];

const DEFAULT_FRAMEWORK = {
  project: { enabled: true },
  component_identity: { enabled: true },
  ai_behavior: { enabled: true },
  input_output: { enabled: true },
  compliance_safety: { enabled: true },
  pricing_monetization: { enabled: true },
  deployment: { enabled: true },
  branding_docs: { enabled: false },
};

const LICENSED = [
  { code: "RP-CONSTRUCTION-1.0", name: "Ironclad Protocol", type: "X1" },
  { code: "RC-CONSTRUCTION", name: "The Site Board", type: "X4" },
  { code: "PM-CONSTRUCTION-BID", name: "Estimator's Eye", type: "X2" },
  { code: "PM-SCHEDULE-1.0", name: "Schedule Pulse", type: "X2" },
];

function MessageBubble({ m }) {
  const isUser = m.role === "user";
  const hasText = typeof m.content === "string" && m.content.trim().length > 0;
  const runningTools = (m.tool_calls || []).filter(
    (t) => !t.status || ["pending", "in_progress", "running"].includes(t.status)
  );

  if (!isUser && !hasText) {
    if (runningTools.length === 0) return null;
    return (
      <div className="flex items-start gap-2.5">
        <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" alt="BOB" />
        <div className="bg-slate-800 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-sm text-xs flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
          Working… searching & analyzing
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" alt="BOB" />
      )}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-violet-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-200 rounded-tl-sm"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{m.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              code: ({ inline, children }) => inline
                ? <code className="bg-slate-700 px-1 py-0.5 rounded text-violet-300 text-xs">{children}</code>
                : <pre className="bg-slate-900 rounded-lg p-3 overflow-x-auto text-xs text-green-400 my-2">{children}</pre>,
              p: ({ children }) => <p className="my-1">{children}</p>,
            }}
          >{m.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function BobBuilder() {
  const { isPaying } = useBobAccess();
  const {
    convId, messages, isWorking,
    send, stop, openConversation, resetBoard, initConv, setMessages, setOnDone,
  } = useBobChat();

  const [launched, setLaunched] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [clearSignal, setClearSignal] = useState(0);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [notifyWhenDone, setNotifyWhenDone] = useState(false);
  const [emailWhenDone, setEmailWhenDone] = useState(false);

  // Framework
  const [framework, setFramework] = useState(DEFAULT_FRAMEWORK);
  const [frameworkName, setFrameworkName] = useState("My Component Framework");
  const [applyToAll, setApplyToAll] = useState(false);
  const [savedFrameworks, setSavedFrameworks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Deploy
  const [deployStatus, setDeployStatus] = useState(null);
  const [exporting, setExporting] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const greetedRef = useRef(false);
  const userActedRef = useRef(false);     // user started a session → block restore race
  const notifyPendingRef = useRef(false);
  const lastSoundKeyRef = useRef(null);

  // ── Completion callback: sounds + optional notify, fired by the chat engine ──
  useEffect(() => {
    setOnDone((last, msgs) => {
      const key = `${(msgs || []).length}:${(last.content || "").slice(0, 40)}`;
      if (lastSoundKeyRef.current === key) return;
      lastSoundKeyRef.current = key;

      const text = (last.content || "").toLowerCase();
      const isTile = /\btile\b|book tile/.test(text);
      const submitted = /(creat|submit|publish|bulk|added|pending[_ ]review|priced|deploy[- ]?ready)/.test(text);
      const usedCreate = (last.tool_calls || []).some((t) => /create|bulkcreate/i.test(t.name || ""));
      const asking = /\?\s*$/.test((last.content || "").trim()) ||
        /\b(let me know|how (would|do) you|which|would you like|should i|tell me|what.s next|say "?go"?)\b/i.test(text);

      if (isTile && (submitted || usedCreate)) { playTileDrop(); setTimeout(sayTiles, 500); }
      else if (submitted || usedCreate) { playCashIn(); setTimeout(saySubmitted, 500); }
      else { playChime(); setTimeout(asking ? sayQuestion : sayReady, 450); }

      if (notifyPendingRef.current) { notifyPendingRef.current = false; notifyJobComplete(last); }
    });
  }, [setOnDone, emailWhenDone, convId]);

  useEffect(() => { loadFrameworks(); restoreActiveConversation(); }, []);

  // Robotic "hi" when the workspace opens.
  useEffect(() => {
    if (launched && !greetedRef.current) { greetedRef.current = true; sayHi(); }
    if (!launched) greetedRef.current = false;
  }, [launched]);

  // Persist active conversation id for cross-session restore.
  useEffect(() => {
    if (convId) localStorage.setItem("bob_active_conv", convId);
  }, [convId]);

  // Auto-scroll on new messages unless the user scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 60);
  }, [messages, isWorking]);

  const notifyJobComplete = async (lastMsg) => {
    try {
      const user = await base44.auth.me();
      if (!user?.id) return;
      const preview = (lastMsg?.content || "Your BOB job is complete.").replace(/\s+/g, " ").trim().slice(0, 140);
      await base44.functions.invoke("sendNotification", {
        user_id: user.id, type: "component_published", severity: "info",
        title: "BOB finished your job", message: `BOB completed your request. ${preview}`,
        action_url: "/builder/bob", action_label: "Open in BOB",
        force_email: emailWhenDone, metadata: { conversation_id: convId },
      });
    } catch (e) { console.error("BOB notify failed:", e); }
  };

  // ── Conversation restore (cross-session / cross-device) ─────────────────────
  const restoreActiveConversation = async () => {
    if (userActedRef.current) return;
    const saved = localStorage.getItem("bob_active_conv");
    if (saved) {
      try {
        const full = await base44.agents.getConversation(saved);
        if (userActedRef.current) return;
        if (full && (full.messages || []).length > 0) { enterRestored(full); return; }
      } catch { localStorage.removeItem("bob_active_conv"); }
    }
    try {
      const list = await base44.agents.listConversations({ agent_name: "bob_builder" });
      if (userActedRef.current) return;
      const latest = (list || [])
        .filter((c) => !c.metadata?.trashed && c.metadata?.name && c.metadata.name !== "New Project")
        .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))[0];
      if (!latest) return;
      const full = await base44.agents.getConversation(latest.id);
      if (userActedRef.current) return;
      if (full && (full.messages || []).length > 0) enterRestored(full);
    } catch { /* best-effort */ }
  };

  const enterRestored = (full) => {
    if (userActedRef.current) return;
    openConversation(full);
    setLaunched(true);
    setActiveTab("chat");
  };

  const loadFrameworks = async () => {
    const data = await base44.entities.ComponentFramework.list("-created_date", 10);
    setSavedFrameworks(data);
    if (data.length > 0) {
      setFramework(data[0]);
      setFrameworkName(data[0].framework_name || "My Component Framework");
      setApplyToAll(data[0].apply_to_all || false);
    }
  };

  // Title a conversation from the first prompt (only if still unnamed).
  const deriveTitle = (text) => {
    if (!text) return null;
    let t = text.replace(/\[Attached files:[^\]]*\]/gi, " ").replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return null;
    return t.length > 60 ? t.slice(0, 60).trim() + "…" : t;
  };
  const titleProject = async (c, text) => {
    if (!c) return;
    const current = c?.metadata?.name;
    if (current && current !== "New Project") return;
    const title = deriveTitle(text);
    if (!title) return;
    await base44.agents.updateConversation(c.id, { metadata: { ...(c.metadata || {}), name: title } });
  };

  // ── THE single send pipeline for the chat ───────────────────────────────────
  // Every entry point (typed send, quick prompt, framework, code, next-step,
  // splash launch) funnels through here. No competing flags, no double sends.
  const dispatch = async (content, file_urls) => {
    const text = (content || "").trim();
    if (!text && !(file_urls && file_urls.length)) return;
    userActedRef.current = true;
    if (notifyWhenDone) notifyPendingRef.current = true;
    sayThinking();
    const c = await send({ content, file_urls });
    titleProject(c, text || (file_urls && "attachment")).catch(() => {});
  };

  // Typed message (with any staged uploads).
  const handleSend = async () => {
    const msg = input.trim();
    if (!msg && uploadedFiles.length === 0) return;
    setInput("");
    setClearSignal((s) => s + 1);
    const files = uploadedFiles;
    setUploadedFiles([]);
    if (files.length > 0) {
      const fileList = files.map((f) => f.name).join(", ");
      const docContext = await buildDocContext(files);
      const full = `${msg ? msg + "\n\n" : ""}[Attached files: ${fileList}]\nPlease analyze and incorporate these documents into my component build.${docContext}`;
      await dispatch(full, files.map((f) => f.url));
    } else {
      await dispatch(msg);
    }
  };

  // ── Splash / session controls ───────────────────────────────────────────────
  const launch = async (seedText) => {
    userActedRef.current = true;
    setLaunched(true);
    setActiveTab("chat");
    if (seedText?.trim()) {
      setInput("");
      setClearSignal((s) => s + 1);
      await dispatch(seedText);
    } else {
      resetBoard();
    }
  };
  const handleSplashSubmit = (e) => { e?.preventDefault(); launch(input.trim() ? input : undefined); };

  const openHistory = () => { userActedRef.current = true; setLaunched(true); setActiveTab("chat"); resetBoard(); };
  const wipeBoard = () => { userActedRef.current = true; setActiveTab("chat"); resetBoard(); localStorage.removeItem("bob_active_conv"); };
  const openProject = async (c) => {
    userActedRef.current = true;
    const full = await base44.agents.getConversation(c.id);
    openConversation(full);
    setActiveTab("chat");
  };

  // Spin Off — fork into a new conversation pre-seeded for a one-word "go".
  const spinOff = async (c) => {
    userActedRef.current = true;
    const full = await base44.agents.getConversation(c.id);
    const history = full.messages || [];
    const firstUser = history.find((m) => m.role === "user");
    const sourceUrls = [...new Set(history.flatMap((m) => m.file_urls || []))];
    const originalBrief = firstUser?.content || "the original component";
    const originalTitle = c.metadata?.name && c.metadata.name !== "New Project"
      ? c.metadata.name.replace(/^Spin-Off · /, "") : deriveTitle(originalBrief) || "project";

    const newConv = await initConv("Spin-Off · " + originalTitle);
    setMessages([]);
    setActiveTab("chat");
    const seed =
      `SPIN-OFF REQUEST — fork of a prior project.\n\nOriginal brief:\n"${originalBrief}"\n\n` +
      (sourceUrls.length ? `Original source files are attached.\n\n` : ``) +
      `Using all the context, codes, framework, and pricing from the original, proactively propose ONE strong ` +
      `spin-off variant (a new version, a different vertical, or an upmarket tier) that I can monetize. Pre-fill ` +
      `everything — name, type (X1/X2/X4), description, pricing, and the marketplace listing — and lay out the full ` +
      `build plan. Assume I approve unless I object. End by asking me to simply say "go" to generate it.`;
    await dispatch(seed, sourceUrls.length ? sourceUrls : undefined);
  };

  // ── Voice ────────────────────────────────────────────────────────────────────
  const toggleRecording = async () => {
    if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); return; }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const file = new File([new Blob(audioChunksRef.current, { type: "audio/webm" })], "voice.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  // ── Files ────────────────────────────────────────────────────────────────────
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

  // Bob Look — camera photo sent straight to BOB.
  const handleBobLook = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    const lookMsg =
      "Bob Look — analyze this photo. Read every visible title/label in the image, including the focused item AND any " +
      "books, products, or documents on the surrounding shelves or background. List what you see, then tell me what we can build or do with it.";
    await dispatch(lookMsg, [file_url]);
  };

  // ── Other senders (all funnel into dispatch) ────────────────────────────────
  const submitCode = async () => {
    if (!codeInput.trim()) return;
    const msg = `Please analyze this component code:\n\`\`\`\n${codeInput}\n\`\`\`\n\nIdentify the type (X1/X2/X4), improvements, safety issues, and generate publish-ready metadata.`;
    setShowCodePanel(false);
    setActiveTab("chat");
    await dispatch(msg);
  };
  const sendFrameworkToChat = async () => {
    setActiveTab("chat");
    await dispatch(`Here is my component framework:\n\nFramework: ${frameworkName}\n\nValidate it and create a starter component spec.`);
  };
  const handleDeploy = async () => {
    setDeployStatus("deploying");
    setActiveTab("chat");
    await dispatch(`I'm ready to deploy. Using my saved framework "${frameworkName}", please generate the final component specification including manifest JSON, API endpoint spec, trust score pre-check, and marketplace listing copy. Mark it DEPLOY-READY when complete.`);
    setDeployStatus("done");
  };

  const saveFramework = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    const data = { ...framework, framework_name: frameworkName, apply_to_all: applyToAll, builder_id: user?.id || "builder" };
    if (framework.id) await base44.entities.ComponentFramework.update(framework.id, data);
    else { const saved = await base44.entities.ComponentFramework.create(data); setFramework(saved); }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    setSaving(false);
  };

  const handleExport = async (format) => {
    if (!isPaying) return;
    setExporting(true);
    const response = await base44.functions.invoke("exportComponentDoc", { framework, format });
    const blob = new Blob([response.data], { type: format === "word" ? "application/msword" : "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${frameworkName.replace(/\s+/g, "_")}_Framework.${format === "word" ? "doc" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const TAB_CONFIG = [
    { id: "chat", label: "BOB Chat", icon: Bot },
    { id: "framework", label: "Component Framework", icon: LayoutTemplate },
    { id: "deploy", label: "Deploy & Export", icon: Rocket },
  ];

  // ── SPLASH ───────────────────────────────────────────────────────────────────
  if (!launched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 flex flex-col">
        <SharedNav mode="builder" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center mb-10">
            <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" alt="BOB AI Advisor" className="w-28 h-28 rounded-full object-cover shadow-2xl shadow-violet-500/40 mb-6 ring-4 ring-violet-500/30" />
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight text-center">Meet <span className="text-violet-400">BOB</span></h1>
            <p className="text-slate-400 text-lg mt-2 text-center max-w-md">Your AI-powered component builder. Design, analyze, and publish world-class YottaJoule components.</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] bg-emerald-900/60 text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-700/40 animate-pulse">● LIVE</span>
              <span className="text-[11px] bg-violet-900/60 text-violet-300 px-2.5 py-1 rounded-full font-semibold border border-violet-700/40">Yotta Protocol · Backend Builder Platform</span>
              <Link to="/builder" className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 rounded-full transition-colors">
                <LayoutDashboard className="w-3 h-3" /> Builder Dashboard
              </Link>
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-2">
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-violet-900/60 border border-violet-700 text-violet-300 text-[11px] px-2.5 py-1 rounded-full">
                    <Paperclip className="w-3 h-3" /><span className="max-w-[120px] truncate">{f.name}</span>
                    <button type="button" onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-violet-400 hover:text-white ml-0.5"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}

            <BobChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSplashSubmit}
              clearSignal={clearSignal}
              placeholder={isRecording ? "🎙 Listening — speak your prompt..." : "What would you like to build today? Enter to launch, Shift+Enter for a new line…"}
              minHeight={96}
              maxHeight={260}
              autoFocus
            />

            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.csv,.doc,.docx,.txt,.json,.xlsx,.xls,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBobLook} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Attach files" className="flex items-center gap-1.5 text-slate-400 hover:text-violet-400 border border-slate-700 hover:border-violet-500 px-3 py-2 rounded-xl text-xs transition-all">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Attach
              </button>
              <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={uploading} title="Take a photo and send it straight to BOB" className="flex items-center gap-1.5 text-violet-300 hover:text-white border border-violet-700 hover:border-violet-500 bg-violet-900/30 px-3 py-2 rounded-xl text-xs transition-all">
                <Camera className="w-3.5 h-3.5" /> BOB Look
              </button>
              <button type="button" onClick={toggleRecording} title={isRecording ? "Stop recording" : "Voice to text"} className={`flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs transition-all ${isRecording ? "bg-red-600 border-red-500 text-white animate-pulse" : "text-slate-400 hover:text-violet-400 border-slate-700 hover:border-violet-500"}`}>
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}{isRecording ? "Stop" : "Voice"}
              </button>
              <div className="flex-1" />
              <button type="button" onClick={handleSplashSubmit} disabled={!input.trim() && uploadedFiles.length === 0} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> Start Building
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
            {SPLASH_SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => launch(s.label)} className="flex items-center gap-3 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 hover:border-violet-500 text-slate-300 hover:text-white text-sm px-4 py-3 rounded-xl transition-all text-left group">
                <span className="text-xl">{s.icon}</span><span className="flex-1">{s.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
              </button>
            ))}
          </div>

          <button onClick={openHistory} className="flex items-center gap-3 mt-3 w-full max-w-2xl bg-violet-900/30 hover:bg-violet-800/40 border border-violet-700/50 hover:border-violet-500 text-slate-300 hover:text-white text-sm px-4 py-3 rounded-xl transition-all text-left group">
            <span className="w-8 h-8 rounded-lg bg-violet-800/60 flex items-center justify-center flex-shrink-0"><History className="w-4 h-4 text-violet-300" /></span>
            <div className="flex-1"><p className="font-semibold">View Project History</p><p className="text-[11px] text-slate-500">Reopen, fork, or spin off a past project from the Wipe Board</p></div>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
          </button>

          <div className="mt-10 w-full max-w-2xl">
            <p className="text-xs text-slate-500 text-center mb-3 font-semibold uppercase tracking-widest">Licensed Foundation Components</p>
            <div className="flex flex-wrap justify-center gap-2">
              {LICENSED.map((c) => (
                <div key={c.code} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2">
                  <span className="text-[10px] bg-violet-900 text-violet-300 px-1.5 py-0.5 rounded-full font-bold">{c.type}</span>
                  <span className="text-xs text-slate-300 font-medium">{c.name}</span>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">✓ Licensed</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── WORKSPACE ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" alt="BOB" className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-violet-500/30 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-black text-white">BOB <span className="text-violet-400">Advanced Builder</span></h1>
              <p className="text-slate-400 text-xs mt-0.5">Magna Dev · Yotta Protocol · YottaJoule Licensed Components</p>
            </div>
          </div>
          <div className="sm:ml-auto flex flex-wrap items-center gap-2">
            <span className="text-[10px] bg-emerald-900 text-emerald-400 px-2 py-1 rounded-full font-semibold animate-pulse">● LIVE</span>
            <Link to="/builder" className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 rounded-lg transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /> Builder Dashboard
            </Link>
            <button onClick={() => setLaunched(false)} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors">← New Session</button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1 mb-6">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === id ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <BobHistoryPanel activeConvId={convId} onOpen={openProject} onWipeBoard={wipeBoard} onSpinOff={spinOff} />
              <BobVoiceSettings />
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs text-slate-300 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-violet-400" />Quick Prompts</CardTitle></CardHeader>
                <CardContent className="px-3 pb-3 space-y-1">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => dispatch(p)} className="w-full text-left text-[11px] text-slate-400 hover:text-white hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                      <ChevronRight className="w-2.5 h-2.5 text-violet-500 flex-shrink-0" />{p}
                    </button>
                  ))}
                </CardContent>
              </Card>
              <button onClick={() => setShowCodePanel(!showCodePanel)} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors">
                <Code className="w-3.5 h-3.5" /> Paste Component Code
              </button>
              <button onClick={sendFrameworkToChat} className="w-full flex items-center justify-center gap-2 bg-violet-900 hover:bg-violet-800 border border-violet-700 text-violet-300 hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors">
                <LayoutTemplate className="w-3.5 h-3.5" /> Send Framework to BOB
              </button>
              <div className="bg-slate-800 border border-amber-800/40 rounded-xl p-3">
                <div className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" /><p className="text-[10px] text-slate-400 leading-relaxed">BOB flags ill-intent indicators per the <strong className="text-slate-300">Sensitive Intelligence Policy</strong>.</p></div>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-3">
              {showCodePanel && (
                <Card className="bg-slate-800 border-violet-700">
                  <CardContent className="pt-4">
                    <p className="text-xs text-violet-400 font-semibold mb-2">Paste your component code:</p>
                    <textarea value={codeInput} onChange={(e) => setCodeInput(e.target.value)} className="w-full h-44 bg-slate-950 text-green-400 font-mono text-xs p-3 rounded-lg border border-slate-600 outline-none focus:border-violet-500 resize-none" placeholder="// Paste component code here..." />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={submitCode} size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs">Analyze with BOB</Button>
                      <Button onClick={() => setShowCodePanel(false)} variant="ghost" size="sm" className="text-slate-400 text-xs">Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-900 border-slate-700 flex flex-col" style={{ minHeight: "520px" }}>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[520px]">
                  {messages.length === 0 && !isWorking && (
                    <div className="flex items-start gap-3 mt-2">
                      <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="BOB" />
                      <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-slate-200 text-sm">Hey! Builder Operated Bot online. I'm BOB — the Advanced Builder. I can help you design, analyze, and publish components using licensed YottaJoule components as a foundation.</p>
                        <p className="text-slate-400 text-xs mt-2">Use the <strong className="text-violet-400">Framework tab</strong> to configure your project blueprint, then send it to me for analysis. Or jump straight into a build below.</p>
                      </div>
                    </div>
                  )}
                  {messages.map((m, i) => <MessageBubble key={i} m={m} />)}
                  {isWorking && <BobPendingIndicator />}
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-violet-900/60 border border-violet-700 text-violet-300 text-[11px] px-2.5 py-1 rounded-full">
                        <Paperclip className="w-3 h-3" /><span className="max-w-[120px] truncate">{f.name}</span>
                        <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="text-violet-400 hover:text-white ml-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-700 p-3 space-y-2">
                  <NextStepActions onPick={(p) => dispatch(p)} disabled={isWorking} />
                  <BobChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSend}
                    clearSignal={clearSignal}
                    placeholder={isRecording ? "🎙 Listening — speak your prompt..." : "Ask BOB anything…  Enter = send · Shift+Enter = new line"}
                    minHeight={52}
                    maxHeight={200}
                  />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-0.5">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                      <input type="checkbox" checked={notifyWhenDone} onChange={(e) => { setNotifyWhenDone(e.target.checked); if (!e.target.checked) setEmailWhenDone(false); }} className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500" />
                      Notify me when done <span className="text-slate-600">(leave the page — BOB keeps working)</span>
                    </label>
                    {notifyWhenDone && (
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer select-none">
                        <input type="checkbox" checked={emailWhenDone} onChange={(e) => setEmailWhenDone(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500" />
                        Email me too <span className="text-slate-600">(for when you leave the device)</span>
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.csv,.doc,.docx,.txt,.json,.xlsx,.xls,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBobLook} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Attach files" className="flex items-center gap-1.5 text-slate-400 hover:text-violet-400 border border-slate-700 hover:border-violet-500 px-2.5 py-1.5 rounded-lg text-xs transition-all">
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Attach
                    </button>
                    <button onClick={() => cameraInputRef.current?.click()} disabled={uploading} title="Take a photo and send it straight to BOB" className="flex items-center gap-1.5 text-violet-300 hover:text-white border border-violet-700 hover:border-violet-500 bg-violet-900/30 px-2.5 py-1.5 rounded-lg text-xs transition-all">
                      <Camera className="w-3.5 h-3.5" /> BOB Look
                    </button>
                    <button onClick={toggleRecording} title={isRecording ? "Stop recording" : "Voice to text"} className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs transition-all ${isRecording ? "bg-red-600 border-red-500 text-white animate-pulse" : "text-slate-400 hover:text-violet-400 border-slate-700 hover:border-violet-500"}`}>
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}{isRecording ? "Stop" : "Voice"}
                    </button>
                    <div className="flex-1" />
                    {isWorking && <StopButton onStop={stop} />}
                    <button onClick={handleSend} disabled={!input.trim() && uploadedFiles.length === 0} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold">
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                  <BobTricks />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* FRAMEWORK TAB */}
        {activeTab === "framework" && (
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 font-semibold block mb-1">Framework Name</label>
                    <input value={frameworkName} onChange={(e) => setFrameworkName(e.target.value)} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none focus:ring-1 focus:ring-violet-500" />
                  </div>
                  {savedFrameworks.length > 0 && (
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 font-semibold block mb-1">Load Saved Framework</label>
                      <select onChange={(e) => { const f = savedFrameworks.find((sf) => sf.id === e.target.value); if (f) { setFramework(f); setFrameworkName(f.framework_name); setApplyToAll(f.apply_to_all); } }} className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 outline-none">
                        <option value="">Select saved...</option>
                        {savedFrameworks.map((f) => <option key={f.id} value={f.id}>{f.framework_name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex gap-2 sm:mt-5">
                    <Button onClick={saveFramework} disabled={saving} size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}{saveSuccess ? "Saved!" : "Save"}
                    </Button>
                    <Button onClick={sendFrameworkToChat} size="sm" variant="outline" className="border-violet-600 text-violet-400 hover:bg-violet-900 text-xs gap-1.5"><Bot className="w-3.5 h-3.5" /> Send to BOB</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <BobFrameworkForm framework={framework} onChange={setFramework} applyToAll={applyToAll} onToggleApplyAll={setApplyToAll} />

            <div className="flex gap-3 pt-2">
              <Button onClick={saveFramework} disabled={saving} className="bg-violet-600 hover:bg-violet-700 gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Framework</Button>
              <Button onClick={sendFrameworkToChat} variant="outline" className="border-violet-600 text-violet-400 hover:bg-violet-900 gap-2"><Bot className="w-4 h-4" /> Validate with BOB</Button>
              <Button onClick={() => setActiveTab("deploy")} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2"><Rocket className="w-4 h-4" /> Go to Deploy</Button>
            </div>
          </div>
        )}

        {/* DEPLOY TAB */}
        {activeTab === "deploy" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-3"><CardTitle className="text-sm text-white flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400" />Export Framework Document</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-400">Export your complete component framework as a downloadable document for team distribution, compliance records, or investor review.</p>
                  <div className="bg-slate-800 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Current Framework</p>
                    <p className="text-sm font-bold text-white">{frameworkName}</p>
                    <p className="text-[10px] text-slate-400">{Object.entries(framework).filter(([, v]) => v?.enabled).length} sections enabled · Apply to all: {applyToAll ? "ON" : "Off"}</p>
                  </div>
                  {isPaying ? (
                    <div className="grid grid-cols-3 gap-2">
                      <Button onClick={() => handleExport("pdf")} disabled={exporting} className="bg-red-600 hover:bg-red-700 text-xs gap-1.5">{exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} PDF</Button>
                      <Button onClick={() => handleExport("word")} disabled={exporting} className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5">{exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />} Word</Button>
                      <Button onClick={() => handleExport("csv")} disabled={exporting} className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5">{exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} CSV</Button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-violet-700/40 bg-violet-950/40 p-3 text-center">
                      <Lock className="w-4 h-4 text-violet-400 mx-auto mb-1.5" />
                      <p className="text-[11px] text-slate-300 font-semibold mb-0.5">Document downloads are a paid feature</p>
                      <p className="text-[10px] text-slate-500 mb-2.5">Upgrade to download your framework as PDF, Word, or CSV.</p>
                      <Link to="/pricing"><Button size="sm" className="bg-gradient-to-r from-violet-500 to-violet-700 hover:opacity-90 text-xs gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Upgrade to Unlock</Button></Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-3"><CardTitle className="text-sm text-white flex items-center gap-2"><Rocket className="w-4 h-4 text-emerald-400" />Deploy to Marketplace</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-400">BOB will generate a complete component specification and initiate the marketplace submission workflow.</p>
                  <div className="space-y-2 text-[11px] text-slate-400">
                    {["Framework validation & compliance check", "Component manifest JSON generation", "Trust score pre-assessment", "Marketplace listing copy", "Submit for admin review"].map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${deployStatus === "done" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"}`}>{deployStatus === "done" ? "✓" : i + 1}</div>
                        {step}
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleDeploy} disabled={deployStatus === "deploying"} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 text-xs mt-2">
                    {deployStatus === "deploying" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</> : deployStatus === "done" ? <><CheckCircle2 className="w-3.5 h-3.5" />View in Chat</> : <><Rocket className="w-3.5 h-3.5" />Deploy with BOB</>}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-white flex items-center gap-2"><Package className="w-4 h-4 text-violet-400" />Licensed Base Components</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400 mb-3">Your new component can extend these licensed YottaJoule components as a foundation:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {LICENSED.map((c) => (
                    <div key={c.code} className="flex items-center justify-between bg-slate-800 rounded-xl px-3 py-2.5">
                      <div><p className="text-xs font-bold text-white">{c.name}</p><p className="text-[10px] font-mono text-slate-400">{c.code}</p></div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-violet-900 text-violet-300 px-1.5 py-0.5 rounded-full font-bold">{c.type}</span>
                        <span className="text-[9px] bg-emerald-900 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">✓ Licensed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}