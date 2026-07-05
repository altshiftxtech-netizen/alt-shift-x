import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FlaskConical, Loader2, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

/**
 * Developer-only Forensic Simulator — runs a test download against any component
 * through the AGENT-TAMPER-EVIDENCE-1.0 "Full Gate". Returns true (Integrity
 * Verified) iff all hashes, seals, and metadata match GSP-MASTER-INDEX-1.0.
 */
export default function ForensicSimulator() {
  const [components, setComponents] = useState([]);
  const [selected, setSelected] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [tamper, setTamper] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Component.list("-created_date", 100).catch(() => []);
      setComponents(list || []);
      if (list?.[0]) setSelected(list[0].id);
    })();
  }, []);

  // Build the deterministic doctrine package for a component. When `tampered`,
  // an extra byte is injected so the live SHA-256 diverges from the certified
  // Master Index hash — proving the bit-for-bit comparison catches modifications.
  const buildPackage = (comp, tampered) => {
    const metadata = {
      code: comp?.code, name: comp?.name, type: comp?.type,
      schema: comp?.schema || [], features: comp?.features || [],
    };
    const packageStr = JSON.stringify(tampered ? { ...metadata, _tampered: Date.now() } : metadata);
    return { metadata, b64: btoa(unescape(encodeURIComponent(packageStr))) };
  };

  const invokeGate = async (registerMaster) => {
    setRunning(true);
    setResult(null);
    const comp = components.find((c) => c.id === selected);
    const { metadata, b64 } = buildPackage(comp, tamper && !registerMaster);
    try {
      const res = await base44.functions.invoke("forensicGate", {
        base64: b64,
        export_kind: registerMaster ? "master_registration" : "simulation",
        target_ref: comp?.code || comp?.id,
        component_code: comp?.code,
        file_name: `${comp?.code || "component"}.sim.json`,
        metadata_snapshot: metadata,
        simulate: !registerMaster,
        register_master: !!registerMaster,
      });
      setResult(res?.data || null);
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(false);
  };

  const run = () => invokeGate(false);
  const registerMaster = () => invokeGate(true);

  return (
    <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#5BA2FF33" }}>
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical className="w-5 h-5 text-[#5BA2FF]" />
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Forensic Simulator</h3>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.3em] text-[#5BA2FF]">Full Gate Test</span>
      </div>
      <p className="text-xs text-white/45 mb-5">Run a simulated download against any component through the AGENT-TAMPER-EVIDENCE-1.0 gate. Returns Integrity Verified only if all hashes, seals, and metadata match GSP-MASTER-INDEX-1.0.</p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-white/70 mb-1.5 block">Target component</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/15 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5BA2FF]/40"
          >
            {components.map((c) => <option key={c.id} value={c.id} className="bg-[#0a0c12]">{c.code || c.name}</option>)}
            {components.length === 0 && <option>No components available</option>}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
          <input type="checkbox" checked={tamper} onChange={(e) => setTamper(e.target.checked)} className="accent-[#5BA2FF]" />
          Inject tamper (modify the package so its live hash diverges from the Master Index)
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={run} disabled={running || !selected} className="bg-[#5BA2FF] hover:bg-[#4a90ee] text-black font-bold text-sm h-9 gap-2">
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Full Gate…</> : "Run Full Gate Simulation"}
          </Button>
          <Button onClick={registerMaster} disabled={running || !selected} variant="outline" className="border-[#C8A95B]/50 text-[#E6C878] hover:bg-[#C8A95B]/10 text-sm h-9 gap-2">
            Register as Master Version
          </Button>
        </div>
        <p className="text-[10px] text-white/35">Register writes the certified hash + seal into GSP-MASTER-INDEX-1.0 the first time. Later simulations compare Live_Hash === Master_Index_Hash.</p>
      </div>

      {result && (
        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: result.verified ? "#10B98155" : "#EF444455", background: result.verified ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)" }}>
          {result.error ? (
            <p className="text-sm text-red-300 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> {result.error}</p>
          ) : (
            <>
              <p className={`text-sm font-bold flex items-center gap-2 ${result.verified ? "text-emerald-300" : "text-red-300"}`}>
                {result.verified ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {result.master_registered
                  ? "Master Version Registered — certified"
                  : result.verified ? "Integrity Verified — true" : "Integrity FAILED — false"}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold" style={{ color: result.master_registered ? "#E6C878" : result.master_indexed ? (result.master_matched ? "#6ee7b7" : "#fca5a5") : "#94a3b8" }}>
                {result.master_registered
                  ? "Written to GSP-MASTER-INDEX-1.0"
                  : result.master_indexed
                    ? (result.master_matched ? "Live_Hash === Master_Index_Hash ✓ bit-for-bit identical" : "Live_Hash ≠ Master_Index_Hash — modified since certification")
                    : "No Master Index entry yet — register this component as a Master Version"}
              </p>
              <div className="mt-3 space-y-1 text-[11px] text-white/60 font-mono break-all">
                <p>size: {result.file_size} bytes</p>
                <p>canon_doctrine_hash: {result.canon_doctrine_hash || result.sha256}</p>
                <p>seal: {result.integrity_seal_id}</p>
                <p>status: {result.verification_status}</p>
                {result.flags?.length > 0 && <p className="text-red-300">flags: {result.flags.join(", ")}</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}