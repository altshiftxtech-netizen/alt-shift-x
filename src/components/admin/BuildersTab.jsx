import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

const tierConfig = {
  admin: "bg-emerald-100 text-emerald-700",
  builder: "bg-violet-100 text-violet-700",
  user: "bg-slate-100 text-slate-600",
};

// Builders — real platform accounts that have published components, with their
// live component counts pulled from the catalog.
export default function BuildersTab() {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, components] = await Promise.all([
          base44.asServiceRole.entities.User.list("-created_date", 500),
          base44.asServiceRole.entities.Component.list("-created_date", 10000),
        ]);
        // Count components per builder id.
        const counts = {};
        const installs = {};
        for (const c of components) {
          if (!c.builder_id) continue;
          counts[c.builder_id] = (counts[c.builder_id] || 0) + 1;
          installs[c.builder_id] = (installs[c.builder_id] || 0) + (c.installs_count || 0);
        }
        // A builder is any account that has published at least one component,
        // or carries the admin/builder role.
        const list = users
          .filter((u) => counts[u.id] > 0 || u.role === "admin" || u.role === "builder")
          .map((u) => ({
            id: u.id,
            name: u.full_name || u.email,
            email: u.email,
            tier: u.role || "user",
            components: counts[u.id] || 0,
            totalInstalls: installs[u.id] || 0,
            joined: u.created_date,
          }))
          .sort((a, b) => b.components - a.components);
        setBuilders(list);
      } catch {
        setBuilders([]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  if (builders.length === 0) {
    return <div className="text-center py-12 text-slate-400 text-sm">No builders yet</div>;
  }

  return (
    <div className="space-y-3">
      {builders.map((b) => (
        <Card key={b.id}>
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(b.name || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">{b.name}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize shrink-0 ${tierConfig[b.tier] || tierConfig.user}`}>{b.tier}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {b.email} · {b.components} component{b.components === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs shrink-0">
              <span className="text-slate-500 hidden sm:flex items-center gap-1"><Users className="w-3 h-3" />{b.totalInstalls.toLocaleString()} installs</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}