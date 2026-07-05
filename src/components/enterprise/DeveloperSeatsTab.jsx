import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Cpu, Server, Gauge, GitBranch, Lock, ShieldCheck } from "lucide-react";

/**
 * Developer Seats — gated to SOVEREIGN-DEV-SEAT-1.0. Engineers manage keys and
 * view system-level SRE dashboards. Seat entitlement is read from the user's
 * Sovereign subscription; admins always see it.
 */
export default function DeveloperSeatsTab({ isAdmin, hasSeatLicense }) {
  const [sre, setSre] = useState(null);

  useEffect(() => {
    if (!(isAdmin || hasSeatLicense)) return;
    (async () => {
      // System-level SRE snapshot from live platform telemetry.
      const [keys, incidents] = await Promise.all([
        base44.entities.PipelineKey.list("-issued_at", 200).catch(() => []),
        base44.entities.SecurityIncident.list("-created_date", 20).catch(() => []),
      ]);
      const active = keys.filter((k) => k.status === "active").length;
      const openIncidents = incidents.filter((i) => i.status !== "resolved" && i.status !== "closed").length;
      setSre({ active, totalKeys: keys.length, openIncidents });
    })();
  }, [isAdmin, hasSeatLicense]);

  if (!(isAdmin || hasSeatLicense)) {
    return (
      <div className="rounded-2xl border p-10 text-center" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(91,162,255,0.12)", border: "1px solid rgba(91,162,255,0.3)" }}>
          <Lock className="w-6 h-6 text-[#5BA2FF]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#5BA2FF] mb-1">SOVEREIGN-DEV-SEAT-1.0</p>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Developer Seats are seat-gated</h3>
        <p className="text-sm text-white/50 max-w-md mx-auto">Each seat licenses one software engineer to manage enterprise keys and access system-level SRE dashboards. Add Builder Seats at $4,999/mo per engineer from your Sovereign subscription.</p>
      </div>
    );
  }

  const metrics = [
    { icon: Server, label: "Active Enterprise Keys", value: sre?.active ?? "—", color: "#10B981" },
    { icon: GitBranch, label: "Keys Under Management", value: sre?.totalKeys ?? "—", color: "#5BA2FF" },
    { icon: Gauge, label: "Open Incidents", value: sre?.openIncidents ?? "—", color: sre?.openIncidents ? "#EF4444" : "#10B981" },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border p-6" style={{ background: "linear-gradient(180deg,rgba(20,24,34,0.7),rgba(8,10,16,0.85))", borderColor: "#5BA2FF33" }}>
        <div className="flex items-center gap-3 mb-1">
          <Cpu className="w-5 h-5 text-[#5BA2FF]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>System-Level SRE Dashboard</h3>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> SEAT VERIFIED</span>
        </div>
        <p className="text-xs text-white/45 mb-5">Live reliability telemetry for the Sovereign environment.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <m.icon className="w-4 h-4 mb-2" style={{ color: m.color }} />
              <p className="text-2xl font-black text-white">{m.value}</p>
              <p className="text-[11px] text-white/45 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <h4 className="text-sm font-bold text-white mb-3">Key Management</h4>
        <p className="text-xs text-white/50 mb-4">Seat holders transmit and rotate enterprise keys through the Secure Handshake, and monitor live key status in the Pipeline Key Monitor. All transfers generate forensic read-receipts.</p>
        <div className="flex flex-wrap gap-2">
          <a href="/dashboard/api-keys"><Button size="sm" variant="outline" className="text-xs border-white/15 text-white/80 bg-transparent hover:bg-white/10">Manage API Keys</Button></a>
          <a href="/admin/security"><Button size="sm" variant="outline" className="text-xs border-white/15 text-white/80 bg-transparent hover:bg-white/10">Security Center</Button></a>
        </div>
      </div>
    </div>
  );
}