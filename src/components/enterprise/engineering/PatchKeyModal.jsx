import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Wrench, Loader2 } from "lucide-react";

/**
 * Patch Key — shim a Fix-Only component into an existing enterprise key without
 * a full redeploy. `fixComponents` is the list of Fix-Only components; `keys`
 * are the engineer's enterprise keys.
 */
export default function PatchKeyModal({ open, onClose, keys, fixComponents, onPatched }) {
  const [keyId, setKeyId] = useState("");
  const [componentId, setComponentId] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const close = () => { setKeyId(""); setComponentId(""); setNote(""); setError(""); onClose(); };

  const submit = async () => {
    if (!keyId || !componentId) { setError("Select a key and a Fix-Only component."); return; }
    const comp = fixComponents.find((c) => c.id === componentId);
    setBusy(true); setError("");
    try {
      const res = await base44.functions.invoke("enterpriseKeyOps", {
        action: "patch", keyId, component_id: componentId,
        component_code: comp?.code, component_name: comp?.name, note: note.trim(),
      });
      if (res.data?.ok) { onPatched?.(); close(); }
      else setError(res.data?.error || "Could not apply patch.");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not apply patch.");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md rounded-2xl border p-6" style={{ background: "#0a0c12", borderColor: "#5BA2FF33" }}>
        <button onClick={close} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-5 h-5 text-[#5BA2FF]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Patch Key</h3>
        </div>
        <p className="text-xs text-white/45 mb-4">Shim a Fix-Only component into a live key — no full redeploy.</p>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Target Key</label>
            <select value={keyId} onChange={(e) => setKeyId(e.target.value)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 text-white text-sm px-3 py-2 focus:outline-none">
              <option value="" className="bg-[#0a0c12]">Select a key…</option>
              {keys.map((k) => <option key={k.id} value={k.id} className="bg-[#0a0c12]">{k.label} ({k.key_prefix}••{k.key_last4})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Fix-Only Component</label>
            <select value={componentId} onChange={(e) => setComponentId(e.target.value)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 text-white text-sm px-3 py-2 focus:outline-none">
              <option value="" className="bg-[#0a0c12]">Select a component…</option>
              {fixComponents.map((c) => <option key={c.id} value={c.id} className="bg-[#0a0c12]">{c.name} ({c.code})</option>)}
            </select>
            {fixComponents.length === 0 && <p className="text-[11px] text-white/35 mt-1">No Fix-Only components available yet.</p>}
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Shim Note (optional)</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. hotfix for latency regression" className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white/30" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button onClick={submit} disabled={busy} className="w-full font-bold text-white" style={{ background: "linear-gradient(90deg,#5BA2FF,#3B82F6)" }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Patch Shim"}
          </Button>
        </div>
      </div>
    </div>
  );
}