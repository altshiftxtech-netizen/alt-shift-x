import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, Loader2,
  RefreshCw, Lock, Eye, TrendingUp, Award, XCircle
} from "lucide-react";
import AutoCertifyPanel from "@/components/governance/AutoCertifyPanel";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const CERT_COLORS = {
  certified: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  uncertified: "bg-slate-100 text-slate-500 border-slate-200",
  revoked: "bg-red-100 text-red-700 border-red-200",
};

const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
  info: "bg-slate-100 text-slate-500",
};

function ScoreRing({ score, label, size = 80 }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: score, fill: color }]} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-slate-900">{score}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 text-center leading-tight">{label}</p>
    </div>
  );
}

export default function GovernanceDashboard() {
  const [scores, setScores] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [auditing, setAuditing] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.GovernanceScore.list("-last_audited_at", 100),
      base44.entities.Component.filter({ status: "published" }),
    ]).then(([sc, comps]) => {
      setScores(sc);
      setComponents(comps);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAudit = async (componentId) => {
    setAuditing(componentId);
    const res = await base44.functions.invoke("evaluateGovernance", { component_id: componentId });
    if (res.data?.overall_score !== undefined) {
      setScores(prev => {
        const existing = prev.findIndex(s => s.component_id === componentId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...prev[existing], ...res.data };
          return updated;
        }
        return [res.data, ...prev];
      });
      setSelected(res.data);
    }
    setAuditing(null);
  };

  const uncoveredComponents = components.filter(c => !scores.find(s => s.component_id === c.id));
  const avgScore = scores.length ? Math.round(scores.reduce((s, g) => s + g.overall_score, 0) / scores.length) : 0;
  const certifiedCount = scores.filter(s => s.certification_status === "certified").length;

  const handleAutoCertifyComplete = (results) => {
    base44.entities.GovernanceScore.list("-last_audited_at", 100).then(sc => setScores(sc));
    base44.entities.Component.filter({ status: "published" }).then(comps => setComponents(comps));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="builder" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> AI Governance & Compliance
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Automated scoring across AI safety, data compliance, audit trail, and version stability.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Avg Governance Score", value: `${avgScore}/100`, icon: TrendingUp, color: "text-violet-600" },
            { label: "Certified Components", value: certifiedCount, icon: Award, color: "text-emerald-600" },
            { label: "Pending Audit", value: uncoveredComponents.length, icon: Clock, color: "text-amber-600" },
            { label: "Coverage", value: `${components.length ? Math.round((scores.length / components.length) * 100) : 0}%`, icon: Eye, color: "text-blue-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auto-certify panel */}
        <AutoCertifyPanel components={components} scores={scores} onComplete={handleAutoCertifyComplete} />

        <div className="grid md:grid-cols-5 gap-6">
          {/* Component list */}
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Components</p>

            {/* Unaudited */}
            {uncoveredComponents.map(c => (
              <div key={c.id} className="bg-white border border-dashed border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">{c.name}</p>
                  <p className="text-[10px] text-slate-400">Not yet audited</p>
                </div>
                <Button onClick={() => handleAudit(c.id)} disabled={auditing === c.id} size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5">
                  {auditing === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  Audit
                </Button>
              </div>
            ))}

            {/* Audited */}
            {scores.map(sc => (
              <button key={sc.id} onClick={() => setSelected(sc)}
                className={`w-full text-left bg-white border rounded-xl px-4 py-3 hover:border-violet-300 transition-all ${selected?.id === sc.id ? "border-violet-500 shadow-sm" : "border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{sc.component_name}</p>
                    <p className="text-[10px] text-slate-400">Last audited: {sc.last_audited_at ? new Date(sc.last_audited_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${CERT_COLORS[sc.certification_status] || CERT_COLORS.uncertified}`}>
                      {sc.certification_status}
                    </span>
                    <span className={`text-sm font-black ${sc.overall_score >= 85 ? "text-emerald-600" : sc.overall_score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                      {sc.overall_score}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="md:col-span-3">
            {selected ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-black text-slate-900">{selected.component_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${CERT_COLORS[selected.certification_status]}`}>
                        {selected.certification_status === "certified" && <Award className="w-3 h-3 inline mr-1" />}
                        {selected.certification_status}
                      </span>
                      <Button onClick={() => handleAudit(selected.component_id)} disabled={!!auditing} variant="outline" size="sm" className="text-xs gap-1.5">
                        {auditing === selected.component_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Re-audit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score rings */}
                  <div className="flex items-center justify-around flex-wrap gap-4 py-2">
                    <ScoreRing score={selected.ai_safety_score || 0} label="AI Safety" />
                    <ScoreRing score={selected.data_compliance_score || 0} label="Data Compliance" />
                    <ScoreRing score={selected.audit_trail_score || 0} label="Audit Trail" />
                    <ScoreRing score={selected.version_stability_score || 0} label="Version Stability" />
                    <ScoreRing score={selected.pii_handling_score || 0} label="PII Handling" />
                  </div>

                  {/* Certified frameworks */}
                  {(selected.frameworks_certified || []).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1"><Lock className="w-3.5 h-3.5" />Certified Frameworks</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.frameworks_certified.map(f => (
                          <span key={f} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />{f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk flags */}
                  {(selected.risk_flags || []).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />Risk Flags</p>
                      <div className="space-y-2">
                        {selected.risk_flags.map((flag, i) => (
                          <div key={i} className={`rounded-xl px-3 py-2.5 ${SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.info}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase tracking-wide">{flag.severity}</span>
                              <span className="text-xs font-bold">{flag.flag}</span>
                            </div>
                            <p className="text-[10px] leading-relaxed">{flag.description}</p>
                            {flag.remediation && (
                              <p className="text-[10px] mt-1 opacity-80 italic">→ {flag.remediation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400">Audited by {selected.auditor} · Next due: {selected.next_audit_due || "—"}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 gap-3">
                <ShieldCheck className="w-12 h-12 opacity-20" />
                <p className="text-sm">Select a component to view governance details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}