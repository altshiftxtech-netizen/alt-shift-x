import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Layers } from "lucide-react";

function ConfidenceBadge({ confidence }) {
  const pct = Math.round(confidence * 100);
  if (pct >= 90) return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">{pct}%</span>;
  if (pct >= 70) return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">{pct}%</span>;
  return <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">{pct}%</span>;
}

export default function ExtractionResults({ fields }) {
  const [expanded, setExpanded] = useState(true);
  const passing = fields.filter(f => !f.hallucination).length;
  const flagged = fields.filter(f => f.hallucination).length;

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-sm font-semibold text-slate-800">Extraction Results</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{passing} passed</span>
            {flagged > 0 && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">{flagged} flagged</span>}
            <button onClick={() => setExpanded(e => !e)} className="text-slate-400 hover:text-slate-600">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {fields.map((field) => (
              <div
                key={field.key}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${field.hallucination ? "bg-red-50 border border-red-100" : "bg-slate-50"}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {field.hallucination
                    ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{field.label}</p>
                  <p className={`text-xs font-semibold break-words mt-0.5 ${field.hallucination ? "text-red-700" : "text-slate-800"}`}>
                    {field.value}
                  </p>
                </div>
                <ConfidenceBadge confidence={field.confidence} />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}