import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Mail, Shield } from "lucide-react";
import UserPrivilegeToggles from "./UserPrivilegeToggles";
import UserServicePanel from "./UserServicePanel";

const ROLE_OPTIONS = ["user", "builder", "staff", "admin"];
const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  staff: "bg-blue-100 text-blue-700",
  builder: "bg-violet-100 text-violet-700",
  user: "bg-slate-100 text-slate-600",
};

export default function UserDetailDrawer({ targetUser, actor, onClose, onChanged }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("privileges");
  const [role, setRole] = useState(targetUser?.role || "user");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const existing = await base44.entities.UserAdminProfile.filter({ user_id: targetUser.id });
      let p = existing[0];
      if (!p) {
        p = await base44.entities.UserAdminProfile.create({
          user_id: targetUser.id,
          user_email: targetUser.email,
          user_name: targetUser.full_name,
        });
      }
      if (active) { setProfile(p); setRole(targetUser.role || "user"); setLoading(false); }
    })();
    return () => { active = false; };
  }, [targetUser.id]);

  const stamp = () => ({
    last_served_by: actor?.full_name || actor?.email,
    last_served_at: new Date().toISOString(),
  });

  const updateProfile = async (path, value) => {
    setSaving(true);
    const patch = { ...stamp() };
    if (path.startsWith("privileges.")) {
      const key = path.split(".")[1];
      patch.privileges = { ...(profile.privileges || {}), [key]: value };
    } else {
      patch[path] = value;
      if (path === "resident_developer" && value) patch.resident_since = new Date().toISOString();
    }
    const updated = await base44.entities.UserAdminProfile.update(profile.id, patch);
    setProfile({ ...profile, ...patch, ...updated });
    setSaving(false);
    onChanged && onChanged();
  };

  const changeStatus = async (status) => {
    await updateProfile("account_status", status);
    await base44.asServiceRole?.entities?.UserServiceRecord?.create?.({
      user_id: targetUser.id, user_email: targetUser.email, user_name: targetUser.full_name,
      record_type: "privilege_change", title: `Account status set to ${status}`,
      status: "resolved", handled_by: actor?.full_name || actor?.email, handled_at: new Date().toISOString(),
    }).catch(() => {});
  };

  const changeRole = async (newRole) => {
    setSaving(true);
    setRole(newRole);
    await base44.entities.User.update(targetUser.id, { role: newRole });
    setSaving(false);
    onChanged && onChanged();
  };

  const TABS = [
    { id: "privileges", label: "Privileges", icon: Shield },
    { id: "service", label: "Serve User", icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-50 h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-sm font-bold text-slate-900">{targetUser.full_name || "Unnamed user"}</p>
            <p className="text-xs text-slate-400">{targetUser.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Role */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-sm font-bold text-slate-900 mb-2">Role</p>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button key={r} disabled={saving} onClick={() => changeRole(r)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-all ${
                      role === r ? ROLE_COLORS[r] + " ring-2 ring-offset-1 ring-slate-300" : "bg-slate-100 text-slate-400 hover:text-slate-600"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-md transition-all ${
                    tab === id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {tab === "privileges" && (
              <UserPrivilegeToggles profile={profile} saving={saving} onChange={updateProfile} onStatusChange={changeStatus} />
            )}
            {tab === "service" && (
              <UserServicePanel
                targetUser={targetUser}
                profile={profile}
                onUnlock={() => changeStatus("active")}
                onLogged={onChanged}
              />
            )}

            {saving && <p className="text-[11px] text-slate-400 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</p>}
          </div>
        )}
      </div>
    </div>
  );
}