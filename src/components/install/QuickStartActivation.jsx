import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Key, Copy, CheckCircle2, Loader2, PlayCircle, Bot, Lock, Baby, Smartphone, AppWindow, ArrowRight } from "lucide-react";

// A guided, plain-English walkthrough a parent can follow:
//   1. Create the key   2. Save it   3. Paste it into their device's AI
//   4. Test it (locked until the key exists)
// The key is a universal access key — any AI assistant (toy, phone, app) accepts it.
export default function QuickStartActivation({ componentName }) {
  const [apiKey, setApiKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [device, setDevice] = useState("phone");
  const [testQuery, setTestQuery] = useState("");
  const [testing, setTesting] = useState(false);
  const [reply, setReply] = useState("");
  const [agentName, setAgentName] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateApiKey", {
        name: `${componentName} Access Key`,
        description: `Created from the ${componentName} welcome guide`,
      });
      const key = res?.data?.key;
      if (key) setApiKey(key);
      else setError(res?.data?.error || "Could not create your key. Please try again.");
    } catch (e) {
      setError(e?.response?.data?.error || "Could not create your key. Please try again.");
    }
    setGenerating(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const runTest = async () => {
    setTesting(true);
    setError("");
    setReply("");
    try {
      const res = await base44.functions.invoke("testComponentKey", {
        apiKey,
        componentName,
        testQuery: testQuery.trim(),
      });
      const d = res?.data || {};
      if (d.ok) {
        setReply(d.reply || "Connection confirmed.");
        setAgentName(d.agent_name || componentName);
      } else {
        setError(d.error || "The test could not be completed. Please try again.");
      }
    } catch (e) {
      setError(e?.response?.data?.error || "The test could not be completed. Please try again.");
    }
    setTesting(false);
  };

  const devices = [
    { id: "toy", label: "Smart toy", icon: Baby, where: "In the toy's companion app, open Settings → Add AI Assistant (or AI Key). Tap the box, paste your key, and press Save." },
    { id: "phone", label: "Phone assistant", icon: Smartphone, where: "Open your assistant app's Settings → Connect an AI / API Key. Tap the field, paste your key, and tap Connect." },
    { id: "app", label: "An app", icon: AppWindow, where: "In the app, go to Settings → Integrations → Paste API Key. Tap the box, paste your key, and press Save." },
  ];
  const activeDevice = devices.find((d) => d.id === device);

  return (
    <div className="bg-white border border-violet-100 rounded-2xl p-6 space-y-6 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-slate-900">Let's get you set up</h2>
        <p className="text-xs text-slate-500 mt-0.5">Follow each step in order. We'll tell you exactly what to do — take your time.</p>
      </div>

      {/* STEP 1 — Create the key */}
      <Step number="1" title="Create your access key" done={!!apiKey}>
        <p className="text-xs text-slate-500 mb-2">
          Think of this as a private password that connects your device to {componentName}. Tap the button and we'll make one for you.
        </p>
        {!apiKey ? (
          <Button onClick={generate} disabled={generating} className="bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {generating ? "Creating your key…" : "Create my access key"}
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-700 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Your key is ready! See it in Step 2 below.
          </div>
        )}
        {error && !apiKey && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </Step>

      {/* STEP 2 — Copy & save */}
      <Step number="2" title="Copy and save your key" locked={!apiKey}>
        {apiKey && (
          <>
            <p className="text-xs text-slate-500 mb-2">Here is your key. Tap <span className="font-semibold">Copy</span>, then paste it somewhere safe (like your Notes app) so you always have it.</p>
            <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-3">
              <code className="text-xs text-emerald-300 font-mono flex-1 truncate">{apiKey}</code>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md shrink-0">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-amber-600 mt-1.5">Important: for your security you won't be able to see this key again after you leave the page, so copy it now.</p>
          </>
        )}
      </Step>

      {/* STEP 3 — Where to put the key */}
      <Step number="3" title="Paste the key into your device's AI" locked={!apiKey}>
        {apiKey && (
          <>
            <p className="text-xs text-slate-500 mb-2.5">Pick what you're setting up — we'll show you exactly where the key goes. This same key works with any AI assistant.</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {devices.map((d) => {
                const Icon = d.icon;
                return (
                  <button key={d.id} onClick={() => setDevice(d.id)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-colors ${device === d.id ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    <Icon className="w-5 h-5" />
                    {d.label}
                  </button>
                );
              })}
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
              <p className="text-xs text-violet-800 leading-relaxed">{activeDevice?.where}</p>
            </div>
          </>
        )}
      </Step>

      {/* STEP 4 — Test (locked until a key exists) */}
      <Step number="4" title="Test that it's working" locked={!apiKey}>
        {!apiKey ? (
          <p className="text-xs text-slate-400 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Create your key in Step 1 first — then you can test it here.</p>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2">Ask the {componentName} assistant a question below. If it answers, everything is connected correctly.</p>
            <textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              rows={2}
              placeholder={`e.g. "What can ${componentName} help me with?"`}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-violet-400 resize-none"
            />
            <Button onClick={runTest} disabled={testing} className="bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2 mt-2">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {testing ? "Testing…" : "Test my key"}
            </Button>
            {error && reply === "" && <p className="text-xs text-red-500 mt-2">{error}</p>}
            {reply && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold text-emerald-800">All done — your key is working!</p>
                </div>
                <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-emerald-100">
                  <Bot className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400">{agentName} replied:</p>
                    <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{reply}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Step>
    </div>
  );
}

// A single numbered step row with a completion / lock state.
function Step({ number, title, children, done, locked }) {
  return (
    <div className={`flex gap-3 ${locked ? "opacity-60" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "bg-emerald-500 text-white" : locked ? "bg-slate-200 text-slate-400" : "bg-violet-600 text-white"}`}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 mb-1">{title}</p>
        {children}
      </div>
    </div>
  );
}