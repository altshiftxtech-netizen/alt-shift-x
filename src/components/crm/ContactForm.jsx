import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";

const FIELD = "w-full bg-[#241812] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500";

export default function ContactForm({ ownerId, groups, companies, existing, onSaved, onClose }) {
  const [form, setForm] = useState(existing || {
    kind: "individual", name: "", company_id: "", title: "", email: "",
    phone: "", fax: "", website: "", notes: "", status: "active", group_ids: [],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, owner_id: ownerId };
    const saved = existing?.id
      ? await base44.entities.CrmContact.update(existing.id, payload)
      : await base44.entities.CrmContact.create(payload);
    setSaving(false);
    onSaved(saved);
  };

  const toggleGroup = (gid) => set("group_ids",
    (form.group_ids || []).includes(gid)
      ? form.group_ids.filter((x) => x !== gid)
      : [...(form.group_ids || []), gid]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a120d] border border-orange-900/40 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{existing?.id ? "Edit" : "New"} {form.kind === "company" ? "Company" : "Contact"}</h3>
          <button onClick={onClose} className="text-orange-200/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            {["individual", "company"].map((k) => (
              <button key={k} onClick={() => set("kind", k)}
                className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${form.kind === k ? "bg-orange-600 border-orange-500 text-white" : "border-orange-900/40 text-orange-200/60 hover:text-white"}`}>
                {k === "individual" ? "Individual" : "Company"}
              </button>
            ))}
          </div>
          <Input className={FIELD} placeholder={form.kind === "company" ? "Company name" : "Full name"} value={form.name} onChange={(e) => set("name", e.target.value)} />
          {form.kind === "individual" && (
            <>
              <select className={FIELD} value={form.company_id || ""} onChange={(e) => set("company_id", e.target.value)}>
                <option value="">— No company —</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input className={FIELD} placeholder="Job title" value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Input className={FIELD} placeholder="Email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
            <Input className={FIELD} placeholder="Phone" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
            <Input className={FIELD} placeholder="Fax" value={form.fax || ""} onChange={(e) => set("fax", e.target.value)} />
            <Input className={FIELD} placeholder="Website" value={form.website || ""} onChange={(e) => set("website", e.target.value)} />
          </div>
          <select className={FIELD} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {["active", "lead", "customer", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {groups.length > 0 && (
            <div>
              <p className="text-[11px] text-orange-200/50 mb-1.5">Groups</p>
              <div className="flex flex-wrap gap-1.5">
                {groups.map((g) => (
                  <button key={g.id} onClick={() => toggleGroup(g.id)}
                    className={`text-[11px] px-2 py-1 rounded-full border transition-all ${(form.group_ids || []).includes(g.id) ? "text-white border-transparent" : "text-orange-200/60 border-orange-900/40"}`}
                    style={(form.group_ids || []).includes(g.id) ? { background: g.color } : {}}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <textarea className={FIELD} rows={3} placeholder="Notes" value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          <div className="flex justify-end gap-2 pt-1">
            <Button onClick={onClose} className="bg-[#3a2a24] hover:bg-[#4a3830] text-orange-100 text-sm">Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name.trim()} className="bg-orange-600 hover:bg-orange-700 text-white text-sm gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}