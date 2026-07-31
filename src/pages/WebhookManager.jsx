import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import CosmicBackground from "@/components/CosmicBackground";
import {
  Webhook, Plus, Trash2, PauseCircle, PlayCircle, Copy,
  CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Eye, EyeOff
} from "lucide-react";
import WebhookDebugger from "@/components/webhooks/WebhookDebugger";

const ALL_EVENTS = [
  { key: "component.published", label: "Component Published", group: "Components" },
  { key: "component.updated", label: "Component Updated", group: "Components" },
  { key: "component.deprecated", label: "Component Deprecated", group: "Components" },
  { key: "component.version.released", label: "Version Released", group: "Components" },
  { key: "subscription.activated", label: "Subscription Activated", group: "Billing" },
  { key: "subscription.upgraded", label: "Subscription Upgraded / Overage", group: "Billing" },
  { key: "subscription.cancelled", label: "Subscription Cancelled", group: "Billing" },
  { key: "invoice.paid", label: "Invoice Paid", group: "Billing" },
  { key: "invoice.failed", label: "Invoice Failed", group: "Billing" },
  { key: "extraction.completed", label: "Extraction Completed", group: "API" },
  { key: "trust_score.changed", label: "Trust Score Changed", group: "Governance" },
  { key: "budget.alert.triggered", label: "Budget Alert Triggered", group: "Finance" },
];

const STATUS_ICON = {
  active: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  paused: <PauseCircle className="w-4 h-4 text-amber-500" />,
  failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  deleted: <Trash2 className="w-4 h-4 text-slate-400" />,
};

const NEW_SUB = { endpoint_url: "", description: "", events: [], retry_on_failure: true };

function generateSecret() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return "whsec_" + Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function WebhookManager() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSub, setNewSub] = useState({ ...NEW_SUB, secret: generateSecret() });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showSecret, setShowSecret] = useState({});
  const [copied, setCopied] = useState(null);

  useEffect(() => { loadSubs(); }, []);

  const loadSubs = async () => {
    const user = await base44.auth.me();
    if (!user) return;
    const data = await base44.entities.WebhookSubscription.filter({ subscriber_id: user.id }, "-created_date", 50);
    setSubs(data);
    setLoading(false);
  };

  const toggleEvent = (key) => {
    setNewSub(s => ({
      ...s,
      events: s.events.includes(key) ? s.events.filter(e => e !== key) : [...s.events, key],
    }));
  };

  const handleCreate = async () => {
    if (!newSub.endpoint_url || !newSub.events.length) return;
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.WebhookSubscription.create({
      ...newSub,
      subscriber_id: user.id,
      subscriber_email: user.email,
      status: "active",
      failure_count: 0,
      total_delivered: 0,
    });
    await loadSubs();
    setNewSub({ ...NEW_SUB, secret: generateSecret() });
    setShowNew(false);
    setSaving(false);
  };

  const toggleStatus = async (sub) => {
    const next = sub.status === "active" ? "paused" : "active";
    await base44.entities.WebhookSubscription.update(sub.id, { status: next });
    setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, status: next } : s));
  };

  const deleteSub = async (id) => {
    if (!confirm("Delete this webhook subscription?")) return;
    await base44.entities.WebhookSubscription.delete(id);
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const grouped = ALL_EVENTS.reduce((acc, e) => {
    if (!acc[e.group]) acc[e.group] = [];
    acc[e.group].push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <CosmicBackground />
      <SharedNav mode="user" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Webhook className="w-6 h-6 text-violet-600" /> Webhook Subscriptions
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Receive real-time events when things happen on the platform.</p>
          </div>
          <Button onClick={() => setShowNew(!showNew)} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" /> Add Endpoint
          </Button>
        </div>

        {/* New endpoint form */}
        {showNew && (
          <Card className="border-violet-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800">New Webhook Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">HTTPS Endpoint URL *</label>
                <input value={newSub.endpoint_url} onChange={e => setNewSub(s => ({ ...s, endpoint_url: e.target.value }))}
                  placeholder="https://your-server.com/webhooks/altshiftx"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                <input value={newSub.description} onChange={e => setNewSub(s => ({ ...s, description: e.target.value }))}
                  placeholder="e.g. Production server – billing events"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Signing Secret</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={newSub.secret}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono bg-slate-50" />
                  <Button variant="outline" size="sm" onClick={() => copy(newSub.secret, "new_secret")} className="gap-1.5 text-xs">
                    {copied === "new_secret" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />} Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setNewSub(s => ({ ...s, secret: generateSecret() }))} className="text-xs">Regenerate</Button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Save this — it's used to verify webhook payloads via HMAC-SHA256.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">Events to Subscribe *</label>
                {Object.entries(grouped).map(([group, events]) => (
                  <div key={group} className="mb-3">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">{group}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {events.map(ev => (
                        <label key={ev.key} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" checked={newSub.events.includes(ev.key)}
                            onChange={() => toggleEvent(ev.key)}
                            className="rounded border-slate-300 text-violet-600 focus:ring-violet-400" />
                          <span className="text-xs text-slate-600 group-hover:text-slate-900">{ev.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving || !newSub.endpoint_url || !newSub.events.length}
                  className="bg-violet-600 hover:bg-violet-700 gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
                  Create Webhook
                </Button>
                <Button onClick={() => setShowNew(false)} variant="ghost" className="text-slate-500 text-sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Webhook className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No webhook endpoints yet.</p>
            <p className="text-xs mt-1">Add one above to start receiving platform events.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map(sub => (
              <Card key={sub.id} className={sub.status === "failed" ? "border-red-200" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">{STATUS_ICON[sub.status] || STATUS_ICON.active}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{sub.endpoint_url}</p>
                        {sub.description && <p className="text-xs text-slate-400">{sub.description}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(sub.events || []).map(ev => (
                            <span key={ev} className="text-[9px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded">{ev}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {sub.total_delivered || 0} delivered ·
                          {sub.failure_count > 0 && <span className="text-red-500 ml-1">{sub.failure_count} failures</span>}
                          {sub.last_delivered_at && ` · Last: ${new Date(sub.last_delivered_at).toLocaleString()}`}
                        </p>
                        {sub.status === "failed" && sub.last_failure_reason && (
                          <p className="text-[10px] text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                            {sub.last_failure_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)} className="h-8 w-8">
                        {expandedId === sub.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(sub)} className="h-8 w-8">
                        {sub.status === "active" ? <PauseCircle className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSub(sub.id)} className="h-8 w-8 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedId === sub.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Signing Secret</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono bg-slate-100 px-3 py-2 rounded-lg">
                          {showSecret[sub.id] ? (sub.secret || "—") : "whsec_••••••••••••••••••••"}
                        </code>
                        <Button variant="ghost" size="icon" onClick={() => setShowSecret(s => ({ ...s, [sub.id]: !s[sub.id] }))} className="h-8 w-8">
                          {showSecret[sub.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        {sub.secret && (
                          <Button variant="ghost" size="icon" onClick={() => copy(sub.secret, sub.id)} className="h-8 w-8">
                            {copied === sub.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Use this secret to verify the <code className="font-mono">X-AltShiftX-Signature</code> header on incoming requests.</p>
                      <WebhookDebugger subId={sub.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}