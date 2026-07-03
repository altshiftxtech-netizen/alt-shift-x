import React, { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const BLANK = {
  month_label: "", period: "", total_raised: 0, growth_pct: 0, contributors: 0,
  purchases: 0, allocations: [], funded_items: [], is_current: false,
};

// A helper to edit an array of {label,pct,amount,color} or {title,detail,cost}
// as a JSON textarea — simple and reliable for admin use.
function JsonList({ label, value, onChange, placeholder }) {
  const [text, setText] = useState(JSON.stringify(value || [], null, 2));
  const [err, setErr] = useState("");
  return (
    <label className="col-span-2 block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <textarea value={text} rows={5} placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          try { onChange(JSON.parse(e.target.value || "[]")); setErr(""); }
          catch { setErr("Invalid JSON"); }
        }}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono" />
      {err && <span className="text-xs text-red-500">{err}</span>}
    </label>
  );
}

export default function FundAdmin({ funds, reload }) {
  const [editing, setEditing] = useState(null);

  const save = async () => {
    const data = { ...editing };
    ["total_raised", "growth_pct", "contributors", "purchases"].forEach((k) => (data[k] = Number(data[k]) || 0));
    // Only one month can be current.
    if (data.is_current) {
      const others = funds.filter((f) => f.is_current && f.id !== data.id);
      await Promise.all(others.map((f) => base44.entities.CommunityFund.update(f.id, { is_current: false })));
    }
    if (data.id) {
      const { id, ...rest } = data;
      await base44.entities.CommunityFund.update(id, rest);
    } else {
      await base44.entities.CommunityFund.create(data);
    }
    setEditing(null);
    reload();
  };
  const remove = async (id) => {
    if (!confirm("Delete this month?")) return;
    await base44.entities.CommunityFund.delete(id);
    reload();
  };

  const field = (label, key, type = "text") => (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input type={type} value={editing[key] ?? ""} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </label>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{funds.length} months</p>
        <button onClick={() => setEditing({ ...BLANK })} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Month
        </button>
      </div>

      <div className="space-y-2">
        {funds.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{f.month_label} {f.is_current && <span className="text-[10px] text-green-600">● current</span>}</p>
              <p className="text-xs text-slate-400">${f.total_raised?.toLocaleString()} · {f.contributors} contributors</p>
            </div>
            <button onClick={() => setEditing(f)} className="text-sm text-[#0066FF] font-medium">Edit</button>
            <button onClick={() => remove(f.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">{editing.id ? "Edit" : "New"} Fund Month</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("Month label (e.g. June 2026)", "month_label")}
              {field("Period (e.g. 2026-06)", "period")}
              {field("Total raised ($)", "total_raised", "number")}
              {field("Growth %", "growth_pct", "number")}
              {field("Contributors", "contributors", "number")}
              {field("Purchases", "purchases", "number")}
              <JsonList label='Allocations [{"label","pct","amount","color"}]'
                value={editing.allocations} onChange={(v) => setEditing({ ...editing, allocations: v })}
                placeholder='[{"label":"Events","pct":40,"amount":4980,"color":"#FF9500"}]' />
              <JsonList label='Funded items [{"title","detail","cost"}]'
                value={editing.funded_items} onChange={(v) => setEditing({ ...editing, funded_items: v })}
                placeholder='[{"title":"Dev Workshop","detail":"React Performance","cost":1200}]' />
              <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={!!editing.is_current} onChange={(e) => setEditing({ ...editing, is_current: e.target.checked })} /> This is the current headline month
              </label>
            </div>
            <button onClick={save} className="mt-6 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0066FF] text-white py-2.5 font-bold">
              <Save className="w-4 h-4" /> Save Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}