import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Key, Copy, CheckCircle2, Loader2, Sparkles, PlayCircle, Bot, ListChecks } from "lucide-react";

// Non-technical activation flow:
// 1) Generate an API key  2) Copy it  3) Run a LIVE test through the agent the
// key is injected into — the agent actually replies so the user sees it work.
export default function QuickStartActivation({ componentName }) {
  const [apiKey, setApiKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Real test: inject the key + question into the component's agent and show its reply.
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

  return (
    <div className="bg-white border border-violet-100 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h2 className="text-base font-bold text-slate-900">Activate &amp; test in 3 easy steps</h2>
      </div>

      {/* Step 1 — Generate */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800">Step 1 — Create your personal access key</p>
        <p className="text-xs text-slate-500">This is like a private password that connects you to {componentName}. Just click the button — we'll make one for you.</p>
        {!apiKey ? (
          <Button onClick={generate} disabled={generating} className="bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {generating ? "Creating your key…" : "Create my access key"}
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-3">
            <code className="text-xs text-emerald-300 font-mono flex-1 truncate">{apiKey}</code>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md shrink-0">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
        {error && !reply && <p className="text-xs text-red-500">{error}</p>}
        {apiKey && <p className="text-[11px] text-amber-600">Keep this safe — for your security, you won't be able to see it again after you leave this page.</p>}
      </div>

      {/* Step 2 — Save */}
      {apiKey && (
        <div className="space-y-1.5 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">Step 2 — Save your key somewhere safe</p>
          <p className="text-xs text-slate-500">Click <span className="font-semibold">Copy</span> above, then paste it into a notes app or password manager so you always have it handy.</p>
        </div>
      )}

      {/* Step 3 — Live test through the agent */}
      {apiKey && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">Step 3 — Test the component inside its agent</p>
          <p className="text-xs text-slate-500">
            Your key is injected straight into the {componentName} agent. Ask it anything below and it will reply — that's how you'll know it's working.
          </p>

          {/* Stepped-out directions */}
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-bold text-violet-800 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> How to test, step by step</p>
            <ol className="text-xs text-violet-700 space-y-1 list-decimal list-inside">
              <li>Type a simple question into the box below (or leave it blank for a sample).</li>
              <li>Press <span className="font-semibold">"Test in the agent"</span>.</li>
              <li>Wait a moment while your key is checked and the agent thinks.</li>
              <li>Read the agent's reply — if you see an answer, you're all set!</li>
            </ol>
          </div>

          <textarea
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            rows={2}
            placeholder={`e.g. "What can ${componentName} help me with?"`}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-violet-400 resize-none"
          />

          <Button onClick={runTest} disabled={testing} className="bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {testing ? "Testing in the agent…" : "Test in the agent"}
          </Button>

          {error && reply === "" && <p className="text-xs text-red-500">{error}</p>}

          {reply && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-bold text-emerald-800">Success — your key is working in the agent!</p>
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
        </div>
      )}
    </div>
  );
}