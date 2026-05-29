import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export default function AutoCertifyPanel({ components, scores, onComplete }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [done, setDone] = useState(false);

  const unaudited = components.filter(c => !scores.find(s => s.component_id === c.id));
  const needsReaudit = scores.filter(s => {
    const ageMs = s.last_audited_at ? Date.now() - new Date(s.last_audited_at).getTime() : Infinity;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays > 30 || s.certification_status === "uncertified";
  });

  const toProcess = [
    ...unaudited.map(c => ({ id: c.id, name: c.name, reason: "Not yet audited" })),
    ...needsReaudit.map(s => ({ id: s.component_id, name: s.component_name, reason: s.certification_status === "uncertified" ? "Uncertified" : "Audit expired (>30d)" })),
  ].filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i); // dedupe

  const handleRunAll = async () => {
    if (!toProcess.length) return;
    setRunning(true);
    setDone(false);
    setProgress([]);

    const results = [];
    for (const item of toProcess) {
      setProgress(prev => [...prev, { ...item, status: "running" }]);
      const res = await base44.functions.invoke("evaluateGovernance", { component_id: item.id });
      const ok = res.data?.overall_score !== undefined;
      setProgress(prev => prev.map(p => p.id === item.id ? { ...p, status: ok ? "done" : "error", score: res.data?.overall_score, cert: res.data?.certification_status } : p));
      results.push({ ...item, ...res.data });
    }

    setRunning(false);
    setDone(true);
    if (onComplete) onComplete(results);
  };

  if (!toProcess.length) return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      <p className="text-sm text-emerald-800 font-semibold">All components are certified and up-to-date. No action needed.</p>
    </div>
  );

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-violet-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" /> Auto-Certify All Components
          </p>
          <p className="text-xs text-violet-700 mt-0.5">{toProcess.length} component{toProcess.length !== 1 ? "s" : ""} need governance certification.</p>
        </div>
        <Button onClick={handleRunAll} disabled={running} className="bg-violet-600 hover:bg-violet-700 gap-2 text-sm">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {running ? "Auditing…" : "Run All Audits"}
        </Button>
      </div>

      {/* Queue */}
      <div className="space-y-1.5">
        {toProcess.map(item => {
          const prog = progress.find(p => p.id === item.id);
          return (
            <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-violet-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.reason}</p>
              </div>
              <div className="text-[10px] font-bold">
                {!prog && <span className="text-slate-400">Queued</span>}
                {prog?.status === "running" && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />}
                {prog?.status === "done" && (
                  <span className={`flex items-center gap-1 ${prog.score >= 85 ? "text-emerald-700" : prog.score >= 70 ? "text-amber-700" : "text-red-700"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {prog.score}/100 · {prog.cert}
                  </span>
                )}
                {prog?.status === "error" && <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />Failed</span>}
              </div>
            </div>
          );
        })}
      </div>

      {done && (
        <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> All governance audits complete. Scores updated.
        </p>
      )}
    </div>
  );
}