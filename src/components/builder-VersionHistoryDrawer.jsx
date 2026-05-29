import React from "react";
import { X, Tag, CheckCircle2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusConfig = {
  live: { label: "Live", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  archived: { label: "Archived", className: "bg-slate-100 text-slate-500", icon: Archive },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-700", icon: Tag },
};

export default function VersionHistoryDrawer({ component, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Version History</h2>
            <p className="text-xs text-slate-400">{component.displayName} · {component.versions.length} version{component.versions.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {component.versions.map((v, i) => {
            const cfg = statusConfig[v.status] || statusConfig.archived;
            const Icon = cfg.icon;
            return (
              <div key={i} className="relative pl-6 pb-4 border-b border-slate-100 last:border-0">
                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100" />
                {i < component.versions.length - 1 && <div className="absolute left-1.5 top-4 bottom-0 w-px bg-slate-100" />}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">{v.version}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${cfg.className}`}>
                    <Icon className="w-2.5 h-2.5" />{cfg.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-1">{v.date}</p>
                <p className="text-xs text-slate-600">{v.notes}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}