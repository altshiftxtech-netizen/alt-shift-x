import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { StickyNote, Phone, Printer, Mail, Video, CheckSquare, Plus, Loader2, X, ExternalLink } from "lucide-react";

const TYPE_META = {
  note: { icon: StickyNote, color: "text-slate-300 bg-slate-700/50", label: "Note" },
  call: { icon: Phone, color: "text-blue-300 bg-blue-900/40", label: "Call" },
  fax: { icon: Printer, color: "text-violet-300 bg-violet-900/40", label: "Fax" },
  email: { icon: Mail, color: "text-emerald-300 bg-emerald-900/40", label: "Email" },
  meeting: { icon: Video, color: "text-amber-300 bg-amber-900/40", label: "Meeting" },
  task: { icon: CheckSquare, color: "text-orange-300 bg-orange-900/40", label: "Task" },
};
const FIELD = "w-full bg-[#241812] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500";

export default function ActivityTimeline({ ownerId, activities, contacts, onChanged, contactId = null }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: "note", subject: "", body: "", contact_id: contactId || "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const list = contactId ? activities.filter((a) => a.contact_id === contactId) : activities;

  const save = async () => {
    if (!form.subject.trim()) return;
    setSaving(true);
    const contact = contacts.find((c) => c.id === form.contact_id);
    let meeting_url = "";
    // A "meeting" activity spins up a real Google Meet link via the calendar integration.
    if (form.type === "meeting") {
      try {
        const res = await base44.functions.invoke("googleCalendarOps", {
          action: "create_meet",
          summary: form.subject,
          description: form.body || "",
          start: new Date().toISOString(),
          attendees: contact?.email ? [contact.email] : [],
        });
        meeting_url = res.data?.event?.meetLink || "";
      } catch { /* fall through — activity still logs without a link */ }
    }
    await base44.entities.CrmActivity.create({
      ...form, owner_id: ownerId, contact_name: contact?.name || "", meeting_url,
    });
    setSaving(false);
    setAdding(false);
    setForm({ type: "note", subject: "", body: "", contact_id: contactId || "" });
    onChanged();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-white">Activity {contactId ? "" : "Log"}</p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
          <Plus className="w-3.5 h-3.5" /> Log
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-orange-200/40 text-sm py-8">Nothing logged yet.</p>
      ) : (
        <div className="space-y-2">
          {list.map((a) => {
            const meta = TYPE_META[a.type] || TYPE_META.note;
            const Icon = meta.icon;
            return (
              <div key={a.id} className="flex gap-3 bg-[#241812] border border-orange-900/40 rounded-lg p-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}><Icon className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{a.subject}</p>
                    <span className="text-[9px] uppercase tracking-wide text-orange-200/40">{meta.label}</span>
                  </div>
                  {a.contact_name && !contactId && <p className="text-[11px] text-orange-300/70">{a.contact_name}</p>}
                  {a.body && <p className="text-xs text-orange-200/60 mt-0.5">{a.body}</p>}
                  {a.meeting_url && (
                    <a href={a.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 mt-1">
                      <Video className="w-3 h-3" /> Join Google Meet <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <p className="text-[10px] text-orange-200/30 mt-1">{new Date(a.created_date).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="bg-[#1a120d] border border-orange-900/40 rounded-2xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Log Activity</h3>
              <button onClick={() => setAdding(false)} className="text-orange-200/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(TYPE_META).map(([k, m]) => {
                  const Icon = m.icon;
                  return (
                    <button key={k} onClick={() => set("type", k)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] transition-all ${form.type === k ? "bg-orange-600 border-orange-500 text-white" : "border-orange-900/40 text-orange-200/60 hover:text-white"}`}>
                      <Icon className="w-4 h-4" /> {m.label}
                    </button>
                  );
                })}
              </div>
              {!contactId && (
                <select className={FIELD} value={form.contact_id} onChange={(e) => set("contact_id", e.target.value)}>
                  <option value="">— Link a contact —</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <input className={FIELD} placeholder="Subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
              <textarea className={FIELD} rows={3} placeholder="Details" value={form.body} onChange={(e) => set("body", e.target.value)} />
              {form.type === "meeting" && (
                <p className="text-[11px] text-amber-300/80 bg-amber-900/20 border border-amber-800/40 rounded-lg px-3 py-2">A Google Meet link will be created and emailed to the linked contact.</p>
              )}
              {(form.type === "call" || form.type === "fax") && (
                <p className="text-[11px] text-orange-200/50 bg-[#241812] border border-orange-900/40 rounded-lg px-3 py-2">Logged manually. Live {form.type} sending activates once Twilio is connected.</p>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setAdding(false)} className="bg-[#3a2a24] hover:bg-[#4a3830] text-orange-100 text-sm px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={save} disabled={saving || !form.subject.trim()} className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2">
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