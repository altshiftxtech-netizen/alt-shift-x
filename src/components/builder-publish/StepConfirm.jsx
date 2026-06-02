import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function StepConfirm({ form, onSubmit, onBack }) {
  const rows = [
    ["Name (slug)", form.name],
    ["Display Name", form.displayName],
    ["Type", form.type],
    ["Category", form.category],
    ["Version", form.version],
    ["Cycle Time Target", `${form.cycleTimeTarget}ms`],
    ["Error Rate Target", `${form.errorRateTarget}%`],
    ["Benchmark Docs", form.benchmarkDocCount],
    ["Declared Accuracy", `${form.benchmarkAccuracy}%`],
  ];

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader><CardTitle className="text-base font-semibold text-slate-800">Step 4 — Review & Submit</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
          {rows.map(([label, val]) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-semibold text-slate-800">{val}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1">Description</p>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{form.description}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700">All 8 compliance checks passed. You're ready to submit.</p>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>← Back</Button>
          <Button onClick={onSubmit} className="bg-violet-700 hover:bg-violet-800 text-white px-8">
            Ship →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}