import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, DollarSign, Loader2, X, Trash2 } from "lucide-react";

const STAGES = [
  { id: "lead", label: "Lead", color: "border-slate-500" },
  { id: "qualified", label: "Qualified", color: "border-blue-500" },
  { id: "proposal", label: "Proposal", color: "border-violet-500" },
  { id: "negotiation", label: "Negotiation", color: "border-amber-500" },
  { id: "won", label: "Won", color: "border-emerald-500" },
  { id: "lost", label: "Lost", color: "border-red-500" },
];
const FIELD = "w-full bg-[#241812] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500";

export default function DealPipeline({ ownerId, deals, contacts, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", contact_id: "", value: 0, stage: "lead", expected_close: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const contact = contacts.find((c) => c.id === form.contact_id);
    await base44.entities.CrmDeal.create({ ...form, value: Number(form.value) || 0, owner_id: ownerId, contact_name: contact?.name || "" });
    setSaving(false);
    setAdding(false);
    setForm({ title: "", contact_id: "", value: 0, stage: "lead", expected_close: "", notes: "" });
    onChanged();
  };

  const moveStage = async (deal, stage) => {
    await base44.entities.CrmDeal.update(deal.id, { stage });
    onChanged();
  };
  const remove = async (deal) => {
    if (!confirm(`Delete deal "${deal.title}"?`)) return;
    await base44.entities.CrmDeal.delete(deal.id);
    onChanged();
  };

  const total = deals.filter((d) => !["won", "lost"].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
  const won = deals.filter((d) => d.stage === "won").reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="bg-[#241812] border border-orange-900/40 rounded-lg px-3 py-2">
          <p className="text-[10px] text-orange-200/50 uppercase">Open Pipeline</p>
          <p className="text-lg font-black text-white">${total.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-lg px-3 py-2">
          <p className="text-[10px] text-emerald-300/70 uppercase">Won</p>
          <p className="text-lg font-black text-emerald-300">${won.toLocaleString()}</p>
        </div>
        <button onClick={() => setAdding(true)} className="ml-auto flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Deal
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          return (
            <div key={stage.id} className={`bg-[#1a120d] border-t-2 ${stage.color} border border-orange-900/40 rounded-xl p-2.5 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-white">{stage.label}</p>
                <span className="text-[10px] text-orange-200/50">{stageDeals.length}</span>
              </div>
              <div className="space-y-2">
                {stageDeals.map((d) => (
                  <div key={d.id} className="bg-[#241812] border border-orange-900/40 rounded-lg p-2.5 group">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-white leading-tight">{d.title}</p>
                      <button onClick={() => remove(d)} className="opacity-0 group-hover:opacity-100 text-orange-200/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    {d.contact_name && <p className="text-[10px] text-orange-200/50 mt-0.5">{d.contact_name}</p>}
                    {d.value > 0 && <p className="text-[11px] font-bold text-emerald-300 flex items-center gap-0.5 mt-1"><DollarSign className="w-3 h-3" />{d.value.toLocaleString()}</p>}
                    <select value={d.stage} onChange={(e) => moveStage(d, e.target.value)}
                      className="mt-1.5 w-full text-[10px] bg-[#1a120d] text-orange-200/70 border border-orange-900/40 rounded px-1 py-0.5 outline-none">
                      {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-[#1a120d] border border-orange-900/40 rounded-2xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">New Deal</h3>
              <button onClick={() => setAdding(false)} className="text-orange-200/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className={FIELD} placeholder="Deal title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <select className={FIELD} value={form.contact_id} onChange={(e) => set("contact_id", e.target.value)}>
                <option value="">— Link a contact —</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className={FIELD} placeholder="Value ($)" value={form.value} onChange={(e) => set("value", e.target.value)} />
                <select className={FIELD} value={form.stage} onChange={(e) => set("stage", e.target.value)}>
                  {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <input type="date" className={FIELD} value={form.expected_close} onChange={(e) => set("expected_close", e.target.value)} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setAdding(false)} className="bg-[#3a2a24] hover:bg-[#4a3830] text-orange-100 text-sm px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={save} disabled={saving || !form.title.trim()} className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}