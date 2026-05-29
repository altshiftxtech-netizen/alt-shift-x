import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TYPES = ["X1 — Risk & Compliance", "X2 — Project Management", "X3 — Document Generation", "X4 — Site Reporting", "X5 — Financial Analysis"];
const CATEGORIES = ["Risk & Compliance", "Project Management", "Site Reporting", "Bid Estimation", "Scheduling", "Financial Analysis", "Document Generation", "Other"];

export default function StepSchema({ form, onChange, onNext }) {
  const valid = form.name && form.displayName && form.type && form.category && form.description && form.version;
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader><CardTitle className="text-base font-semibold text-slate-800">Step 1 — Schema & Metadata</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Component Name (slug) *</label>
            <input value={form.name} onChange={e => onChange({ name: e.target.value.toUpperCase() })}
              placeholder="RP-INDUSTRY-1.0"
              className="w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Display Name *</label>
            <input value={form.displayName} onChange={e => onChange({ displayName: e.target.value })}
              placeholder="e.g. Ironclad Protocol"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Component Type *</label>
            <select value={form.type} onChange={e => onChange({ type: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white">
              <option value="">Select type...</option>
              {TYPES.map(t => <option key={t} value={t.split(" ")[0]}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Category *</label>
            <select value={form.category} onChange={e => onChange({ category: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white">
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Version *</label>
          <input value={form.version} onChange={e => onChange({ version: e.target.value })}
            placeholder="v1.0.0"
            className="w-full text-sm font-mono border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Description * <span className="text-slate-400 font-normal">(min 80 chars)</span></label>
          <textarea value={form.description} onChange={e => onChange({ description: e.target.value })}
            rows={4} placeholder="Describe what your component extracts, which document types it targets, and what makes it unique..."
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
          <p className="text-[10px] text-slate-400 mt-0.5">{form.description.length} / 80 min characters</p>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={onNext} disabled={!valid || form.description.length < 80}
            className="bg-violet-700 hover:bg-violet-800 text-white">
            Next: Benchmark Declaration →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}