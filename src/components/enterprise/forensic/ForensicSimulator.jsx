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

  const run = async () => {
    setRunning(true);
    setResult(null);
    const comp = components.find((c) => c.id === selected);
    // Build a deterministic package for the component and pass it through the gate.
    const metadata = {
      code: comp?.code, name: comp?.name, type: comp?.type,
      schema: comp?.schema || [], features: comp?.features || [],
    };
    const packageStr = JSON.stringify({ ...metadata, _sim: true });
    const b64 = btoa(unescape(encodeURIComponent(packageStr)));
    try {
      const res = await base44.functions.invoke("forensicGate", {
        base64: b64,
        export_kind: "simulation",
        target_ref: comp?.code || comp?.id,
        file_name: `${comp?.code || "component"}.sim.json`,
        metadata_snapshot: metadata,
        simulate: true,
        // Tamper toggle: feed a wrong expected hash so the gate must fail.
        expected_sha256: tamper ? "0000000000000000000000000000000000000000000000000000000000000000" : null,
      });
      setResult(res?.data || null);
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(false);
  };

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
          Inject tamper (force a hash mismatch to test gate failure)
        </label>

        <Button onClick={run} disabled={running || !selected} className="bg-[#5BA2FF] hover:bg-[#4a90ee] text-black font-bold text-sm h-9 gap-2">
          {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Full Gate…</> : "Run Full Gate Simulation"}
        </Button>
      </div>

      {result && (
        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: result.verified ? "#10B98155" : "#EF444455", background: result.verified ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)" }}>
          {result.error ? (
            <p className="text-sm text-red-300 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> {result.error}</p>
          ) : (
            <>
              <p className={`text-sm font-bold flex items-center gap-2 ${result.verified ? "text-emerald-300" : "text-red-300"}`}>
                {result.verified ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {result.verified ? "Integrity Verified — true" : "Integrity FAILED — false"}
              </p>
              <div className="mt-3 space-y-1 text-[11px] text-white/60 font-mono break-all">
                <p>size: {result.file_size} bytes</p>
                <p>sha256: {result.sha256}</p>
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