import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, CheckCircle2, Clock, Ban, ShieldOff, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS = {
  signed_up: { label: "Signed up", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  invited: { label: "Invited", cls: "bg-amber-100 text-amber-700", icon: Clock },
  pending: { label: "Pending", cls: "bg-slate-100 text-slate-500", icon: Clock },
};

export default function ResidentDevRoster({ refreshSignal }) {
  const [devs, setDevs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [revoking, setRevoking] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("listResidentDevs", {});
      setDevs(res.data?.devs || []);
    } catch {
      setDevs([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshSignal]);

  const revoke = async (dev) => {
    setRevoking(dev.user_id);
    await base44.functions.invoke("revokeResidentDev", { user_id: dev.user_id });
    setConfirmId(null);
    setRevoking(null);
    await load();
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" /> Resident Developers
          </p>
          <button onClick={load} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : devs.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">No Resident Developers yet.</p>
        ) : (
          <div className="space-y-2">
            {devs.map((dev) => {
              const s = STATUS[dev.status] || STATUS.pending;
              const SIcon = s.icon;
              const isRevoked = dev.account_status === "suspended";
              return (
                <div key={dev.profile_id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{dev.name}</p>
                    <p className="text-xs text-slate-400 truncate">{dev.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isRevoked ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                        <ShieldOff className="w-3 h-3" /> Revoked
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${s.cls}`}>
                        <SIcon className="w-3 h-3" /> {s.label}
                      </span>
                    )}

                    {!isRevoked && (
                      confirmId === dev.user_id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-500 gap-1" onClick={() => revoke(dev)} disabled={revoking === dev.user_id}>
                            {revoking === dev.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />} Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50 gap-1" onClick={() => setConfirmId(dev.user_id)}>
                          <Ban className="w-3 h-3" /> Revoke
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}