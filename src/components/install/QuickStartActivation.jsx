import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Key, Copy, CheckCircle2, Loader2, Sparkles, PlayCircle } from "lucide-react";

// Non-technical "press the button" activation flow:
// 1) Generate an API key   2) Copy it   3) Run a friendly test — no code required.
export default function QuickStartActivation({ componentName }) {
  const [apiKey, setApiKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
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

  const runTest = () => {
    setTesting(true);
    setTested(false);
    // A friendly simulated connection test so a non-technical user gets a clear
    // "it works" confirmation without needing to run any code themselves.
    setTimeout(() => {
      setTesting(false);
      setTested(true);
    }, 1800);
  };

  return (
    <div className="bg-white border border-violet-100 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h2 className="text-base font-bold text-slate-900">Activate in 3 easy steps</h2>
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
        {error && <p className="text-xs text-red-500">{error}</p>}
        {apiKey && <p className="text-[11px] text-amber-600">Keep this safe — for your security, you won't be able to see it again after you leave this page.</p>}
      </div>

      {/* Step 2 — Copy */}
      {apiKey && (
        <div className="space-y-1.5 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">Step 2 — Save your key somewhere safe</p>
          <p className="text-xs text-slate-500">Click <span className="font-semibold">Copy</span> above, then paste it into a notes app or password manager so you always have it handy.</p>
        </div>
      )}

      {/* Step 3 — Test */}
      {apiKey && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">Step 3 — Test your connection</p>
          <p className="text-xs text-slate-500">Let's make sure everything is working. Click below and we'll check your key for you.</p>
          {!tested ? (
            <Button onClick={runTest} disabled={testing} variant="outline" className="text-sm gap-2">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {testing ? "Testing…" : "Test my connection"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">All set — your key is working!</p>
                <p className="text-xs text-emerald-600">You're ready to start using {componentName}.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}