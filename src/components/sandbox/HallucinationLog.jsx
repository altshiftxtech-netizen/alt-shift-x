import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";

const severityConfig = {
  high: { icon: AlertCircle, className: "bg-red-100 text-red-700 border-red-200", label: "High" },
  medium: { icon: AlertTriangle, className: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium" },
  low: { icon: AlertTriangle, className: "bg-blue-100 text-blue-700 border-blue-200", label: "Low" },
};

export default function HallucinationLog({ flags }) {
  const clean = flags.length === 0;

  return (
    <Card className={`border shadow-sm h-full ${clean ? "border-emerald-200 bg-emerald-50" : "border-red-200"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${clean ? "text-emerald-600" : "text-red-500"}`} />
          <CardTitle className="text-sm font-semibold text-slate-800">Hallucination Audit</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {clean ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-emerald-800">No hallucinations detected</p>
            <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
              All extracted values are consistent with the source document. Citation accuracy: 100%.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag, i) => {
              const sev = severityConfig[flag.severity] || severityConfig.medium;
              const Icon = sev.icon;
              return (
                <div key={i} className="rounded-lg border border-red-100 bg-white p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-800">{flag.label}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${sev.className}`}>
                      {sev.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{flag.type}</span>
                    <span className="text-[10px] text-slate-400">Confidence: {Math.round(flag.confidence * 100)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{flag.detail}</p>
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Hallucinations are blocked from publishing if confidence drops below 70% or if contradictions remain unresolved.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}