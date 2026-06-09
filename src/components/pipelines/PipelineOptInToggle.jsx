import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Layers, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Compact opt-in toggle for a builder to include a component in a pipeline pool.
 * variant="best_of"  → writes Component.include_in_pipelines (the Best-of Pool)
 * variant="open"      → writes Component.include_in_open_pipeline (the Open Contribution Pipeline)
 */
export default function PipelineOptInToggle({ componentId, initial = false, variant = "best_of" }) {
  const [on, setOn] = useState(!!initial);
  const [saving, setSaving] = useState(false);

  const isOpen = variant === "open";
  const field = isOpen ? "include_in_open_pipeline" : "include_in_pipelines";
  const label = isOpen ? "Contribute to open pipeline" : "Include in pipelines";
  const Icon = isOpen ? Users : Layers;
  const onClasses = isOpen
    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
    : "border-violet-300 bg-violet-50 text-violet-700";
  const knobOn = isOpen ? "bg-emerald-600" : "bg-violet-600";

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      await base44.entities.Component.update(componentId, { [field]: next });
      toast.success(next ? (isOpen ? "Added to the open pipeline" : "Added to the pipeline pool") : "Removed");
    } catch (e) {
      setOn(!next); // revert
      toast.error("Could not update pipeline opt-in");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`w-full flex items-center justify-between gap-2 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
        on ? onClasses : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
      }`}
      title={isOpen ? "Contribute this component to the open, quarterly-billed pipeline" : "Include this component in enterprise pipeline bundles"}
    >
      <span className="flex items-center gap-1.5">
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${on ? knobOn : "bg-slate-300"}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${on ? "translate-x-3.5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}