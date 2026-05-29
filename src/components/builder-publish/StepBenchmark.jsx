import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function StepBenchmark({ form, onChange, onNext, onBack }) {
  const valid = form.cycleTimeTarget && form.errorRateTarget && form.benchmarkDocCount && form.benchmarkAccuracy;
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader><CardTitle className="text-base font-semibold text-slate-800">Step 2 — Benchmark Declaration</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            These figures become your public SLA and are used by the Trust Engine to calculate your Performance score. Declare conservatively — you must meet these targets consistently to maintain Certified tier.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Cycle Time Target (ms) *</label>
            <input type="number" value={form.cycleTimeTarget} onChange={e => onChange({ cycleTimeTarget: e.target.value })}
              placeholder="e.g. 1000"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
            <p className="text-[10px] text-slate-400 mt-0.5">Max end-to-end extraction time</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Error Rate Target (%) *</label>
            <input type="number" step="0.1" value={form.errorRateTarget} onChange={e => onChange({ errorRateTarget: e.target.value })}
              placeholder="e.g. 1.0"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
            <p className="text-[10px] text-slate-400 mt-0.5">Max acceptable error rate</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Benchmark Document Count *</label>
            <input type="number" value={form.benchmarkDocCount} onChange={e => onChange({ benchmarkDocCount: e.target.value })}
              placeholder="e.g. 250"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
            <p className="text-[10px] text-slate-400 mt-0.5">How many docs you tested against</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Declared Accuracy (%) *</label>
            <input type="number" step="0.1" value={form.benchmarkAccuracy} onChange={e => onChange({ benchmarkAccuracy: e.target.value })}
              placeholder="e.g. 97.4"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
            <p className="text-[10px] text-slate-400 mt-0.5">Field extraction accuracy on your test set</p>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>← Back</Button>
          <Button onClick={onNext} disabled={!valid} className="bg-violet-700 hover:bg-violet-800 text-white">
            Next: Compliance Checklist →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}