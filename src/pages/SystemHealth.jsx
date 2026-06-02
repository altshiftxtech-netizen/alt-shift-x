import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Loader2, Ban, CheckCircle2, AlertTriangle, XCircle, Wrench, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STYLES = {
  healthy: { label: "Healthy", cls: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 },
  degraded: { label: "Degraded", cls: "bg-amber-100 text-amber-700", Icon: AlertTriangle },
  critical: { label: "Critical", cls: "bg-red-100 text-red-700", Icon: XCircle },
};

const CHECK_ICON = {
  pass: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  warn: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  fail: <XCircle className="w-4 h-4 text-red-600" />,
};

function ListBlock({ title, items, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <p className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${color}`}>{title}</p>
      <ul className="space-y-1">
        {items.map((x, i) => (
          <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400">•</span>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportCard({ r }) {
  const s = STATUS_STYLES[r.overall_status] || STATUS_STYLES.healthy;
  const date = new Date(r.run_date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <s.Icon className={`w-5 h-5 ${s.cls.split(" ")[1]}`} />
          <span className="font-semibold text-slate-900">{date}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
      </div>

      <ListBlock title="✅ What's Working" items={r.whats_working} color="text-emerald-700" />
      <ListBlock title="🔧 Auto-Fixed" items={r.fixes_applied} color="text-blue-700" />
      <ListBlock title="⚠️ Needs Attention" items={r.issues_found} color="text-amber-700" />

      {r.checks?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">System Checks</p>
          <div className="space-y-1.5">
            {r.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {CHECK_ICON[c.status]}
                <span className="font-medium text-slate-800">{c.name}:</span>
                <span className="text-slate-500">{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SystemHealth() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(null);
  const [running, setRunning] = useState(false);

  const load = async () => {
    const data = await base44.entities.HealthCheckReport.list("-run_date", 60);
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      await load();
    })();
  }, []);

  const runNow = async () => {
    setRunning(true);
    await base44.functions.invoke("dailyHealthCheck", {}).catch(() => {});
    await load();
    setRunning(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <Ban className="w-10 h-10 text-red-500" />
        <h1 className="text-xl font-bold text-slate-900">Admin Access Only</h1>
        <p className="text-sm text-slate-500">The System Health dashboard is restricted to administrators.</p>
      </div>
    );
  }

  const latest = reports[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-slate-900" />
            <h1 className="text-2xl font-bold text-slate-900">System Health</h1>
          </div>
          <Button onClick={runNow} disabled={running} className="gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {running ? "Running…" : "Run Check Now"}
          </Button>
        </div>
        <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5" /> Self-healing daily watchdog — runs automatically every morning at 9am and emails you a report.
        </p>

        {reports.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">No reports yet</p>
            <p className="text-sm text-slate-500">The first report will appear after the 9am run, or click “Run Check Now”.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {latest && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Latest</p>
                <ReportCard r={latest} />
              </div>
            )}
            {reports.length > 1 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2 mt-6">History</p>
                <div className="space-y-4">
                  {reports.slice(1).map(r => <ReportCard key={r.id} r={r} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}