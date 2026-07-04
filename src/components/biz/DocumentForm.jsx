import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles, AlertTriangle, ShieldCheck, Scale } from "lucide-react";
import { JURISDICTIONS } from "./bizData";
import DraftingAidNotice from "./DraftingAidNotice";

/**
 * Field-completion step ("Forensic Audit") for a chosen template.
 *  - Hard-stop: every critical field must be filled before Generate is enabled.
 *  - Thoroughness Score: live % of ALL fields completed (critical + optional).
 *  - Lawyer footer: hard-coded on the form and carried onto every output.
 * `initialValues` / `initialJurisdiction` support resuming a saved draft.
 */
export default function DocumentForm({ template, onBack, onGenerate, generating, initialValues, initialJurisdiction }) {
  const [values, setValues] = useState(initialValues || {});
  const [jurisdiction, setJurisdiction] = useState(initialJurisdiction || JURISDICTIONS[0]);

  useEffect(() => {
    setValues(initialValues || {});
    setJurisdiction(initialJurisdiction || JURISDICTIONS[0]);
  }, [template.key, initialValues, initialJurisdiction]);

  const set = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));

  const missingCritical = template.fields
    .filter((f) => f.critical && !String(values[f.name] || "").trim())
    .map((f) => f.label);

  // Thoroughness = filled fields / total fields (jurisdiction always counts as filled).
  const score = useMemo(() => {
    const total = template.fields.length + 1; // +1 jurisdiction
    const filled = template.fields.filter((f) => String(values[f.name] || "").trim()).length + 1;
    return Math.round((filled / total) * 100);
  }, [values, template]);

  const canGenerate = missingCritical.length === 0 && !generating;

  const scoreColor = score >= 85 ? "text-emerald-400" : score >= 60 ? "text-[#C8A95B]" : "text-amber-400";
  const barColor = score >= 85 ? "bg-emerald-400" : score >= 60 ? "bg-[#C8A95B]" : "bg-amber-400";

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> All templates
      </button>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{template.icon}</span>
        <h2 className="text-xl font-bold text-white">{template.label}</h2>
      </div>
      <p className="text-sm text-white/55 mb-5">{template.summary}</p>

      {/* Thoroughness Score */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8A95B]" /> Thoroughness Score
          </span>
          <span className={`text-sm font-black tabular-nums ${scoreColor}`}>{score}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-white/45">
          Complete the optional fields to raise your score. Critical fields (<span className="text-amber-400">*</span>) are required to generate.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className="text-xs text-white/70">Jurisdiction pack</Label>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="mt-1.5 w-full rounded-md bg-white/5 border border-white/15 text-sm text-white px-3 py-2 focus:outline-none focus:border-[#C8A95B]/60"
          >
            {JURISDICTIONS.map((j) => <option key={j} value={j} className="bg-[#1a1207]">{j}</option>)}
          </select>
        </div>

        {template.fields.map((f) => {
          const isMissing = f.critical && !String(values[f.name] || "").trim();
          return (
            <div key={f.name}>
              <Label className="text-xs text-white/70 flex items-center gap-1">
                {f.label}
                {f.critical && <span className="text-amber-400" title="Critical field — required">*</span>}
              </Label>
              <Input
                value={values[f.name] || ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.critical ? "Required" : "Optional"}
                className={`mt-1.5 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-[#C8A95B]/60 ${
                  isMissing ? "border-amber-500/50" : "border-white/15"
                }`}
              />
            </div>
          );
        })}
      </div>

      {missingCritical.length > 0 && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <span>
            <strong>Hard stop — complete these to generate:</strong> {missingCritical.join(", ")}.
          </span>
        </div>
      )}

      <div className="mt-5"><DraftingAidNotice compact /></div>

      <Button
        onClick={() => onGenerate({ template, jurisdiction, values })}
        disabled={!canGenerate}
        className="mt-5 w-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90 disabled:opacity-40"
      >
        {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting…</> : <><Sparkles className="w-4 h-4" /> Generate Draft</>}
      </Button>

      {/* Hard-coded lawyer footer */}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/50">
        <Scale className="w-3.5 h-3.5 text-[#C8A95B]" /> Please have a lawyer review your documents.
      </p>
    </div>
  );
}