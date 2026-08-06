import React, { useState } from "react";
import { ShieldCheck, Download, Loader2, AlertTriangle, CheckCircle2, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * Admin tab for the SOV-AQUILLA-ADMIN-WRAPPER-X5-1.0 download pipeline.
 *
 * The Download button invokes the `execute_aquilla_download` backend function,
 * which runs the Sentinel (X4) 100 functional checks first. Only if the Sentinel
 * passes does the function return the wrapped binary (AQUILLA-SAFEGUARD-SHIELD-1.0
 * + BLACKSTONE-DISCLAIMER-SHIELD-1.0) for the admin to save.
 */
export default function AquillaDownloadTab() {
  const [status, setStatus] = useState("idle"); // idle | running | passed | failed
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setStatus("running");
    setError(null);
    setReport(null);
    try {
      const response = await base44.functions.invoke("execute_aquilla_download", {});
      const blob = await response.data;
      const contentType = response.headers?.["content-type"] || "";

      // If the function returned a validation failure (422), it's JSON, not a file.
      if (contentType.includes("application/json") && blob?.status === "validation_failed") {
        setStatus("failed");
        setReport(blob);
        return;
      }

      // Success — the response body is the wrapped binary file content.
      const jsonString = typeof blob === "string" ? blob : JSON.stringify(blob, null, 2);
      const fileBlob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SOV-AQUILLA-ADMIN-WRAPPER-X5-1.0-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("passed");
    } catch (e) {
      setStatus("failed");
      setError(e.message || "Download failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-violet-200 bg-violet-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-violet-600" />
            SOV-AQUILLA-ADMIN-WRAPPER-X5-1.0
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 text-xs text-slate-600">
            <p><strong className="text-slate-800">Artifact:</strong> SOV-AQUILLA-ADMIN-WRAPPER-X5-1.0 (X5 Complete Agent)</p>
            <p><strong className="text-slate-800">Validation:</strong> SOV-AQUILLA-VALIDATION-SENTINEL-X4-1.0 (100 Functional Checks)</p>
            <p><strong className="text-slate-800">Shields:</strong> AQUILLA-SAFEGUARD-SHIELD-1.0 + BLACKSTONE-DISCLAIMER-SHIELD-1.0</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Download Pipeline</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${status === "running" ? "bg-amber-500 text-white animate-pulse" : status === "passed" || status === "failed" ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-400"}`}>1</span>
              <span>Sentinel (X4) runs 100 functional checks</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${status === "passed" ? "bg-emerald-600 text-white" : status === "failed" ? "bg-red-500 text-white" : "bg-slate-200 text-slate-400"}`}>2</span>
              <span>Pass/fail binary + sentinel seal hash verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${status === "passed" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}>3</span>
              <span>Binary wrapped with Safeguard + Blackstone shields</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${status === "passed" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}>4</span>
              <span>Save wrapped binary to disk</span>
            </div>
          </div>

          {status === "failed" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-800">Sentinel Validation Failed — Download Blocked</p>
              </div>
              {report ? (
                <div className="text-[11px] text-red-700 space-y-1">
                  <p>{report.message}</p>
                  <p>Checks passed: {report.report?.checks_passed ?? "—"}/{report.report?.checks_total ?? 100}</p>
                  {report.report?.failed_checks?.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 mt-1">
                      {report.report.failed_checks.slice(0, 5).map((c, i) => (
                        <li key={i}>Check #{c.check_id}: {c.check_name} — {c.reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-red-700">{error}</p>
              )}
            </div>
          )}

          {status === "passed" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs font-semibold text-emerald-800">All 100 checks passed — wrapped binary saved to your downloads.</p>
            </div>
          )}

          <Button
            onClick={handleDownload}
            disabled={status === "running"}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {status === "running" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Running Sentinel (X4) checks…</>
            ) : status === "passed" ? (
              <><FileDown className="w-4 h-4" /> Download Again</>
            ) : (
              <><Download className="w-4 h-4" /> Download Aquilla Binary</>
            )}
          </Button>

          <p className="text-[10px] text-slate-400 text-center">
            The Sentinel performs 100 functional checks before the binary is released. If any check fails, the download is blocked and the binary is not wrapped.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}