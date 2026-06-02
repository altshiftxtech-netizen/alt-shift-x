import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ScanSearch, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SecretLeakScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await base44.functions.invoke("scanFrontendSecrets", { url: window.location.origin });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Scan failed. Try again from the published app URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanSearch className="w-4 h-4 text-slate-700" />
            <p className="text-sm font-bold text-slate-900">Frontend Secret Leak Scan</p>
          </div>
          <p className="text-xs text-slate-500 max-w-md">Scans the live frontend bundle for accidentally hardcoded API keys, secrets, or passwords. Run after every deploy.</p>
        </div>
        <Button className="text-sm h-9 gap-2" disabled={loading} onClick={handleScan}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
          {loading ? "Scanning…" : "Run Scan"}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive mt-3">{error}</p>}

      {result && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${result.clean ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-2 font-semibold">
            {result.clean
              ? <><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-emerald-800">{result.message}</span></>
              : <><AlertTriangle className="w-4 h-4 text-red-600" /><span className="text-red-800">{result.message}</span></>}
          </div>
          <p className="text-xs text-slate-500 mt-1">Scanned {result.scanned_files} script file(s).</p>
          {!result.clean && (
            <ul className="mt-2 space-y-1">
              {result.findings.map((f, i) => (
                <li key={i} className="text-xs text-red-700 font-mono">{f.type} in {f.file} — {f.sample}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}