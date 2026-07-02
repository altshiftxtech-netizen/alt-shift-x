import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, User, Mail, Phone, Search, Plus, Pencil, Trash2 } from "lucide-react";
import ContactForm from "./ContactForm";

export default function ContactsList({ ownerId, contacts, groups, onChanged, onSelect }) {
  const [editing, setEditing] = useState(null); // contact object or {} for new
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");

  const companies = useMemo(() => contacts.filter((c) => c.kind === "company"), [contacts]);

  const filtered = useMemo(() => contacts.filter((c) => {
    const kindMatch = kindFilter === "all" || c.kind === kindFilter;
    const s = search.toLowerCase();
    const searchMatch = !s || c.name.toLowerCase().includes(s) || (c.email || "").toLowerCase().includes(s);
    return kindMatch && searchMatch;
  }), [contacts, search, kindFilter]);

  const remove = async (c) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    await base44.entities.CrmContact.delete(c.id);
    onChanged();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts…"
            className="w-full pl-9 bg-[#241812] text-orange-50 text-sm px-3 py-2 rounded-lg border border-orange-900/40 outline-none focus:border-orange-500" />
        </div>
        <div className="flex gap-1 bg-[#241812] border border-orange-900/40 rounded-lg p-1">
          {["all", "individual", "company"].map((k) => (
            <button key={k} onClick={() => setKindFilter(k)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${kindFilter === k ? "bg-orange-600 text-white" : "text-orange-200/60 hover:text-white"}`}>
              {k === "all" ? "All" : k === "individual" ? "People" : "Companies"}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-orange-200/40 text-sm py-12">No contacts yet. Add your first one.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((c) => {
            const contactGroups = groups.filter((g) => (c.group_ids || []).includes(g.id));
            return (
              <div key={c.id} className="bg-[#241812] border border-orange-900/40 rounded-xl p-4 hover:border-orange-700/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.kind === "company" ? "bg-blue-900/50 text-blue-300" : "bg-orange-900/50 text-orange-300"}`}>
                    {c.kind === "company" ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => onSelect(c)} className="text-left">
                      <p className="text-sm font-bold text-white truncate hover:text-orange-300">{c.name}</p>
                      {c.title && <p className="text-[11px] text-orange-200/50">{c.title}</p>}
                    </button>
                    <div className="flex flex-col gap-0.5 mt-1.5">
                      {c.email && <span className="text-[11px] text-orange-200/60 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      {c.phone && <span className="text-[11px] text-orange-200/60 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    </div>
                    {contactGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contactGroups.map((g) => (
                          <span key={g.id} className="text-[9px] px-1.5 py-0.5 rounded-full text-white" style={{ background: g.color }}>{g.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setEditing(c)} className="text-orange-200/40 hover:text-orange-300 p-1"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(c)} className="text-orange-200/40 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ContactForm
          ownerId={ownerId}
          groups={groups}
          companies={companies}
          existing={editing.id ? editing : null}
          onSaved={() => { setEditing(null); onChanged(); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}