import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Award, Users, Settings2 } from "lucide-react";
import UserDetailDrawer from "./UserDetailDrawer";

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700",
  staff: "bg-blue-100 text-blue-700",
  builder: "bg-violet-100 text-violet-700",
  user: "bg-slate-100 text-slate-600",
};

export default function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const [me, userList, profileList] = await Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.User.list("-created_date", 500).catch(() => []),
      base44.entities.UserAdminProfile.list("-created_date", 500).catch(() => []),
    ]);
    setActor(me);
    setUsers(userList);
    const map = {};
    profileList.forEach((p) => { map[p.user_id] = p; });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search users by name, email, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-2">
          <Users className="w-6 h-6" /> No users found
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const p = profiles[u.id];
            return (
              <Card key={u.id} className="cursor-pointer hover:border-slate-300 transition-colors" onClick={() => setSelected(u)}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(u.full_name || u.email || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{u.full_name || "Unnamed"}</p>
                        {p?.resident_developer && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <Award className="w-2.5 h-2.5" /> Resident
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p?.account_status && p.account_status !== "active" && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 capitalize">{p.account_status}</span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role || "user"}</span>
                    <Settings2 className="w-4 h-4 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <UserDetailDrawer
          targetUser={selected}
          actor={actor}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}