import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, KeyRound, Wrench, Plus, ShieldCheck, Boxes, Building2, User } from "lucide-react";
import SovereignGuideRepo from "./SovereignGuideRepo";
import CreateKeyModal from "./CreateKeyModal";
import PatchKeyModal from "./PatchKeyModal";
import MarketplaceInstaller from "./MarketplaceInstaller";

/**
 * Engineering Suite — the gated Sovereign Builder hub.
 *
 * License logic: the suite only functions when a valid Enterprise Sovereign Key
 * is detected in session state (`hasSeatLicense`) — admins always pass. Without
 * a seat, a hard SOVEREIGN-DEV-SEAT-1.0 gate is shown and no tooling renders.
 */
export default function EngineeringSuiteTab({ isAdmin, hasSeatLicense }) {
  const licensed = isAdmin || hasSeatLicense;
  const [keys, setKeys] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [patchOpen, setPatchOpen] = useState(false);

  const loadKeys = useCallback(async () => {
    const rows = await base44.entities.EnterpriseKey.list("-created_date", 100).catch(() => []);
    setKeys(rows);
  }, []);

  useEffect(() => {
    if (!licensed) { setLoading(false); return; }
    (async () => {
      await Promise.all([
        loadKeys(),
        base44.entities.Component.filter({ status: "published" }).then(setComponents).catch(() => {}),
      ]);
      setLoading(false);
    })();
  }, [licensed, loadKeys]);

  // Fix-Only components — those that patch/shim without a redeploy (X1 profiles).
  const fixComponents = components.filter((c) => c.type === "X1");

  if (!licensed) {
    return (
      <div className="rounded-2xl border p-10 text-center" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(200,169,91,0.12)", border: "1px solid rgba(200,169,91,0.3)" }}>
          <Lock className="w-6 h-6 text-[#C8A95B]" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C8A95B] mb-1">SOVEREIGN-DEV-SEAT-1.0</p>
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>The Engineering Suite is seat-gated</h3>
        <p className="text-sm text-white/50 max-w-md mx-auto">This hub requires a valid Enterprise Sovereign Key in your session. Add a Builder Seat ($4,999/mo per engineer) from your Sovereign subscription to unlock the Key Orchestrator, Knowledge Repository, and Marketplace Installer.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#C8A95B]/60" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* License banner */}
      <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5" style={{ borderColor: "#C8A95B33", background: "rgba(200,169,91,0.06)" }}>
        <ShieldCheck className="w-4 h-4 text-[#E6C878]" />
        <span className="text-xs text-white/70">Enterprise Sovereign Key detected — <span className="font-bold text-[#E6C878]">SOVEREIGN-KEY-MANAGER-1.0</span> active.</span>
      </div>

      <SovereignGuideRepo />

      {/* Key-to-Key Orchestrator */}
      <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-[#C8A95B]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Key-to-Key Orchestrator</h3>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => setCreateOpen(true)} className="text-xs font-bold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>
              <Plus className="w-3.5 h-3.5" /> Create New Key
            </Button>
            <Button size="sm" onClick={() => setPatchOpen(true)} variant="outline" className="text-xs border-[#5BA2FF]/40 text-[#5BA2FF] bg-transparent hover:bg-[#5BA2FF]/10">
              <Wrench className="w-3.5 h-3.5" /> Patch Key
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/45 mb-4">Department- and client-scoped API keys. All creation & patch events are logged to the Enterprise Admin audit trail and surfaced to BOB / The Upkeeper.</p>

        {keys.length === 0 ? (
          <p className="text-sm text-white/40 py-6 text-center">No enterprise keys yet — create your first department or client key.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2">
                  {k.scope === "client" ? <User className="w-4 h-4 text-[#C8A95B]" /> : <Building2 className="w-4 h-4 text-[#C8A95B]" />}
                  <p className="text-sm font-bold text-white">{k.label}</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: "rgba(200,169,91,0.12)", color: "#E6C878" }}>{k.scope}</span>
                  <span className="ml-auto text-[10px] font-mono text-white/35">{k.key_prefix}••{k.key_last4}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-white/45">
                  <span className="flex items-center gap-1"><Boxes className="w-3 h-3" /> {(k.installed_components || []).length} installed</span>
                  <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> {(k.patches || []).length} patches</span>
                  <span className={k.status === "active" ? "text-emerald-400" : "text-red-400"}>{k.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MarketplaceInstaller components={components} keys={keys} onInstalled={loadKeys} />

      <CreateKeyModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadKeys} />
      <PatchKeyModal open={patchOpen} onClose={() => setPatchOpen(false)} keys={keys} fixComponents={fixComponents} onPatched={loadKeys} />
    </div>
  );
}