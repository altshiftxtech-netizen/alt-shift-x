import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Key, Plus, Copy, CheckCircle2, Trash2, Loader2, Eye, EyeOff, X, AlertTriangle, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CreateKeySheet({ onCreated, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateApiKey", {
        name: name.trim(),
        description: description.trim(),
      });
      onCreated({ name: name.trim(), key: res.data.key });
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">New API Key</h3>
          <button onClick={onClose} className="text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Name *</label>
            <Input
              placeholder="e.g. Production, Staging"
              value={name}
              onChange={e => setName(e.target.value)}
              className="text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Description (optional)</label>
            <Input
              placeholder="What is this key for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        <Button
          className="w-full bg-violet-700 hover:bg-violet-800 text-white"
          onClick={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</> : "Generate Key"}
        </Button>
        {/* iOS safe area */}
        <div className="h-4" />
      </div>
    </div>
  );
}

function NewKeyReveal({ apiKey, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Key Created: {apiKey.name}</h3>
            <p className="text-xs text-slate-400">Copy it now — it won't be shown again</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <code className="text-xs font-mono text-violet-700 break-all block mb-3">{apiKey.key}</code>
          <button
            onClick={copy}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 bg-white border border-slate-200 rounded-xl"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
        <Button className="w-full bg-slate-900 text-white" onClick={onClose}>I've saved my key — Close</Button>
        <div className="h-4" />
      </div>
    </div>
  );
}

function RevokeConfirm({ keyName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onCancel}>
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl"><ShieldOff className="w-5 h-5 text-red-600" /></div>
          <h3 className="text-base font-bold text-slate-900">Revoke Key?</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>"{keyName}"</strong> will be permanently revoked. Any app using this key will lose access immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>Revoke</Button>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}

export default function MobileApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [visibleIds, setVisibleIds] = useState({});

  const loadKeys = () => {
    base44.entities.ApiKey.filter({ status: "active" }, "-created_date", 20)
      .then(data => { setKeys(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadKeys(); }, []);

  const handleCreated = (k) => {
    setShowCreate(false);
    setNewKey(k);
    setTimeout(loadKeys, 600);
  };

  const handleRevoke = async () => {
    try {
      await base44.functions.invoke("revokeApiKey", { key_id: revokeTarget.id });
      setKeys(prev => prev.filter(k => k.id !== revokeTarget.id));
    } catch (e) {
      alert("Failed: " + e.message);
    }
    setRevokeTarget(null);
  };

  const toggleVisible = (id) => setVisibleIds(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">API Keys</h1>
          <p className="text-sm text-slate-400">{keys.length} active key{keys.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-xl"
        >
          <Plus className="w-3.5 h-3.5" /> New Key
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : keys.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-500">No API keys yet</p>
          <p className="text-xs text-slate-400 mb-4">Create a key to authenticate API requests</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-xs text-violet-700 font-semibold"
          >
            Create your first key →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map(k => {
            const visible = visibleIds[k.id];
            const lastUsed = k.last_used ? new Date(k.last_used).toLocaleDateString() : "Never";
            return (
              <div key={k.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-violet-500" />
                      <span className="text-sm font-bold text-slate-900">{k.name}</span>
                    </div>
                    {k.description && <p className="text-xs text-slate-400 mt-0.5 ml-5">{k.description}</p>}
                  </div>
                  <button
                    onClick={() => setRevokeTarget(k)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2">
                  <code className="text-[11px] font-mono text-slate-600 flex-1 truncate">
                    {visible
                      ? `asx_live_••••••••••`
                      : `asx_•••••••••••••`}
                  </code>
                  <button onClick={() => toggleVisible(k.id)} className="text-slate-400">
                    {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                  <span>Last used: <strong className="text-slate-600">{lastUsed}</strong></span>
                  <span>Created: <strong className="text-slate-600">{new Date(k.created_date).toLocaleDateString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateKeySheet onCreated={handleCreated} onClose={() => setShowCreate(false)} />}
      {newKey && <NewKeyReveal apiKey={newKey} onClose={() => setNewKey(null)} />}
      {revokeTarget && <RevokeConfirm keyName={revokeTarget.name} onConfirm={handleRevoke} onCancel={() => setRevokeTarget(null)} />}
    </div>
  );
}