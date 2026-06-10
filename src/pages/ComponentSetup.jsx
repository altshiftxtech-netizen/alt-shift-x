import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2, Copy, Terminal, Zap, Package, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Build a setup guide for ANY component using its real name/code so every install
// shows its own integration guide (not a single hardcoded Ironclad fallback).
function buildSetup(component) {
  const name = component?.name || component?.component_name || "Your Component";
  const code = component?.code || component?.component_code || "COMPONENT-1.0";
  return {
    name,
    code,
    steps: [
      {
        title: "Install via API",
        desc: "Make your first extraction call using your API key.",
        snippet: `curl -X POST https://api.altshiftx.com/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "component": "${code}",
    "document_url": "https://your-storage.com/document.pdf",
    "options": { "citation_mode": true }
  }'`,
      },
      {
        title: "Handle the Response",
        desc: "The API returns a structured JSON object with all extracted fields.",
        snippet: `{
  "job_id": "job_abc123",
  "status": "completed",
  "component": "${code}",
  "output": { ... },
  "confidence": 0.981,
  "latency_ms": 910
}`,
      },
      {
        title: "Set Up a Webhook (Optional)",
        desc: "Register a webhook to receive results asynchronously for large documents.",
        snippet: `curl -X POST https://api.altshiftx.com/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "url": "https://your-app.com/webhooks/asx",
    "events": ["job.completed", "job.failed"]
  }'`,
      },
      {
        title: "Test in Sandbox",
        desc: "Validate your integration against sample documents before going live.",
        sandbox: true,
      },
    ],
  };
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-100 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre">{code}</pre>
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function ComponentSetup() {
  const { id } = useParams();
  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Resolve the real component for this install — by Component id, then by the
  // user's InstalledComponent record — so the guide matches what was clicked.
  useEffect(() => {
    (async () => {
      let component = null;
      try {
        component = await base44.entities.Component.get(id);
      } catch { /* not a Component id */ }
      if (!component) {
        try {
          const me = await base44.auth.me();
          const installs = await base44.entities.InstalledComponent.filter({ user_id: me.id, component_id: id });
          if (installs?.[0]) component = installs[0];
        } catch { /* ignore */ }
      }
      setSetup(buildSetup(component));
      setLoading(false);
    })();
  }, [id]);

  const toggleStep = (i) => setCompletedSteps(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  if (loading || !setup) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Link to="/dashboard/installed" className="text-sm text-slate-400 hover:text-slate-700">Installed</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-700 font-medium">Setup: {setup.name}</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-violet-100"><Package className="w-5 h-5 text-violet-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{setup.name}</h1>
            <p className="text-sm font-mono text-slate-400">{setup.code} · Integration Guide</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {setup.steps.map((_, i) => (
            <React.Fragment key={i}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${completedSteps.has(i) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                {completedSteps.has(i) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < setup.steps.length - 1 && <div className={`flex-1 h-px ${completedSteps.has(i) ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {setup.steps.map((step, i) => (
            <Card key={i} className={completedSteps.has(i) ? "border-emerald-200" : ""}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 ${completedSteps.has(i) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {completedSteps.has(i) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{step.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleStep(i)}
                    className={`text-xs font-semibold px-2 py-1 rounded-md shrink-0 ml-3 ${completedSteps.has(i) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {completedSteps.has(i) ? "Done ✓" : "Mark done"}
                  </button>
                </div>
                {step.snippet && <CodeBlock code={step.snippet} />}
                {step.sandbox && (
                  <Link to="/builder/sandbox">
                    <Button variant="outline" className="text-sm gap-2 mt-2"><Terminal className="w-3.5 h-3.5" /> Open Sandbox</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {completedSteps.size === setup.steps.length && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="py-5 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Integration complete!</p>
                <p className="text-xs text-emerald-600">You're ready to process documents with {setup.name}.</p>
              </div>
              <Link to="/dashboard/usage" className="ml-auto">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5"><Zap className="w-3.5 h-3.5" /> View Usage</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}