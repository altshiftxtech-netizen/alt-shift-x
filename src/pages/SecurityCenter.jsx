import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, AlertTriangle, Ban, Mail, Activity } from "lucide-react";
import IncidentRow from "@/components/security/IncidentRow";
import SecretLeakScanner from "@/components/security/SecretLeakScanner";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function SecurityCenter() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [authorized, setAuthorized] = useState(null);

  const load = async () => {
    const data = await base44.entities.SecurityIncident.list("-created_date", 200);
    setIncidents(data || []);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <Ban className="w-10 h-10 text-red-500" />
        <h1 className="text-xl font-bold text-slate-900">Admin Access Only</h1>
        <p className="text-sm text-slate-500">The Security Center is restricted to administrators.</p>
      </div>
    );
  }

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === "critical").length,
    blocked: incidents.filter(i => i.blocked).length,
    emailed: incidents.filter(i => i.email_sent).length
  };

  const filtered = filter === "all" ? incidents : incidents.filter(i => i.severity === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-slate-900" />
          <h1 className="text-2xl font-bold text-slate-900">Security Center</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">Sentinel threat detection — logged incidents with forensic metadata for law enforcement.</p>

        <SecretLeakScanner />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Activity} label="Total Incidents" value={stats.total} color="bg-slate-100 text-slate-700" />
          <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} color="bg-red-100 text-red-700" />
          <StatCard icon={Ban} label="Blocked" value={stats.blocked} color="bg-emerald-100 text-emerald-700" />
          <StatCard icon={Mail} label="Admin Alerts Sent" value={stats.emailed} color="bg-blue-100 text-blue-700" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          {["all", "critical", "high", "medium", "low"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">No threats detected</p>
            <p className="text-sm text-slate-500">The Sentinel is active and watching.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(i => <IncidentRow key={i.id} incident={i} onUpdated={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}