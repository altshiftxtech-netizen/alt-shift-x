import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Upload, Code, Eye, EyeOff, ShieldCheck, AlertTriangle, CheckCircle2, Bot } from "lucide-react";

const SENSITIVE_KEYWORDS = [
  "military", "weapon", "nuclear", "mass shoot", "explosive", "bomb", "harm", "kill",
  "malware", "ransomware", "exploit", "government bypass", "law enforcement", "surveillance mass"
];

function scanForSensitiveContent(code) {
  const lower = code.toLowerCase();
  const found = SENSITIVE_KEYWORDS.filter(kw => lower.includes(kw));
  return found;
}

export default function ComponentUploadTab() {
  const [codeInput, setCodeInput] = useState("");
  const [showCode, setShowCode] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", type: "X1", category: "Risk & Compliance", description: "", price: 49 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [sensitiveFlags, setSensitiveFlags] = useState([]);

  const handleCodeChange = (val) => {
    setCodeInput(val);
    const flags = scanForSensitiveContent(val);
    setSensitiveFlags(flags);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleCodeChange(ev.target.result);
      setUploadingFile(false);
    };
    reader.readAsText(file);
  };

  const analyzeCode = async () => {
    if (!codeInput.trim()) return;
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI component analyst for the Alt+Shift+X marketplace. Analyze the following component code and provide:
1. Suggested component type (X1=Risk/Compliance, X2=Project Management, X4=Site Reporting)
2. Suggested name (concise, professional)
3. Description (2 sentences max)
4. Key features list (3-5 items)
5. Output schema fields
6. Safety assessment: any red flags or concerns?
7. Suggested price per month ($9–$299)

Return JSON with keys: type, name, description, features, schema, safety_ok, safety_notes, suggested_price

Code:
${codeInput.slice(0, 3000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            type: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            schema: { type: "array", items: { type: "string" } },
            safety_ok: { type: "boolean" },
            safety_notes: { type: "string" },
            suggested_price: { type: "number" }
          }
        }
      });
      setAnalysis(result);
      setForm(prev => ({
        ...prev,
        type: result.type || prev.type,
        name: result.name || prev.name,
        description: result.description || prev.description,
        price: result.suggested_price || prev.price
      }));
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const saveComponent = async () => {
    if (!form.name || !form.description) return;
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.Component.create({
      ...form,
      builder_id: user?.id || "admin",
      status: "pending_review",
      features: analysis?.features || [],
      schema: analysis?.schema || [],
      trust_score: 0,
      installs_count: 0
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Component Upload & Analysis</h2>
        <p className="text-sm text-slate-500">Upload or paste component code. BOB AI will analyze structure, safety, and generate marketplace metadata automatically.</p>
      </div>

      {/* Code Input */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Code className="w-4 h-4 text-violet-600" /> Component Code</p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-violet-700 font-medium cursor-pointer hover:text-violet-800">
                <Upload className="w-3.5 h-3.5" />
                {uploadingFile ? "Loading..." : "Upload File"}
                <input type="file" accept=".js,.ts,.py,.json,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
              <button onClick={() => setShowCode(!showCode)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showCode ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {showCode && (
            <textarea
              value={codeInput}
              onChange={e => handleCodeChange(e.target.value)}
              className="w-full h-52 font-mono text-xs bg-slate-950 text-green-400 p-3 rounded-lg border border-slate-700 outline-none focus:border-violet-500 resize-none"
              placeholder="// Paste component code here, or upload a file above..."
            />
          )}

          {sensitiveFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Sensitive Content Detected</p>
                <p className="text-xs text-red-600 mt-0.5">Keywords found: {sensitiveFlags.join(", ")}. This component will be flagged for security review per the Sensitive Intelligence Policy.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={analyzeCode} disabled={!codeInput.trim() || analyzing} size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
              <Bot className="w-3.5 h-3.5" />
              {analyzing ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysis && (
        <Card className="border-violet-200">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-600" />
              <p className="text-sm font-bold text-slate-900">AI Analysis Results</p>
              {analysis.safety_ok ? (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold"><CheckCircle2 className="w-3 h-3" />Safe</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold"><AlertTriangle className="w-3 h-3" />Review Required</span>
              )}
            </div>

            {!analysis.safety_ok && analysis.safety_notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">{analysis.safety_notes}</div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-xs text-slate-500">Component Name</label>
                <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5">
                  <option value="X1">X1</option>
                  <option value="X2">X2</option>
                  <option value="X4">X4</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5 h-16 resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5">
                  {["Risk & Compliance","Project Management","Site Reporting","Cost Estimation","Schedule Analysis"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Price ($/mo)</label>
                <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: Number(e.target.value)}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-0.5" />
              </div>
            </div>

            {analysis.features?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Detected Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.features.map((f, i) => <span key={i} className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{f}</span>)}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={saveComponent} disabled={saving || !analysis.safety_ok} size="sm" className="gap-1.5">
                {saved ? <><CheckCircle2 className="w-3.5 h-3.5" />Saved!</> : saving ? "Saving..." : <><ShieldCheck className="w-3.5 h-3.5" />Submit for Review</>}
              </Button>
              {!analysis.safety_ok && <p className="text-xs text-red-600 self-center">Cannot submit: safety review required</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public-facing trust notice */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-violet-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Marketplace Transparency Statement</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every component on the Alt+Shift+X marketplace is AI-analyzed and human-reviewed before publication. Users see a curated description, feature list, trust score, and safety rating — never proprietary code or training data. We protect IP while giving buyers enough context to make informed decisions with confidence. Our Sensitive Intelligence Policy ensures every component meets our safety standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}