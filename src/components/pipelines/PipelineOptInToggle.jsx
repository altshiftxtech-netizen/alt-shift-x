import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Compact opt-in toggle for a builder to include a component in the shared
 * "best-of" pipeline pool. Writes Component.include_in_pipelines.
 */
export default function PipelineOptInToggle({ componentId, initial = false }) {
  const [on, setOn] = useState(!!initial);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      await base44.entities.Component.update(componentId, { include_in_pipelines: next });
      toast.success(next ? "Added to the pipeline pool" : "Removed from the pipeline pool");
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
        on ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
      }`}
      title="Include this component in enterprise pipeline bundles"
    >
      <span className="flex items-center gap-1.5">
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Layers className="w-3 h-3" />}
        Include in pipelines
      </span>
      <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${on ? "bg-violet-600" : "bg-slate-300"}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${on ? "translate-x-3.5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}