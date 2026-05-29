import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Zap, CheckCircle2, Code } from "lucide-react";
import SharedNav from "@/components/SharedNav";

const INITIAL_KEYS = [
  { id: "key_1", name: "Production", key: "asx_live_k9xP2mQr4nLvWzYb8cJfHdAe3tRsUoNi", created: "Jan 15, 2026", lastUsed: "2 hours ago", calls: 12450 },
  { id: "key_2", name: "Development", key: "asx_test_7GhKjMnPqRsVwXyZaBcDeF2iLmOp4uTv", created: "Mar 3, 2026", lastUsed: "Yesterday", calls: 889 },
];

const CODE_EXAMPLE = `curl -X POST https://api.altshiftx.com/v1/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "component": "RP-CONSTRUCTION-1.0",
    "document_url": "https://example.com/contract.pdf"
  }'`;

function ApiKeyRow({ apiKey, onDelete }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const masked = apiKey.key.substring(0, 12) + "••••••••••••••••••••••••••••••••" + apiKey.key.slice(-4);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-sm font-bold text-slate-900">{apiKey.name}</span>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Created {apiKey.created}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md font-mono flex-1 truncate">
                {visible ? apiKey.key : masked}
              </code>
              <button onClick={() => setVisible(!visible)} className="text-slate-400 hover:text-slate-700">
                {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleCopy} className="text-slate-400 hover:text-slate-700">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
            <div className="text-right">
              <p className="font-semibold text-slate-700">{apiKey.calls.toLocaleString()}</p>
              <p className="text-slate-400">total calls</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-700">{apiKey.lastUsed}</p>
              <p className="text-slate-400">last used</p>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:border-red-300" onClick={() => onDelete(apiKey.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApiKeys() {
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      key: `asx_live_${Math.random().toString(36).substring(2, 42)}`,
      created: "May 29, 2026",
      lastUsed: "Never",
      calls: 0,
    };
    setKeys(prev => [...prev, newKey]);
    setNewKeyName("");
    setShowCreate(false);
  };

  const handleDelete = (id) => setKeys(prev => prev.filter(k => k.id !== id));

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
            <p className="text-sm text-slate-400">Authenticate requests to the Alt+Shift+X API</p>
          </div>
          <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm h-9 gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New Key
          </Button>
        </div>

        {showCreate && (
          <Card className="border-violet-200">
            <CardContent className="pt-5">
              <p className="text-sm font-semibold text-slate-900 mb-3">Create API Key</p>
              <div className="flex gap-2">
                <Input placeholder="Key name (e.g. Staging)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()} className="flex-1 text-sm" autoFocus />
                <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm" onClick={handleCreate}>Create</Button>
                <Button variant="outline" className="text-sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {keys.map(k => <ApiKeyRow key={k.id} apiKey={k} onDelete={handleDelete} />)}
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
                  <span className="text-xs text-slate-400">{e.desc}</span>
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