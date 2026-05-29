import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CHECKLIST = [
  { key: "noHardcodedData", label: "No hardcoded data", detail: "My component does not embed static lookup tables or hardcoded field values that could become stale." },
  { key: "graceefulDegradation", label: "Graceful degradation implemented", detail: "When a document is ambiguous or out of scope, my component returns an honest uncertainty signal rather than a guess." },
  { key: "citationRequired", label: "All fields include citations", detail: "Every extracted field references the source span in the document (page, line, or paragraph)." },
  { key: "noExternalCalls", label: "No external API calls", detail: "My component does not make any outbound network requests during extraction." },
  { key: "passStructureFollowed", label: "4-pass structure followed", detail: "My implementation follows the mandatory classification → extraction → validation → audit pipeline." },
  { key: "schemaValidated", label: "Output schema validated", detail: "My output JSON matches the declared schema and passes the platform schema validator." },
  { key: "sandboxTested", label: "Tested in Testing Sandbox", detail: "I have run at least 10 documents through the Testing Sandbox and reviewed the results." },
  { key: "reviewedGovernance", label: "Builder Agreement & Data Sovereignty Protocol accepted", detail: "I have read and agree to the Builder Agreement, including the User Data Sovereignty Law (Law 3), X-Protocol standards, and enforcement provisions." },
];

export default function StepCompliance({ checks, onChange, onNext, onBack }) {
  const allChecked = Object.values(checks).every(Boolean);
  const checkedCount = Object.values(checks).filter(Boolean).length;

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">Step 3 — Compliance Checklist</CardTitle>
          <span className="text-xs text-slate-400">{checkedCount}/{CHECKLIST.length} complete</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {CHECKLIST.map(item => (
          <label key={item.key} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${checks[item.key] ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100 hover:bg-slate-100"}`}>
            <input type="checkbox" checked={checks[item.key]} onChange={e => onChange(item.key, e.target.checked)}
              className="mt-0.5 accent-violet-700 w-4 h-4 flex-shrink-0" />
            <div>
              <p className={`text-sm font-semibold ${checks[item.key] ? "text-emerald-800" : "text-slate-700"}`}>{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
            </div>
          </label>
        ))}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>← Back</Button>
          <Button onClick={onNext} disabled={!allChecked} className="bg-violet-700 hover:bg-violet-800 text-white">
            Next: Review & Submit →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}