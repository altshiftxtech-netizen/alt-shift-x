import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Mail, Check, X, Loader2, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COMPONENTS = [
  { id: "rp-1", name: "Ironclad Protocol" },
  { id: "pm-1", name: "Estimator's Eye" },
  { id: "rc-1", name: "The Site Board" },
];

const ROLE_COLORS = {
  editor: "bg-blue-100 text-blue-700",
  reviewer: "bg-amber-100 text-amber-700",
  viewer: "bg-slate-100 text-slate-600",
};

export default function CollaborationPanel() {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("reviewer");
  const [inviteComponent, setInviteComponent] = useState(COMPONENTS[0].id);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    base44.entities.ComponentCollaboration.list("-created_date", 10)
      .then(data => { setCollabs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    const comp = COMPONENTS.find(c => c.id === inviteComponent);
    try {
      const existing = collabs.find(c => c.component_id === inviteComponent);
      if (existing) {
        const updated = { ...existing, collaborators: [...(existing.collaborators || []), { email: inviteEmail, role: inviteRole, status: "pending", invited_at: new Date().toISOString() }] };
        await base44.entities.ComponentCollaboration.update(existing.id, updated);
        setCollabs(prev => prev.map(c => c.id === existing.id ? updated : c));
      } else {
        const newCollab = await base44.entities.ComponentCollaboration.create({
          component_id: inviteComponent,
          component_name: comp.name,
          owner_id: "current_user",
          collaborators: [{ email: inviteEmail, role: inviteRole, status: "pending", invited_at: new Date().toISOString() }],
          status: "active"
        });
        setCollabs(prev => [newCollab, ...prev]);
      }
      setSuccess(true);
      setInviteEmail("");
      setTimeout(() => { setSuccess(false); setShowInvite(false); }, 2000);
    } catch (e) { }
    setSaving(false);
  };

  const allCollaborators = collabs.flatMap(c =>
    (c.collaborators || []).map(col => ({ ...col, component_name: c.component_name, component_id: c.component_id }))
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Component Collaboration
          </CardTitle>
          <Button size="sm" className="h-7 text-xs bg-slate-900 hover:bg-slate-700 gap-1"
            onClick={() => setShowInvite(!showInvite)}>
            <Plus className="w-3.5 h-3.5" /> Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showInvite && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <input
              type="email"
              placeholder="collaborator@email.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-slate-300"
            />
            <div className="flex gap-2">
              <select value={inviteComponent} onChange={e => setInviteComponent(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none bg-white">
                {COMPONENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none bg-white">
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <Button onClick={handleInvite} disabled={saving || !inviteEmail.trim()} size="sm"
              className="w-full text-xs h-8 bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <><Check className="w-3.5 h-3.5" /> Invited!</> : <><Mail className="w-3.5 h-3.5" /> Send Invite</>}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
        ) : allCollaborators.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No collaborators yet. Invite team members to work on your components.
          </div>
        ) : (
          <div className="space-y-2">
            {allCollaborators.map((col, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {col.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">{col.email}</p>
                    <p className="text-[10px] text-slate-400">{col.component_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[col.role]}`}>{col.role}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${col.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{col.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}