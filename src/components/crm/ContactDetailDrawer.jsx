import React from "react";
import { X, Building2, User, Mail, Phone, Printer, Globe } from "lucide-react";
import ActivityTimeline from "./ActivityTimeline";

export default function ContactDetailDrawer({ contact, ownerId, activities, contacts, groups, deals, onChanged, onClose }) {
  if (!contact) return null;
  const contactGroups = groups.filter((g) => (contact.group_ids || []).includes(g.id));
  const contactDeals = deals.filter((d) => d.contact_id === contact.id);
  const company = contacts.find((c) => c.id === contact.company_id);

  const Row = ({ icon: Icon, value, href }) => value ? (
    <div className="flex items-center gap-2 text-sm text-orange-200/70">
      <Icon className="w-4 h-4 text-orange-400/60" />
      {href ? <a href={href} className="hover:text-orange-300">{value}</a> : <span>{value}</span>}
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="bg-[#1a120d] border-l border-orange-900/40 w-full max-w-md h-full overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${contact.kind === "company" ? "bg-blue-900/50 text-blue-300" : "bg-orange-900/50 text-orange-300"}`}>
              {contact.kind === "company" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{contact.name}</h3>
              {contact.title && <p className="text-xs text-orange-200/60">{contact.title}{company ? ` · ${company.name}` : ""}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-orange-200/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-1.5 bg-[#241812] border border-orange-900/40 rounded-xl p-4 mb-4">
          <Row icon={Mail} value={contact.email} href={contact.email ? `mailto:${contact.email}` : null} />
          <Row icon={Phone} value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : null} />
          <Row icon={Printer} value={contact.fax} />
          <Row icon={Globe} value={contact.website} href={contact.website} />
          {contactGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {contactGroups.map((g) => <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ background: g.color }}>{g.name}</span>)}
            </div>
          )}
          {contact.notes && <p className="text-xs text-orange-200/60 pt-2 border-t border-orange-900/40 mt-2">{contact.notes}</p>}
        </div>

        {contactDeals.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-white mb-2">Deals</p>
            <div className="space-y-1.5">
              {contactDeals.map((d) => (
                <div key={d.id} className="flex items-center justify-between bg-[#241812] border border-orange-900/40 rounded-lg px-3 py-2">
                  <span className="text-xs text-white">{d.title}</span>
                  <span className="text-[11px] text-emerald-300 font-semibold">${(d.value || 0).toLocaleString()} · {d.stage}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <ActivityTimeline ownerId={ownerId} activities={activities} contacts={contacts} onChanged={onChanged} contactId={contact.id} />
      </div>
    </div>
  );
}