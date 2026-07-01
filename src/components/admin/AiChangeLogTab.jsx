import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Plus, Loader2, FileText, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { value: "component", label: "Component" },
  { value: "doctrine", label: "Doctrine" },
  { value: "policy", label: "Policy" },
  { value: "agent_behaviour", label: "Agent Behaviour" },
  { value: "knowledge_block", label: "Knowledge Block" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLORS = {
  component: "bg-blue-100 text-blue-700",
  doctrine: "bg-violet-100 text-violet-700",
  policy: "bg-amber-100 text-amber-700",
  agent_behaviour: "bg-emerald-100 text-emerald-700",
  knowledge_block: "bg-cyan-100 text-cyan-700",
  other: "bg-slate-100 text-slate-600",
};

const EMPTY = { category: "component", agent_or_component: "", summary: "", details: "" };

export default function AiChangeLogTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AiProgrammingChange.list("-created_date", 1000);
      setEntries(data);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addEntry = async () => {
    if (!form.summary.trim()) return;
    setSaving(true);
    try {
      let recordedBy = "";
      try { const u = await base44.auth.me(); recordedBy = u.full_name || u.email || ""; } catch { /* noop */ }
      await base44.entities.AiProgrammingChange.create({ ...form, recorded_by: recordedBy });
      setForm(EMPTY);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const downloadLog = () => {
    const lines = [
      "AI AGENT PROGRAMMING — CHANGE LOG",
      "Append-only record of changes to AI agents, components, doctrine, and policy.",
      `Generated: ${new Date().toISOString()}`,
      `Total entries: ${entries.length}`,
      "=".repeat(72),
      "",
    ];
    // Oldest first for a chronological record.
    [...entries].reverse().forEach((e, i) => {
      const label = CATEGORIES.find((c) => c.value === e.category)?.label || e.category;
      lines.push(`#${i + 1}  [${label}]  ${e.summary}`);
      lines.push(`Date: ${e.created_date ? new Date(e.created_date).toLocaleString() : "—"}`);
      if (e.agent_or_component) lines.push(`Applies to: ${e.agent_or_component}`);
      if (e.recorded_by) lines.push(`Recorded by: ${e.recorded_by}`);
      if (e.details) lines.push(`Details: ${e.details}`);
      lines.push("-".repeat(72));
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-programming-changelog-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-900 rounded-xl"><FileText className="w-4 h-4 text-white" /></div>
          <div>
            <p className="text-sm font-bold text-slate-900">AI Programming Change Log</p>
            <p className="text-xs text-slate-500 max-w-lg mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Append-only. Entries are added, never altered — a permanent record of changes to all component categories, doctrine, and policy.
            </p>
          </div>
        </div>
        <Button onClick={downloadLog} disabled={entries.length === 0} variant="outline" className="gap-2 text-sm">
          <Download className="w-4 h-4" /> Download Document
        </Button>
      </div>

      {/* Add entry */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Record a Change</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Applies to (agent / component / policy)</Label>
              <Input className="mt-1" value={form.agent_or_component}
                onChange={(e) => setForm({ ...form, agent_or_component: e.target.value })}
                placeholder="e.g. BOB, AGENT-NETGOOD-1.0, Do No Harm Doctrine" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Summary</Label>
            <Input className="mt-1" value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Short title of the change" />
          </div>
          <div>
            <Label className="text-xs">Details</Label>
            <Textarea className="mt-1" rows={3} value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="What was added or changed?" />
          </div>
          <Button onClick={addEntry} disabled={saving || !form.summary.trim()} className="gap-2 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No changes recorded yet.</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[e.category] || CATEGORY_COLORS.other}`}>
                    {CATEGORIES.find((c) => c.value === e.category)?.label || e.category}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{e.summary}</span>
                  {e.agent_or_component && <span className="text-xs text-slate-400">· {e.agent_or_component}</span>}
                </div>
                {e.details && <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-wrap">{e.details}</p>}
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {e.created_date ? new Date(e.created_date).toLocaleString() : ""}{e.recorded_by ? ` · ${e.recorded_by}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}