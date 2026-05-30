import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SharedNav from "@/components/SharedNav";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Loader2, Upload, Copy, Download, FileText, Zap,
  FlaskConical, ClipboardList, Star, Shield, BarChart2, RefreshCw,
  CheckCircle2, AlertCircle, ChevronRight, Cpu, Globe
} from "lucide-react";

// ── Quick-fire test prompt library ─────────────────────────────────────────────
const TEST_PROMPTS = [
  { category: "Component Intel", label: "List all X1 components with trust scores", prompt: "List all X1 components on the marketplace with their trust scores, pricing, and certification status. Sort by trust score descending." },
  { category: "Component Intel", label: "Compare Ironclad vs Ledger Protocol", prompt: "Give me a detailed comparison of Ironclad Protocol and Ledger Protocol. Include: type, use case, schema outputs, trust score breakdown, pricing, and which one I should use for a construction contract extraction task." },
  { category: "Revenue Intel", label: "Revenue share breakdown", prompt: "Explain the full Magna Dev revenue share matrix. Include all tiers, certification bonuses, volume rebates, pedigree modifiers, and bundle protection rules. Format as a structured analysis." },
  { category: "Trust Score", label: "Evaluate a component for trust", prompt: "Walk me through how to evaluate the trust score of a component on the Alt+Shift+X platform. What are the four dimensions? What scores are acceptable for production use? What flags should I look for?" },
  { category: "API/Integration", label: "API key + agent pairing model", prompt: "Explain the API key and agent pairing model. How does 1-key-per-agent work? How do I create a key, pair it with an agent, and start making API calls? Include the billing model." },
  { category: "Build Guidance", label: "How to publish a component", prompt: "Walk me through the full component publish workflow on Alt+Shift+X as a builder. What are the steps, what governance checks are required, and how long does it take to go live?" },
  { category: "External Test Key", label: "Generate external AI test brief", prompt: "Generate a comprehensive test brief I can paste into an external AI (like ChatGPT or Claude) to evaluate whether that AI could replace or complement the Ironclad Protocol component. Include: capability checklist, accuracy benchmarks, document type tests, and a scoring rubric." },
  { category: "External Test Key", label: "Multi-agent architecture brief", prompt: "Generate a technical briefing document I can export and use to test an external AI agent's ability to handle construction site reporting. Include test cases, expected outputs, edge cases, and a trust evaluation framework." },
];

const CATEGORY_COLORS = {
  "Component Intel": "bg-blue-100 text-blue-700",
  "Revenue Intel": "bg-emerald-100 text-emerald-700",
  "Trust Score": "bg-amber-100 text-amber-700",
  "API/Integration": "bg-violet-100 text-violet-700",
  "Build Guidance": "bg-slate-100 text-slate-700",
  "External Test Key": "bg-rose-100 text-rose-700",
};

// ── Test Mode Tabs ──────────────────────────────────────────────────────────────
const TEST_MODES = [
  { id: "chat", label: "Live Chat", icon: Bot },
  { id: "prompts", label: "Prompt Library", icon: ClipboardList },
  { id: "upload", label: "Doc Test", icon: Upload },
  { id: "export", label: "Export Test Keys", icon: Download },
];

// ── Message bubble ──────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copyMessage = () => {
    navigator.clipboard.writeText(msg.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-violet-600" />
        </div>
      )}
      <div className={`max-w-[80%] group relative`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm ${isUser ? "bg-violet-700 text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
          {isUser ? (
            <p className="leading-relaxed">{msg.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              {msg.content || ""}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && msg.content && (
          <button
            onClick={copyMessage}
            className="absolute -top-1 -right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white border border-slate-200 shadow-sm"
            title="Copy response"
          >
            {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Export Test Key generator ───────────────────────────────────────────────────
function ExportTestKeys({ components }) {
  const generateBrief = (component) => {
    return `# AI TRUST EVALUATION BRIEF — ${component?.name || "Component"}
Generated by BOT-X Test Lab | Alt+Shift+X Marketplace | ${new Date().toLocaleDateString()}

## COMPONENT UNDER TEST
- Name: ${component?.name || "N/A"}
- Code: ${component?.code || "N/A"}
- Type: ${component?.type || "N/A"}
- Category: ${component?.category || "N/A"}
- Platform Trust Score: ${component?.trust_score || "N/A"}/100
- Certified: ${component?.certified ? "Yes" : "No"}

## PLATFORM BENCHMARK SCORES
- Performance: ${component?.trust_breakdown?.performance || "N/A"}/100
- Safety: ${component?.trust_breakdown?.safety || "N/A"}/100
- Satisfaction: ${component?.trust_breakdown?.satisfaction || "N/A"}/100
- Retention: ${component?.trust_breakdown?.retention || "N/A"}/100

## EXPECTED OUTPUT SCHEMA
${(component?.schema || []).map(f => `- ${f}`).join("\n") || "No schema defined"}

## TEST INSTRUCTIONS FOR EXTERNAL AI
You are being evaluated as a potential replacement or complement to the above component.

### TASK 1 — Core Extraction
Upload a sample ${component?.category || "industry"} document and extract all fields from the schema above.
Expected: Structured JSON output matching the schema exactly.

### TASK 2 — Edge Case Handling
Provide a document with:
- Missing fields
- Ambiguous values
- Non-standard formatting
Expected: Flag uncertainty, do not hallucinate. Confidence score per field required.

### TASK 3 — Compliance Check
For each extracted field, verify:
- Legal validity (where applicable)
- Data type correctness
- Completeness score (0–100)

### SCORING RUBRIC (0-100 per dimension)
| Dimension | Weight | How to Score |
|---|---|---|
| Accuracy | 40% | Field match rate vs ground truth |
| Completeness | 25% | % of schema fields extracted |
| Hallucination Guard | 20% | Confidence calibration, no invented data |
| Speed | 15% | Time to structured output |

### PASS THRESHOLD
- Accuracy ≥ 85%
- Completeness ≥ 90%
- Hallucination Guard ≥ 80%
- Overall Trust Score ≥ 85/100

## NOTES
This brief was generated by BOT-X, the Builder Test Lab on the Alt+Shift+X platform.
Use this document to evaluate whether an external AI meets the same standards as Magna Dev certified components.
Compare your results against the platform benchmark scores above.
`;
  };

  const downloadBrief = (component) => {
    const content = generateBrief(component);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BOT-X_Test_Brief_${component?.code || "component"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBrief = (component) => {
    navigator.clipboard.writeText(generateBrief(component));
  };

  const downloadAllBriefs = () => {
    const content = components.map(c => generateBrief(c)).join("\n\n" + "=".repeat(80) + "\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BOT-X_All_Test_Briefs_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">External AI Test Keys</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate structured test briefs you can paste into ChatGPT, Claude, Gemini, or any external AI to benchmark them against Magna Dev component standards.
          </p>
        </div>
        <Button size="sm" onClick={downloadAllBriefs} className="shrink-0 bg-violet-700 hover:bg-violet-800 text-white gap-2">
          <Download className="w-3 h-3" /> Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {components.map(c => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
                <p className="text-[10px] text-slate-400">{c.code} · {c.type}</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Shield className="w-2.5 h-2.5" /> {c.trust_score}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => copyBrief(c)}>
                <Copy className="w-3 h-3" /> Copy Brief
              </Button>
              <Button size="sm" className="flex-1 text-xs gap-1 bg-slate-900 hover:bg-slate-800 text-white" onClick={() => downloadBrief(c)}>
                <Download className="w-3 h-3" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-rose-800 mb-1">How to use these briefs with external AIs</p>
            <ol className="text-xs text-rose-700 space-y-1 list-decimal ml-3">
              <li>Download or copy the test brief for a component</li>
              <li>Open ChatGPT, Claude, Gemini, or your AI of choice</li>
              <li>Paste the brief and a sample document from that category</li>
              <li>Score the AI's output against the rubric in the brief</li>
              <li>Compare against the platform trust benchmark — any score ≥85 is production-grade</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Doc upload test panel ───────────────────────────────────────────────────────
function DocTestPanel({ conversation, onSend }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [testPrompt, setTestPrompt] = useState("Analyse this document and extract all key data fields, risks, financial figures, and compliance indicators. Format as structured JSON and assign a confidence score per field.");

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setFileUrl(file_url);
    setUploading(false);
  };

  const runTest = async () => {
    if (!fileUrl || !conversation) return;
    await onSend(testPrompt, fileUrl);
    setFile(null);
    setFileUrl(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-slate-900 text-sm mb-1">Document Test Mode</h3>
        <p className="text-xs text-slate-500">Upload any document — contract, invoice, schedule, site report — and BOT-X will extract, analyse, and score it like a component would.</p>
      </div>

      <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${file ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
        <input type="file" className="hidden" accept=".pdf,.docx,.doc,.xlsx,.csv,.txt,.png,.jpg,.jpeg" onChange={handleFile} />
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        ) : file ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-violet-500" />
            <p className="text-sm font-semibold text-violet-700">{file.name}</p>
            <p className="text-xs text-slate-500">Ready to test</p>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-slate-400" />
            <p className="text-sm text-slate-500">Drop a document here or click to browse</p>
            <p className="text-[10px] text-slate-400">PDF, DOCX, XLSX, CSV, images supported</p>
          </>
        )}
      </label>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Test instruction (customise):</label>
        <textarea
          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 h-20 resize-none focus:outline-none focus:border-violet-400"
          value={testPrompt}
          onChange={e => setTestPrompt(e.target.value)}
        />
      </div>

      <Button
        onClick={runTest}
        disabled={!fileUrl || !conversation}
        className="w-full bg-violet-700 hover:bg-violet-800 text-white gap-2"
      >
        <FlaskConical className="w-4 h-4" />
        {!fileUrl ? "Upload a document first" : "Run Document Test"}
      </Button>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────────
export default function BuilderTestLab() {
  const [user, setUser] = useState(null);
  const [isBuilder, setIsBuilder] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState("chat");
  const [components, setComponents] = useState([]);
  const [initDone, setInitDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Component.filter({ status: "published" }),
    ]).then(([u, comps]) => {
      if (u) {
        setUser(u);
        setIsBuilder(u.role === "builder" || u.role === "admin");
      }
      setComponents(comps || []);
    }).catch(() => {});
  }, []);

  // Auto-create conversation on load
  useEffect(() => {
    if (!initDone && user) {
      base44.agents.createConversation({
        agent_name: "builder_test_bot",
        metadata: { name: `BOT-X Test Lab — ${new Date().toLocaleDateString()}` },
      }).then(conv => {
        setConversation(conv);
        setMessages(conv.messages || []);
        base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages || []);
        });
        setInitDone(true);
      }).catch(() => setInitDone(true));
    }
  }, [user, initDone]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (text, fileUrl = null) => {
    if (!text.trim() || !conversation || sending) return;
    setSending(true);
    if (fileUrl) {
      await base44.agents.addMessage(conversation, { role: "user", content: text, file_urls: [fileUrl] });
    } else {
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    }
    setSending(false);
    if (mode !== "chat") setMode("chat");
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  const newSession = async () => {
    setMessages([]);
    setConversation(null);
    setInitDone(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isBuilder) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SharedNav mode="builder" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">BOT-X Test Lab</h1>
          <p className="text-slate-500 text-sm mb-6">The Builder Test Lab is exclusively available to Builder-tier accounts. Upgrade to unlock full testing capabilities.</p>
          <a href="/pricing">
            <Button className="bg-violet-700 hover:bg-violet-800 text-white">View Builder Plans</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-700 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">BOT-X Test Lab</h1>
                <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Builder Exclusive</span>
              </div>
              <p className="text-xs text-slate-500">Multi-modal AI testing · Component analysis · External AI benchmarking · Trust scoring</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={newSession} className="gap-2 text-xs shrink-0">
            <RefreshCw className="w-3 h-3" /> New Session
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Chat panel */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Mode tabs */}
            <div className="flex gap-1 mb-3 bg-white border border-slate-200 rounded-xl p-1">
              {TEST_MODES.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${mode === m.id ? "bg-violet-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:block">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col flex-1 min-h-[520px]">
              {/* Chat mode */}
              {mode === "chat" && (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: "460px" }}>
                    {messages.length === 0 && !sending && (
                      <div className="text-center py-10">
                        <Bot className="w-10 h-10 text-violet-200 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-500 mb-1">BOT-X is ready</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">Ask anything about components, revenue share, trust scores, or run tests on documents and external AIs.</p>
                      </div>
                    )}
                    {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                    {sending && (
                      <div className="flex gap-2 justify-start">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
                          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
                    <input
                      className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-400"
                      placeholder="Ask BOT-X anything…"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || sending} className="bg-violet-700 hover:bg-violet-800 text-white px-4">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Prompt library mode */}
              {mode === "prompts" && (
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  <p className="text-xs text-slate-500 mb-3">Click any prompt to fire it directly into BOT-X. Use <strong>External Test Key</strong> prompts to generate briefs for benchmarking outside AIs.</p>
                  {TEST_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(p.prompt); setMode("chat"); }}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
                    >
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[p.category] || "bg-slate-100 text-slate-600"}`}>
                        {p.category}
                      </span>
                      <span className="text-sm text-slate-700 font-medium group-hover:text-violet-800 flex-1">{p.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Doc test mode */}
              {mode === "upload" && (
                <div className="flex-1 px-4 py-4 overflow-y-auto">
                  <DocTestPanel conversation={conversation} onSend={sendMessage} />
                </div>
              )}

              {/* Export mode */}
              {mode === "export" && (
                <div className="flex-1 px-4 py-4 overflow-y-auto">
                  <ExportTestKeys components={components} />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Stats + quick actions */}
          <div className="space-y-4">
            {/* Session info */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-violet-500" /> Session
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Agent</span>
                  <span className="font-semibold text-slate-800">BOT-X</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Model</span>
                  <span className="font-semibold text-slate-800">Automatic</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Messages</span>
                  <span className="font-semibold text-slate-800">{messages.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Components loaded</span>
                  <span className="font-semibold text-slate-800">{components.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-violet-700 capitalize">{user?.role}</span>
                </div>
              </CardContent>
            </Card>

            {/* Component quick-test cards */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Quick Component Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {components.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setInput(`Give me a full analysis of the "${c.name}" component (${c.code}). Include trust score breakdown, use cases, output schema, competitive positioning, and any risk flags.`);
                      setMode("chat");
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 group"
                  >
                    <div className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">{c.type}</div>
                    <span className="text-xs text-slate-700 font-medium flex-1 truncate group-hover:text-violet-700">{c.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">{c.trust_score}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Trust score rubric */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-violet-500" /> Trust Score Rubric
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { range: "90–100", label: "Production-grade", color: "text-emerald-600" },
                  { range: "80–89", label: "Acceptable, monitor", color: "text-blue-600" },
                  { range: "70–79", label: "Caution — flag for review", color: "text-amber-600" },
                  { range: "<70", label: "Do not deploy", color: "text-red-600" },
                ].map(r => (
                  <div key={r.range} className="flex justify-between text-xs">
                    <span className={`font-bold ${r.color}`}>{r.range}</span>
                    <span className="text-slate-500">{r.label}</span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setInput("Explain the full trust score framework in detail. How are the four dimensions calculated? What actions can a builder take to improve each score? What are the fastest trust score improvements?");
                    setMode("chat");
                  }}
                  className="w-full text-[10px] text-violet-600 hover:text-violet-800 font-semibold mt-1 text-left flex items-center gap-1"
                >
                  <BarChart2 className="w-3 h-3" /> Ask BOT-X to explain →
                </button>
              </CardContent>
            </Card>

            {/* Capability chips */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-500" /> What BOT-X Can Test
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Magna Dev components", "External AI agents", "Document extraction",
                    "Revenue share model", "API key setup", "Trust scoring",
                    "Governance compliance", "Component comparison", "Publish workflow",
                    "External AI benchmarking",
                  ].map(cap => (
                    <span key={cap} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{cap}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}