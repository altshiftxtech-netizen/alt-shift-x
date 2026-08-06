import React, { useState, useEffect } from "react";
import { ShieldCheck, Download, Loader2, AlertTriangle, CheckCircle2, KeyRound, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

// PM-1A Deployment Payload generator tab.
// Industrial Matte theme: Navy / Platinum / Crimson.
// Renders only for admins. Requires secondary Apex Key verification
// (Sovereign Ledger protocol) before the payload is generated and downloaded.

export default function Pm1aDeploymentTab() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apexKey, setApexKey] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | generating | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then((u) => { setIsAdmin(u?.role === "admin"); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  // Constraint: render only if user.role === 'admin'
  if (!isAdmin) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        Admin access required to generate PM-1A deployment payloads.
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!apexKey.trim()) { setError("Apex Key is required."); return; }
    setStatus("verifying");
    setError(null);
    try {
      // The backend function handles: Apex Key verification → component fetch → payload generation
      const response = await base44.functions.invoke("generatePm1aPayload", {
        apex_key: apexKey.trim(),
      });

      const contentType = response.headers?.["content-type"] || "";
      const data = response.data;

      // If the function returned an error (JSON, not a file download)
      if (contentType.includes("application/json") && data?.error) {
        setStatus("error");
        setError(data.error);
        return;
      }

      // Success — response body is the .pwa payload file content
      const payloadStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      const blob = new Blob([payloadStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PM-1A-DEPLOYMENT-${Date.now()}.pwa`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setError(e.message || "Payload generation failed.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
            <Cpu className="w-4 h-4 text-crimson-500" style={{ color: "#dc2626" }} />
            Patriot Machine 1A — Deployment Payload Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Industrial Matte metadata strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <p className="text-slate-500 uppercase tracking-wide">Artifact</p>
              <p className="text-slate-200 font-mono font-semibold">PM-1A-BOOTSTRAP-1.0</p>
            </div>
            <div className="bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <p className="text-slate-500 uppercase tracking-wide">Endpoint</p>
              <p className="text-slate-200 font-mono font-semibold">PM-1A-MASTER-X5</p>
            </div>
            <div className="bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <p className="text-slate-500 uppercase tracking-wide">Protocol</p>
              <p className="text-slate-200 font-mono font-semibold">Sovereign Ledger</p>
            </div>
            <div className="bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <p className="text-slate-500 uppercase tracking-wide">Type</p>
              <p className="text-slate-200 font-mono font-semibold">X5 Complete Agent</p>
            </div>
          </div>

          {/* Apex Key verification step */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" style={{ color: "#94a3b8" }} />
              <p className="text-xs font-bold text-slate-300">Step 1 — Sovereign Ledger Apex Key Verification</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Secondary verification required before the PM-1A payload is generated. Your Apex Key is verified against the Sovereign Ledger (active Enterprise Keys only).
            </p>
            <input
              type="password"
              value={apexKey}
              onChange={(e) => setApexKey(e.target.value)}
              placeholder="Enter Apex Key (ENT-XXXX-XXXX-XXXX)"
              disabled={status === "verifying" || status === "generating"}
              className="w-full bg-slate-950 text-slate-200 text-sm font-mono px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>

          {/* Pipeline steps */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Payload Pipeline</p>
            {[
              { n: 1, label: "Apex Key verified against Sovereign Ledger" },
              { n: 2, label: "Fetch PM-1A-BOOTSTRAP-1.0 component manifest" },
              { n: 3, label: "Inject builder_id + PM-1A-MASTER-X5 endpoint URL" },
              { n: 4, label: "Bundle PWA manifest + self-healing script + offline bootloader" },
              { n: 5, label: "Download .pwa deployment payload" },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  status === "success" ? "bg-emerald-600 text-white" :
                  status === "error" && step.n === 1 ? "bg-red-500 text-white" :
                  "bg-slate-700 text-slate-400"
                }`}>{step.n}</span>
                {step.label}
              </div>
            ))}
          </div>

          {/* Error state */}
          {status === "error" && (
            <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-300 font-semibold">{error}</p>
            </div>
          )}

          {/* Success state */}
          {status === "success" && (
            <div className="bg-emerald-950/40 border border-emerald-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-300">Payload Generated & Downloaded</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-3 border border-emerald-800/50">
                <p className="text-[11px] font-mono text-emerald-400">
                  Patriot Machine 1A: Setup Complete. Substrate Active.
                </p>
              </div>
              <p className="text-[10px] text-slate-500">
                On first run, the bootstrapper checks for a local 6a21... identity. If absent, it provisions a new substrate automatically.
              </p>
            </div>
          )}

          {/* Action button — Industrial Matte (Navy/Platinum/Crimson) */}
          <Button
            onClick={handleGenerate}
            disabled={!apexKey.trim() || status === "verifying"}
            className="w-full gap-2 border border-slate-500"
            style={{
              backgroundColor: "#1a2332",
              color: "#e2e8f0",
              borderColor: "#64748b",
            }}
          >
            {status === "verifying" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Apex Key…</>
            ) : (
              <><ShieldCheck className="w-4 h-4" style={{ color: "#dc2626" }} /> Generate PM-1A Deployment Payload</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}