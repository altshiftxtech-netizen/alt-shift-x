import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { JURISDICTIONS } from "./bizData";
import DraftingAidNotice from "./DraftingAidNotice";

/**
 * Field-completion step for a chosen template. Validates required (critical)
 * fields and warns before generation if any are still blank — but still lets
 * the user proceed, since the generator records assumptions for blanks.
 */
export default function DocumentForm({ template, onBack, onGenerate, generating }) {
  const [values, setValues] = useState({});
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS[0]);

  const missingCritical = template.fields
    .filter((f) => f.critical && !String(values[f.name] || "").trim())
    .map((f) => f.label);

  const set = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));

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

        {template.fields.map((f) => (
          <div key={f.name}>
            <Label className="text-xs text-white/70 flex items-center gap-1">
              {f.label}
              {f.critical && <span className="text-amber-400" title="Critical field">*</span>}
            </Label>
            <Input
              value={values[f.name] || ""}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.critical ? "Recommended" : "Optional"}
              className="mt-1.5 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:border-[#C8A95B]/60"
            />
          </div>
        ))}
      </div>

      {missingCritical.length > 0 && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <span>
            <strong>Missing critical fields:</strong> {missingCritical.join(", ")}. You can still generate — BOB² will
            make standard assumptions and list them — but these usually need your input.
          </span>
        </div>
      )}

      <div className="mt-5"><DraftingAidNotice compact /></div>

      <Button
        onClick={() => onGenerate({ template, jurisdiction, values })}
        disabled={generating}
        className="mt-5 w-full bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90"
      >
        {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting…</> : <><Sparkles className="w-4 h-4" /> Generate Draft</>}
      </Button>
    </div>
  );
}