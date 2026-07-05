import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, KeyRound, Copy, Check, Loader2 } from "lucide-react";

export default function CreateKeyModal({ open, onClose, onCreated }) {
  const [label, setLabel] = useState("");
  const [scope, setScope] = useState("department");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const reset = () => { setLabel(""); setScope("department"); setError(""); setCreatedKey(null); setCopied(false); };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    if (!label.trim()) { setError("A department or client label is required."); return; }
    setBusy(true); setError("");
    try {
      const res = await base44.functions.invoke("enterpriseKeyOps", { action: "create", label: label.trim(), scope });
      if (res.data?.key) { setCreatedKey(res.data.key); onCreated?.(); }
      else setError(res.data?.error || "Could not create key.");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not create key.");
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md rounded-2xl border p-6" style={{ background: "#0a0c12", borderColor: "#C8A95B33" }}>
        <button onClick={close} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-[#C8A95B]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Create New Key</h3>
        </div>

        {createdKey ? (
          <div>
            <p className="text-xs text-white/55 mb-3">Store this enterprise key now — it won't be shown again.</p>
            <div className="rounded-xl border border-[#C8A95B]/30 bg-black/40 p-3 flex items-center gap-2">
              <code className="text-xs text-[#E6C878] break-all flex-1">{createdKey}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(createdKey); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="text-white/60 hover:text-white shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={close} className="w-full mt-4 font-bold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Department / Client Label</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Acme Corp — Prod" className="mt-1 bg-white/5 border-white/15 text-white placeholder:text-white/30" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Scope</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["department", "client"].map((s) => (
                  <button key={s} onClick={() => setScope(s)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${scope === s ? "border-[#C8A95B] text-[#E6C878] bg-[#C8A95B]/10" : "border-white/15 text-white/50 hover:text-white/80"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button onClick={submit} disabled={busy} className="w-full font-bold text-[#0A0A0C]" style={{ background: "linear-gradient(90deg,#E6C878,#C8A95B)" }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Key"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}