import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Briefcase, Activity, Tag, Loader2, ArrowLeft, Contact2 } from "lucide-react";
import useCrmData from "@/hooks/useCrmData";
import ContactsList from "@/components/crm/ContactsList";
import DealPipeline from "@/components/crm/DealPipeline";
import ActivityTimeline from "@/components/crm/ActivityTimeline";
import GroupManager from "@/components/crm/GroupManager";
import ContactDetailDrawer from "@/components/crm/ContactDetailDrawer";
import UpKeeperGate from "@/components/upkeeper/UpKeeperGate";

const TABS = [
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: Briefcase },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "groups", label: "Groups", icon: Tag },
];

export default function Crm() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const allowed = user?.role === "admin" || user?.role === "staff";
  const [tab, setTab] = useState("contacts");
  const [selected, setSelected] = useState(null);

  const { contacts, groups, deals, activities, loading, refresh } = useCrmData();

  useEffect(() => {
    (async () => {
      try { setUser(await base44.auth.me()); } catch { setUser(null); }
      setChecking(false);
    })();
  }, []);

  if (checking || !allowed) return <UpKeeperGate checking={checking} role={user?.role} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a120d] via-[#2a1d16] to-[#1a120d]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-900/50 border border-orange-700/40 flex items-center justify-center">
              <Contact2 className="w-6 h-6 text-orange-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Relationship <span className="text-orange-400">CRM</span></h1>
              <p className="text-orange-200/60 text-xs mt-0.5">Contacts, companies, deals & activity · {user?.role} access</p>
            </div>
          </div>
          <Link to="/admin/upkeeper" className="sm:ml-auto flex items-center gap-1.5 text-xs text-orange-200/60 hover:text-white px-3 py-2 rounded-lg hover:bg-[#2a1d16] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> UpKeeper
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-[#241812] border border-orange-900/40 rounded-xl p-1 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? "bg-orange-600 text-white shadow" : "text-orange-200/60 hover:text-white hover:bg-[#3a2a24]"}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
        ) : (
          <>
            {tab === "contacts" && (
              <ContactsList ownerId={user.id} contacts={contacts} groups={groups} onChanged={refresh} onSelect={setSelected} />
            )}
            {tab === "pipeline" && (
              <DealPipeline ownerId={user.id} deals={deals} contacts={contacts} onChanged={refresh} />
            )}
            {tab === "activity" && (
              <ActivityTimeline ownerId={user.id} activities={activities} contacts={contacts} onChanged={refresh} />
            )}
            {tab === "groups" && (
              <GroupManager ownerId={user.id} groups={groups} contacts={contacts} onChanged={refresh} />
            )}
          </>
        )}
      </div>

      {selected && (
        <ContactDetailDrawer
          contact={selected}
          ownerId={user.id}
          activities={activities}
          contacts={contacts}
          groups={groups}
          deals={deals}
          onChanged={refresh}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}