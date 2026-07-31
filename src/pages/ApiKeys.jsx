import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Key, Copy, Eye, EyeOff, Plus, Trash2, Zap,
  CheckCircle2, Code, X, AlertTriangle, Clock, ShieldOff, Loader2, Download
} from "lucide-react";
import SharedNav from "@/components/SharedNav";
import CosmicBackground from "@/components/CosmicBackground";
import { base44 } from "@/api/base44Client";

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const CODE_EXAMPLE = `curl -X POST https://api.altshiftx.com/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "component": "RP-CONSTRUCTION-1.0",
    "document_url": "https://example.com/contract.pdf"
  }'`;

// ── Revoke Confirmation Modal ─────────────────────────────────────────────────
function RevokeModal({ keyName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-xl">
            <ShieldOff className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Revoke API Key</h2>
          <button onClick={onCancel} className="ml-auto text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-bold">"{keyName}"</span> will be permanently revoked. Any applications using this key will immediately lose access. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-sm" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm" onClick={onConfirm}>
            Revoke Key
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── New Key Reveal Modal ──────────────────────────────────────────────────────
function NewKeyModal({ apiKey, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">API Key Created</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 ml-11">
          Copy your key now — it won't be shown again after you close this dialog.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
          <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Your new key — {apiKey.name}</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-violet-700 break-all flex-1">{apiKey.key}</code>
            <button onClick={handleCopy} className="shrink-0 p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
              {copied
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
        <Button className="w-full bg-slate-900 hover:bg-slate-700 text-white text-sm" onClick={onClose}>
          I've saved my key — Close
        </Button>
      </div>
    </div>
  );
}

const AGENT_OPTIONS = [
  { value: "", label: "No agent (API only)" },
  { value: "sales_consultant", label: "Sales Consultant" },
  { value: "customer_support", label: "Customer Support" },
  { value: "bob_builder", label: "BOB Builder Advisor" },
  { value: "builder_test_bot", label: "BOT-X Test Agent (Builders only)" },
];

// ── Create Key Form ───────────────────────────────────────────────────────────
function CreateKeyForm({ onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateApiKey", {
        name: name.trim(),
        description: description.trim(),
        agent_name: agentName || null,
      });
      onCreated({
        name: name.trim(),
        key: res.data.key,
        description: description.trim(),
        agent_name: agentName || null,
      });
      setName("");
      setDescription("");
      setAgentName("");
    } catch (error) {
      alert("Failed to generate key: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-violet-200 bg-violet-50/30">
      <CardContent className="pt-5 space-y-3">
        <p className="text-sm font-bold text-slate-900">New API Key</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[10px] text-amber-800">
          <strong>1 subscription, unlimited keys:</strong> All your keys count toward one monthly plan. Each key can be paired with at most 1 agent — different keys can use different agents.
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Key name <span className="text-red-400">*</span></label>
          <Input
            placeholder="e.g. Production, Staging, CI Pipeline"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            className="text-sm bg-white"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Description <span className="text-slate-300">(optional)</span></label>
          <Input
            placeholder="What will this key be used for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Pair with Agent <span className="text-slate-300">(optional — 1 agent per key)</span></label>
          <select
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-violet-400"
          >
            {AGENT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            className="bg-violet-700 hover:bg-violet-800 text-white text-sm"
            onClick={handleCreate}
            disabled={!name.trim() || loading}
          >
            {loading ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Generating...</> : "Generate Key"}
          </Button>
          <Button variant="outline" className="text-sm" onClick={onCancel} disabled={loading}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── API Key Row ───────────────────────────────────────────────────────────────
function ApiKeyRow({ apiKey, onRevoke }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const res = await base44.functions.invoke("downloadApiKey", { 
        key_id: apiKey.id,
        format 
      });
      
      // Determine filename from response
      const ext = format === 'env' ? 'env' : format === 'csv' ? 'csv' : 'json';
      const filename = `api-key-${apiKey.name}.${ext}`;
      
      // Create blob and trigger download
      const blob = new Blob([res.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Failed to download key: " + error.message);
    } finally {
      setDownloading(false);
    }
  };

  const keyStr = apiKey.key || "";
  const masked = keyStr.length > 8
    ? keyStr.substring(0, 4) + "•••••••••••••••••••••••••" + keyStr.slice(-4)
    : "••••••••••••••••••••••••••••••••";
  const lastUsed = apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : "Never";
  const neverUsed = lastUsed === "Never";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Key info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="text-sm font-bold text-slate-900 truncate">{apiKey.name}</span>
              {apiKey.agent_name && (
                <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  🤖 {apiKey.agent_name}
                </span>
              )}
              {apiKey.description && (
                <span className="text-[10px] text-slate-400 truncate hidden sm:block">{apiKey.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-mono flex-1 truncate">
                {visible ? apiKey.key : masked}
              </code>
              <button onClick={() => setVisible(!visible)} className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors" title={visible ? "Hide key" : "Reveal key"}>
                {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleCopy} className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors" title="Copy key">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Meta + actions */}
           <div className="flex items-center gap-3 shrink-0 flex-wrap">
             <div className="text-right">
               <div className="flex items-center gap-1 justify-end">
                 <Clock className={`w-3 h-3 ${neverUsed ? "text-slate-300" : "text-slate-400"}`} />
                 <p className={`text-xs font-semibold ${neverUsed ? "text-slate-400 italic" : "text-slate-700"}`}>
                   {lastUsed}
                 </p>
               </div>
               <p className="text-[10px] text-slate-400">last used</p>
             </div>
             <div className="text-right hidden sm:block">
               <p className="text-xs text-slate-500">{new Date(apiKey.created_date).toLocaleDateString()}</p>
               <p className="text-[10px] text-slate-400">created</p>
             </div>
             {apiKey.is_active && (
               <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                 Active
               </span>
             )}
             <div className="relative group">
               <Button
                 variant="outline"
                 size="icon"
                 className="h-8 w-8 text-slate-400 hover:text-slate-700 transition-colors"
                 disabled={downloading}
                 title="Download key"
               >
                 {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
               </Button>
               <div className="absolute right-0 bottom-full mb-2 bg-slate-900 text-white text-xs rounded-lg py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
                 <button className="block w-full text-left px-3 py-1 hover:bg-slate-800" onClick={() => handleDownload('json')}>JSON</button>
                 <button className="block w-full text-left px-3 py-1 hover:bg-slate-800" onClick={() => handleDownload('env')}>ENV</button>
                 <button className="block w-full text-left px-3 py-1 hover:bg-slate-800" onClick={() => handleDownload('csv')}>CSV</button>
               </div>
             </div>
             <Button
               variant="outline"
               size="icon"
               className="h-8 w-8 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
               onClick={() => onRevoke(apiKey)}
               title="Revoke key"
             >
               <Trash2 className="w-3.5 h-3.5" />
             </Button>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [newlyCreated, setNewlyCreated] = useState(null);

  useEffect(() => {
    base44.entities.ApiKey.filter({ status: "active" }, "-created_date", 50)
      .then(data => { setKeys(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreated = (newKey) => {
    setShowCreate(false);
    setNewlyCreated(newKey);
    // Reload keys after a short delay to let API persist
    setTimeout(() => {
      base44.entities.ApiKey.filter({ status: "active" }, "-created_date", 50)
        .then(data => setKeys(data || []))
        .catch(() => {});
    }, 500);
  };

  const handleConfirmRevoke = async () => {
    try {
      await base44.functions.invoke("revokeApiKey", { key_id: revokeTarget.id });
      setKeys(prev => prev.filter(k => k.id !== revokeTarget.id));
    } catch (error) {
      alert("Failed to revoke key: " + error.message);
    }
    setRevokeTarget(null);
  };

  return (
    <div className="min-h-screen">
      <CosmicBackground />
      <SharedNav mode="user" />

      {revokeTarget && (
        <RevokeModal
          keyName={revokeTarget.name}
          onConfirm={handleConfirmRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {newlyCreated && (
        <NewKeyModal
          apiKey={newlyCreated}
          onClose={() => setNewlyCreated(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
            <p className="text-sm text-slate-400">Authenticate requests to the Alt+Shift+X API · {keys.length} key{keys.length !== 1 ? "s" : ""} active</p>
          </div>
          {!showCreate && (
            <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm h-9 gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> New Key
            </Button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <CreateKeyForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
        )}

        {/* Keys list */}
         <div className="space-y-3">
           {loading ? (
             <Card>
               <CardContent className="py-12 flex justify-center">
                 <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
               </CardContent>
             </Card>
           ) : keys.length === 0 ? (
             <Card>
               <CardContent className="py-12 text-center">
                 <Key className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                 <p className="text-sm font-semibold text-slate-500">No API keys yet</p>
                 <p className="text-xs text-slate-400 mb-4">Create your first key to start making API requests.</p>
                 <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm gap-2" onClick={() => setShowCreate(true)}>
                   <Plus className="w-4 h-4" /> Create First Key
                 </Button>
               </CardContent>
             </Card>
           ) : (
             keys.map(k => (
               <ApiKeyRow key={k.id} apiKey={k} onRevoke={setRevokeTarget} />
             ))
           )}
         </div>

        {/* Quick start */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Quick Start</h3>
            </div>
            <pre className="bg-slate-900 text-slate-100 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre">{CODE_EXAMPLE}</pre>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardContent className="pt-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Core Endpoints</h3>
            <div className="space-y-3">
              {[
                { method: "POST", path: "/v1/extract", desc: "Run an extraction component on a document" },
                { method: "GET", path: "/v1/jobs/:id", desc: "Retrieve extraction job status and results" },
                { method: "GET", path: "/v1/components", desc: "List all your installed components" },
                { method: "POST", path: "/v1/webhooks", desc: "Register a webhook for job completion events" },
              ].map(e => (
                <div key={e.path} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${e.method === "POST" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{e.method}</span>
                  <code className="text-xs font-mono text-slate-600 flex-1">{e.path}</code>
                  <span className="text-xs text-slate-400 hidden sm:block">{e.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Webhooks</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Receive real-time notifications when extraction jobs complete.</p>
            <div className="flex gap-2">
              <Input placeholder="https://your-app.com/webhooks/asx" className="flex-1 text-sm" />
              <Button variant="outline" className="text-sm">Add Endpoint</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}