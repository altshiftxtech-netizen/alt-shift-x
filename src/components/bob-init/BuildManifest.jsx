import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Rocket, CheckCircle2 } from "lucide-react";
import { FEATURE_GROUPS } from "./featureData";
import EsiTracker from "./EsiTracker";

export default function BuildManifest({ selected, rules, uploadedFiles, apiFields, onRender, rendering }) {
  const selectedFeatures = FEATURE_GROUPS.flatMap((g) =>
    g.features.filter((f) => selected[f.id]).map((f) => ({ ...f, group: g.category }))
  );
  const hasRules = rules.trim().length > 0;
  const hasCode = uploadedFiles.length > 0;
  const hasApi = apiFields.some((f) => f.key.trim());

  return (
    <Card className="border-[#30363d] bg-[#0d1117] sticky top-20">
      <CardContent className="pt-4 pb-4 space-y-3">
        <h3 className="text-xs font-mono text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> Build Manifest
        </h3>

        {/* ESI Tracker */}
        <EsiTracker selected={selected} />

        {/* Selected features */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-[#484f58]">SELECTED MODULES ({selectedFeatures.length})</p>
          {selectedFeatures.length === 0 ? (
            <p className="text-[11px] text-[#484f58] font-mono italic">No modules selected.</p>
          ) : (
            selectedFeatures.map((f) => (
              <div key={f.id} className="flex items-center gap-1.5 text-[11px] font-mono">
                <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                <span className="text-[#c9d1d9] truncate">{f.label.split("(")[0].trim()}</span>
              </div>
            ))
          )}
        </div>

        {/* Rules status */}
        <div className="border-t border-[#30363d] pt-2 space-y-1">
          <p className="text-[10px] font-mono text-[#484f58]">RULES ENGINE</p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <div className={`w-1.5 h-1.5 rounded-full ${hasRules ? "bg-green-400" : "bg-[#30363d]"}`} />
            <span className={hasRules ? "text-green-400" : "text-[#484f58]"}>{hasRules ? "Rules defined" : "No rules set"}</span>
          </div>
        </div>

        {/* Code injection status */}
        <div className="border-t border-[#30363d] pt-2 space-y-1">
          <p className="text-[10px] font-mono text-[#484f58]">CODE INJECTION</p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <div className={`w-1.5 h-1.5 rounded-full ${hasCode ? "bg-green-400" : "bg-[#30363d]"}`} />
            <span className={hasCode ? "text-green-400" : "text-[#484f58]"}>{uploadedFiles.length} file(s) uploaded</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <div className={`w-1.5 h-1.5 rounded-full ${hasApi ? "bg-green-400" : "bg-[#30363d]"}`} />
            <span className={hasApi ? "text-green-400" : "text-[#484f58]"}>{apiFields.filter((f) => f.key.trim()).length} API field(s)</span>
          </div>
        </div>

        {/* Render button */}
        <button
          onClick={onRender}
          disabled={rendering || selectedFeatures.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm py-2.5 transition-all hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket className="w-4 h-4" />
          {rendering ? "Rendering..." : "Render PWA"}
        </button>
        {selectedFeatures.length === 0 && (
          <p className="text-[10px] text-amber-400/70 font-mono text-center">Select at least one module to render.</p>
        )}
      </CardContent>
    </Card>
  );
}