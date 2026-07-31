import React from "react";
import { Shield, Database, Radio, Scale, Wrench, Crown, GitBranch } from "lucide-react";
import { FEATURE_GROUPS } from "./featureData";

const ICONS = { Shield, Database, Radio, Scale, Wrench, Crown, GitBranch };

export default function FeatureGroup({ selected, onToggle }) {
  return (
    <div className="space-y-4">
      {FEATURE_GROUPS.map((group) => {
        const Icon = ICONS[group.icon] || Shield;
        return (
          <div key={group.category} className={`rounded-xl border ${group.border} ${group.bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${group.color}`} />
              <h3 className={`text-xs font-mono uppercase tracking-wider ${group.color}`}>{group.category}</h3>
            </div>
            <div className="space-y-2.5">
              {group.features.map((feat) => {
                const checked = selected[feat.id];
                return (
                  <label
                    key={feat.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${checked ? "border-cyan-500/40 bg-cyan-500/10" : "border-transparent hover:bg-[#161b22]"}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked}
                      onChange={() => onToggle(feat.id)}
                      className="mt-0.5 w-4 h-4 rounded border-[#30363d] bg-[#010409] accent-cyan-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${checked ? "text-cyan-400" : "text-[#c9d1d9]"}`}>{feat.label}</span>
                        {feat.flag && (
                          <code className="text-[9px] font-mono text-[#484f58] bg-[#010409] px-1.5 py-0.5 rounded">{feat.flag}</code>
                        )}
                        {feat.esi > 0 && (
                          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">+{feat.esi} ESI</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8b949e] mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}