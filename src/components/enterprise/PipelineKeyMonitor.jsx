import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, KeyRound, ShieldOff, CircleDot, Loader2 } from "lucide-react";

const STATUS_META = {
  active: { label: "Live", color: "#10B981", Icon: CircleDot },
  pending_payment: { label: "Pending", color: "#F59E0B", Icon: Loader2 },
  revoked: { label: "Revoked", color: "#EF4444", Icon: ShieldOff },
};

/** Pipeline Key Monitor — live status of enterprise keys. */
export default function PipelineKeyMonitor({ isAdmin }) {
  const [keys, setKeys] = useState(null);

  const load = async () => {
    const rows = await base44.entities.PipelineKey.list("-issued_at", 100);
    setKeys(rows);
  };
  useEffect(() => {
    load();
    const unsub = base44.entities.PipelineKey.subscribe(() => load());
    return unsub;
  }, []);

  return (
    <div className="rounded-2xl border p-6" style={{ background: "linear-gradient(180deg,rgba(16,20,28,0.7),rgba(8,10,16,0.85))", borderColor: "#10B98133" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Live Telemetry</p>
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Pipeline Key Monitor</h3>
        </div>
        {keys && (
          <span className="ml-auto text-xs text-white/40">
            {keys.filter((k) => k.status === "active").length} active
          </span>
        )}
      </div>

      {keys === null ? (
        <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-white/30 mx-auto" /></div>
      ) : keys.length === 0 ? (
        <div className="py-8 text-center">
          <KeyRound className="w-8 h-8 mx-auto text-white/20 mb-2" />
          <p className="text-xs text-white/40">{isAdmin ? "No pipeline keys issued yet across the platform." : "No enterprise pipeline keys on your account yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => {
            const meta = STATUS_META[k.status] || STATUS_META.pending_payment;
            const Icon = meta.Icon;
            return (
              <div key={k.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{k.pipeline_name || k.pipeline_slug || "Pipeline Key"}</p>
                  <p className="text-[10px] text-white/40 font-mono truncate">{k.key_prefix || "ASX-PIPE"}••••{k.key_last4 || "----"} {k.company_name ? `· ${k.company_name}` : ""}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0" style={{ color: meta.color }}>
                  <Icon className={`w-3.5 h-3.5 ${k.status === "pending_payment" ? "animate-spin" : ""}`} /> {meta.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}