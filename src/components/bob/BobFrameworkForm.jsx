import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

const SECTION_LABELS = {
  project: "Project Identity",
  component_identity: "Component Identity",
  ai_behavior: "AI Behavior",
  input_output: "Input / Output",
  compliance_safety: "Compliance & Safety",
  pricing_monetization: "Pricing & Monetization",
  deployment: "Deployment",
  branding_docs: "Branding & Docs",
};

const SECTION_COLORS = {
  project: "violet",
  component_identity: "blue",
  ai_behavior: "emerald",
  input_output: "amber",
  compliance_safety: "red",
  pricing_monetization: "green",
  deployment: "indigo",
  branding_docs: "pink",
};

function FieldRow({ label, enabled, onToggle, children, hint }) {
  return (
    <div className={`flex flex-col gap-1.5 py-2 border-b border-slate-100 last:border-0 ${!enabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          {hint && <span title={hint}><Info className="w-3 h-3 text-slate-400 cursor-help" /></span>}
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} className="scale-75" />
      </div>
      {enabled && <div>{children}</div>}
    </div>
  );
}

function SectionBlock({ section, data, onChange, color }) {
  const [open, setOpen] = useState(true);
  const sectionEnabled = data?.enabled !== false;

  const set = (field, val) => onChange({ ...data, [field]: val });
  const toggleArr = (field, val) => {
    const arr = data?.[field] || [];
    set(field, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const colorMap = {
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
    green: "bg-green-100 text-green-700 border-green-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
  };

  const inputCls = "w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-violet-400 bg-white";
  const selectCls = "w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-violet-400 bg-white";

  const renderFields = () => {
    switch (section) {
      case "project": return (<>
        <FieldRow label="Project Name" enabled={!!data?.project_name_enabled} onToggle={v => set("project_name_enabled", v)}>
          <input className={inputCls} placeholder="e.g. Risk Sentinel Platform" value={data?.project_name || ""} onChange={e => set("project_name", e.target.value)} />
        </FieldRow>
        <FieldRow label="Project Code" enabled={!!data?.project_code_enabled} onToggle={v => set("project_code_enabled", v)} hint="Short uppercase identifier e.g. RSP-01">
          <input className={inputCls} placeholder="RSP-01" value={data?.project_code || ""} onChange={e => set("project_code", e.target.value)} />
        </FieldRow>
        <FieldRow label="Industry Vertical" enabled={!!data?.industry_enabled} onToggle={v => set("industry_enabled", v)}>
          <select className={selectCls} value={data?.industry_vertical || ""} onChange={e => set("industry_vertical", e.target.value)}>
            <option value="">Select...</option>
            {["Construction", "Real Estate", "Infrastructure", "Mining", "Engineering", "Government", "Finance", "Healthcare", "Legal", "Other"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Target Market" enabled={!!data?.target_market_enabled} onToggle={v => set("target_market_enabled", v)}>
          <input className={inputCls} placeholder="e.g. Mid-size construction firms in AU/NZ" value={data?.target_market || ""} onChange={e => set("target_market", e.target.value)} />
        </FieldRow>
        <FieldRow label="Platform Type" enabled={!!data?.platform_type_enabled} onToggle={v => set("platform_type_enabled", v)}>
          <select className={selectCls} value={data?.platform_type || ""} onChange={e => set("platform_type", e.target.value)}>
            <option value="">Select...</option>
            {["SaaS", "API", "Embedded", "White-Label", "Mobile"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
      </>);

      case "component_identity": return (<>
        <FieldRow label="Component Type" enabled={!!data?.type_enabled} onToggle={v => set("type_enabled", v)}>
          <select className={selectCls} value={data?.component_type || ""} onChange={e => set("component_type", e.target.value)}>
            <option value="">Select...</option>
            {["X1 — Risk & Compliance", "X2 — Project Management", "X3 — Document Generation", "X4 — Site Reporting", "X5 — Financial Analysis"].map(o => <option key={o} value={o.split(" ")[0]}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Category" enabled={!!data?.category_enabled} onToggle={v => set("category_enabled", v)}>
          <select className={selectCls} value={data?.category || ""} onChange={e => set("category", e.target.value)}>
            <option value="">Select...</option>
            {["Risk & Compliance", "Project Management", "Site Reporting", "Cost Estimation", "Schedule Analysis", "Document Generation", "Financial Analysis"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Version Scheme" enabled={!!data?.version_enabled} onToggle={v => set("version_enabled", v)} hint="e.g. semver: 1.0.0">
          <input className={inputCls} placeholder="v1.0.0" value={data?.version_scheme || ""} onChange={e => set("version_scheme", e.target.value)} />
        </FieldRow>
        <FieldRow label="License Type" enabled={!!data?.license_enabled} onToggle={v => set("license_enabled", v)}>
          <select className={selectCls} value={data?.license_type || ""} onChange={e => set("license_type", e.target.value)}>
            <option value="">Select...</option>
            {["Proprietary", "MIT", "Apache-2.0", "GPL-3.0", "YottaJoule-Licensed"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Base / Licensed Components" enabled={!!data?.base_enabled} onToggle={v => set("base_enabled", v)} hint="Components this build extends or licenses">
          <input className={inputCls} placeholder="RP-CONSTRUCTION-1.0, PM-SCHEDULE-1.0" value={(data?.base_components || []).join(", ")} onChange={e => set("base_components", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
        </FieldRow>
      </>);

      case "ai_behavior": return (<>
        <FieldRow label="Model Preference" enabled={!!data?.model_enabled} onToggle={v => set("model_enabled", v)}>
          <select className={selectCls} value={data?.model_preference || ""} onChange={e => set("model_preference", e.target.value)}>
            <option value="">Select...</option>
            {["auto", "gpt-4o", "claude-3", "gemini-pro", "yottajoule-core"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Context Window" enabled={!!data?.context_enabled} onToggle={v => set("context_enabled", v)}>
          <select className={selectCls} value={data?.context_window || ""} onChange={e => set("context_window", e.target.value)}>
            {["4k", "16k", "32k", "128k"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Extraction Mode" enabled={!!data?.extraction_enabled} onToggle={v => set("extraction_enabled", v)}>
          <select className={selectCls} value={data?.extraction_mode || ""} onChange={e => set("extraction_mode", e.target.value)}>
            {["precise", "balanced", "exploratory"].map(o => <option key={o} className="capitalize">{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Confidence Threshold" enabled={!!data?.confidence_enabled} onToggle={v => set("confidence_enabled", v)} hint="Minimum AI confidence to accept result (0–1)">
          <input type="number" min="0" max="1" step="0.05" className={inputCls} value={data?.confidence_threshold ?? 0.85} onChange={e => set("confidence_threshold", parseFloat(e.target.value))} />
        </FieldRow>
        <FieldRow label="Fallback Behavior" enabled={!!data?.fallback_enabled} onToggle={v => set("fallback_enabled", v)}>
          <select className={selectCls} value={data?.fallback_behavior || ""} onChange={e => set("fallback_behavior", e.target.value)}>
            {["flag", "skip", "escalate", "default_value"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
      </>);

      case "input_output": return (<>
        <FieldRow label="Accepted File Types" enabled={!!data?.filetypes_enabled} onToggle={v => set("filetypes_enabled", v)}>
          <div className="flex flex-wrap gap-1.5">
            {["PDF", "DOCX", "XLSX", "CSV", "PNG", "JPG", "IFC", "DWG", "XML", "JSON"].map(ft => (
              <button key={ft} onClick={() => toggleArr("accepted_file_types", ft)}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold transition-colors ${(data?.accepted_file_types || []).includes(ft) ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 text-slate-500 hover:border-violet-400"}`}>
                {ft}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Max File Size (MB)" enabled={!!data?.filesize_enabled} onToggle={v => set("filesize_enabled", v)}>
          <input type="number" className={inputCls} value={data?.max_file_size_mb ?? 25} onChange={e => set("max_file_size_mb", parseInt(e.target.value))} />
        </FieldRow>
        <FieldRow label="Output Format" enabled={!!data?.output_enabled} onToggle={v => set("output_enabled", v)}>
          <select className={selectCls} value={data?.output_format || ""} onChange={e => set("output_format", e.target.value)}>
            {["JSON", "CSV", "PDF", "Word", "Structured-JSON", "Custom"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Output Schema Fields" enabled={!!data?.schema_enabled} onToggle={v => set("schema_enabled", v)} hint="Comma-separated field names">
          <input className={inputCls} placeholder="risk_level, site_id, compliance_status, flag_reason" value={(data?.schema_fields || []).join(", ")} onChange={e => set("schema_fields", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
        </FieldRow>
      </>);

      case "compliance_safety": return (<>
        <FieldRow label="Regulatory Frameworks" enabled={!!data?.reg_enabled} onToggle={v => set("reg_enabled", v)}>
          <div className="flex flex-wrap gap-1.5">
            {["SOC2", "GDPR", "ISO27001", "HIPAA", "PCI-DSS", "NIST", "AS/NZS", "ISO9001"].map(r => (
              <button key={r} onClick={() => toggleArr("regulatory_frameworks", r)}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold transition-colors ${(data?.regulatory_frameworks || []).includes(r) ? "bg-red-600 text-white border-red-600" : "border-slate-200 text-slate-500 hover:border-red-400"}`}>
                {r}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Data Residency" enabled={!!data?.residency_enabled} onToggle={v => set("residency_enabled", v)}>
          <select className={selectCls} value={data?.data_residency || ""} onChange={e => set("data_residency", e.target.value)}>
            {["US", "EU", "AU", "Global", "Custom"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="PII Handling" enabled={!!data?.pii_enabled} onToggle={v => set("pii_enabled", v)}>
          <select className={selectCls} value={data?.pii_handling || ""} onChange={e => set("pii_handling", e.target.value)}>
            {["redact", "tokenize", "allow", "flag"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
      </>);

      case "pricing_monetization": return (<>
        <FieldRow label="Pricing Model" enabled={!!data?.model_enabled} onToggle={v => set("model_enabled", v)}>
          <select className={selectCls} value={data?.pricing_model || ""} onChange={e => set("pricing_model", e.target.value)}>
            {["flat-monthly", "per-call", "tiered", "freemium", "enterprise-only"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Base Price ($/mo)" enabled={!!data?.price_enabled} onToggle={v => set("price_enabled", v)}>
          <input type="number" className={inputCls} placeholder="e.g. 149" value={data?.base_price || ""} onChange={e => set("base_price", parseFloat(e.target.value))} />
        </FieldRow>
        <FieldRow label="Free Tier Calls" enabled={!!data?.free_enabled} onToggle={v => set("free_enabled", v)}>
          <input type="number" className={inputCls} placeholder="e.g. 100" value={data?.free_tier_calls ?? 0} onChange={e => set("free_tier_calls", parseInt(e.target.value))} />
        </FieldRow>
        <FieldRow label="Trial Days" enabled={!!data?.trial_enabled} onToggle={v => set("trial_enabled", v)}>
          <input type="number" className={inputCls} placeholder="14" value={data?.trial_days ?? 14} onChange={e => set("trial_days", parseInt(e.target.value))} />
        </FieldRow>
        <FieldRow label="Target Margin %" enabled={!!data?.margin_enabled} onToggle={v => set("margin_enabled", v)}>
          <input type="number" className={inputCls} placeholder="70" value={data?.target_margin_pct ?? 70} onChange={e => set("target_margin_pct", parseInt(e.target.value))} />
        </FieldRow>
      </>);

      case "deployment": return (<>
        <FieldRow label="Deploy Target" enabled={!!data?.target_enabled} onToggle={v => set("target_enabled", v)}>
          <select className={selectCls} value={data?.deploy_target || ""} onChange={e => set("deploy_target", e.target.value)}>
            {["marketplace", "private", "white-label", "api-only"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Environment" enabled={!!data?.env_enabled} onToggle={v => set("env_enabled", v)}>
          <select className={selectCls} value={data?.environment || ""} onChange={e => set("environment", e.target.value)}>
            {["production", "staging", "both"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Rollback Strategy" enabled={!!data?.rollback_enabled} onToggle={v => set("rollback_enabled", v)}>
          <select className={selectCls} value={data?.rollback_strategy || ""} onChange={e => set("rollback_strategy", e.target.value)}>
            {["automatic", "manual", "none"].map(o => <option key={o}>{o}</option>)}
          </select>
        </FieldRow>
      </>);

      case "branding_docs": return (<>
        <FieldRow label="Brand Name" enabled={!!data?.brand_enabled} onToggle={v => set("brand_enabled", v)}>
          <input className={inputCls} placeholder="e.g. RiskSentinel by Magna Dev" value={data?.brand_name || ""} onChange={e => set("brand_name", e.target.value)} />
        </FieldRow>
        <FieldRow label="Tagline" enabled={!!data?.tagline_enabled} onToggle={v => set("tagline_enabled", v)}>
          <input className={inputCls} placeholder="e.g. The intelligent compliance layer" value={data?.tagline || ""} onChange={e => set("tagline", e.target.value)} />
        </FieldRow>
        <FieldRow label="Primary Color" enabled={!!data?.color_enabled} onToggle={v => set("color_enabled", v)}>
          <div className="flex items-center gap-2">
            <input type="color" className="h-8 w-12 rounded cursor-pointer border border-slate-200" value={data?.primary_color || "#4f46e5"} onChange={e => set("primary_color", e.target.value)} />
            <input className={inputCls} value={data?.primary_color || "#4f46e5"} onChange={e => set("primary_color", e.target.value)} />
          </div>
        </FieldRow>
        <FieldRow label="Export Word Doc" enabled={!!data?.word_enabled} onToggle={v => set("word_enabled", v)}>
          <p className="text-[10px] text-slate-400">Framework document exported as .doc for team distribution</p>
        </FieldRow>
        <FieldRow label="Export PDF" enabled={!!data?.pdf_enabled} onToggle={v => set("pdf_enabled", v)}>
          <p className="text-[10px] text-slate-400">Framework document exported as PDF for compliance records</p>
        </FieldRow>
      </>);

      default: return null;
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${sectionEnabled ? "bg-white hover:bg-slate-50" : "bg-slate-50"}`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorMap[color] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {section.toUpperCase().replace("_", " ")}
          </span>
          <span className="text-sm font-semibold text-slate-800">{SECTION_LABELS[section]}</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={sectionEnabled} onCheckedChange={v => onChange({ ...data, enabled: v })} className="scale-75" onClick={e => e.stopPropagation()} />
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && sectionEnabled && (
        <div className="px-4 py-2 bg-white border-t border-slate-100">
          {renderFields()}
        </div>
      )}
    </div>
  );
}

export default function BobFrameworkForm({ framework, onChange, applyToAll, onToggleApplyAll }) {
  const SECTIONS = Object.keys(SECTION_LABELS);

  return (
    <div className="space-y-3">
      {/* Global toggle */}
      <div className="flex items-center justify-between bg-violet-900 rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-bold text-white">Apply Framework to All Builds</p>
          <p className="text-[10px] text-violet-300 mt-0.5">When ON, this framework is injected into every new component you create</p>
        </div>
        <Switch checked={applyToAll} onCheckedChange={onToggleApplyAll} />
      </div>

      {/* Per-section blocks */}
      {SECTIONS.map(section => (
        <SectionBlock
          key={section}
          section={section}
          data={framework[section] || {}}
          onChange={val => onChange({ ...framework, [section]: val })}
          color={SECTION_COLORS[section]}
        />
      ))}
    </div>
  );
}