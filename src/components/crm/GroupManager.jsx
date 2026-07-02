import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Users, Trash2, Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"];

export default function GroupManager({ ownerId, groups, contacts, onChanged }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await base44.entities.CrmGroup.create({ name: name.trim(), color, owner_id: ownerId });
    setSaving(false);
    setName("");
    onChanged();
  };
  const remove = async (g) => {
    if (!confirm(`Delete group "${g.name}"?`)) return;
    await base44.entities.CrmGroup.delete(g.id);
    onChanged();
  };

  const countFor = (gid) => contacts.filter((c) => (c.group_ids || []).includes(gid)).length;

  return (
    <div className="max-w-2xl">
      <div className="bg-[#241812] border border-orange-900/40 rounded-xl p-4 mb-4">
        <p className="text-sm font-bold text-white mb-3">Create a group</p>
        <div className="flex flex-wrap gap-2 items-center">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Group name, e.g. VIP Clients"
            className="flex-1 min-w-[180px] bg-[#1a120d] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500" />
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full transition-all ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#241812]" : ""}`} style={{ background: c }} />
            ))}
          </div>
          <button onClick={add} disabled={saving || !name.trim()} className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-orange-200/40 text-sm py-8">No groups yet.</p>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-3 bg-[#241812] border border-orange-900/40 rounded-lg px-4 py-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: g.color }}><Users className="w-4 h-4" /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{g.name}</p>
                <p className="text-[11px] text-orange-200/50">{countFor(g.id)} members</p>
              </div>
              <button onClick={() => remove(g)} className="text-orange-200/40 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}