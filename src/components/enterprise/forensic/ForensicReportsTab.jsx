import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, RefreshCw, AlertTriangle, ShieldCheck, ScrollText } from "lucide-react";
import ForensicSimulator from "./ForensicSimulator";

const FLAG_COLORS = {
  DATA_COLLECTION_RISK: "#F59E0B",
  UNAUTHORIZED_ENVIRONMENT: "#8B5CF6",
  INTEGRITY_COMPROMISED: "#EF4444",
};

/**
 * Admin-only Forensic Reports terminal for /enterprise:
 * - Daily audit reports with anomaly highlights + court-ready PDF export.
 * - Live forensic audit trail of recent exports and their verification status.
 * - Developer-only Forensic Simulator (Full Gate test).
 */
export default function ForensicReportsTab({ isAdmin }) {
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState("");
  const [sweeping, setSweeping] = useState(false);

  const load = async () => {
    setLoading(true);
    const [r, l] = await Promise.all([
      base44.entities.ForensicAuditReport.list("-report_date", 30).catch(() => []),
      base44.entities.ForensicAuditLog.list("-exported_at", 40).catch(() => []),
    ]);
    setReports(r || []);
    setLogs(l || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const runSweep = async () => {
    setSweeping(true);
    await base44.functions.invoke("dailyForensicAudit", {}).catch(() => {});
    await load();
    setSweeping(false);
  };

  const downloadPdf = async (report_date) => {
    setPdfBusy(report_date);
    try {
      const res = await base44.functions.invoke("forensicReportPdf", { report_date });
      if (res?.data?.url) window.open(res.data.url, "_blank");
    } catch { /* noop */ }
    setPdfBusy("");
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border p-10 text-center" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <ScrollText className="w-8 h-8 mx-auto text-white/30 mb-3" />
        <p className="text-sm text-white/50">Forensic Reports are restricted to Sovereign administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily reports */}
      <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-[#E6C878]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Daily Audit Reports</h3>
          <Button size="sm" variant="outline" onClick={runSweep} disabled={sweeping} className="ml-auto text-xs border-white/15 text-white/80 bg-transparent hover:bg-white/10 gap-1.5">
            {sweeping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Run Sweep Now
          </Button>
        </div>
        <p className="text-xs text-white/45 mb-5">Court-ready reports (EXPERTMINDS-REPORT-TEMPLATE-1.0). Automated sweep runs daily at 00:00 UTC.</p>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div>
        ) : reports.length === 0 ? (
          <p className="text-sm text-white/40 py-4">No reports yet. Run a sweep to generate one.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{r.report_date}</p>
                  <p className="text-[11px] text-white/45">
                    {r.total_exports || 0} exports · {r.verified_count || 0} verified · {" "}
                    <span className={r.anomaly_count ? "text-red-300 font-semibold" : ""}>{r.anomaly_count || 0} anomalies</span>
                  </p>
                </div>
                {r.anomaly_count > 0 && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <Button size="sm" onClick={() => downloadPdf(r.report_date)} disabled={pdfBusy === r.report_date} className="text-xs bg-[#C8A95B] hover:bg-[#b8974a] text-black font-bold gap-1.5 shrink-0">
                  {pdfBusy === r.report_date ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live audit trail */}
      <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Live Audit Trail</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-white/40 py-2">No exports logged yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/80 font-semibold">{l.export_kind}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${l.verification_status === "verified" ? "bg-emerald-500/15 text-emerald-300" : l.verification_status === "compromised" ? "bg-red-500/15 text-red-300" : "bg-white/10 text-white/50"}`}>{l.verification_status}</span>
                  {l.simulated && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#5BA2FF]/15 text-[#5BA2FF]">SIM</span>}
                  <span className="text-white/35 ml-auto">{l.exported_at ? new Date(l.exported_at).toISOString().replace("T", " ").slice(0, 19) + "Z" : ""}</span>
                </div>
                <p className="text-white/45 mt-1">{l.downloader_email || l.downloader_id} · {l.file_size || 0} bytes</p>
                <p className="text-white/30 font-mono break-all mt-0.5">seal {l.integrity_seal_id || "—"}</p>
                {(l.flags || []).length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {l.flags.map((f) => <span key={f} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${FLAG_COLORS[f] || "#888"}22`, color: FLAG_COLORS[f] || "#aaa" }}>{f}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Developer-only simulator */}
      <ForensicSimulator />
    </div>
  );
}