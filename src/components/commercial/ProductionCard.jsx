import React from "react";
import { Film, ImageIcon, Clock, History } from "lucide-react";
import ZeroDefectCertificate from "./ZeroDefectCertificate";

// A saved production in the studio history — its deliverable, certificate,
// scene plan, and audit trail. Fully recoverable.
export default function ProductionCard({ production, onReopen }) {
  const p = production;
  const isVideo = p.format === "video";
  return (
    <div className="bg-[#12100f] border border-amber-900/30 rounded-2xl overflow-hidden">
      {p.media_url && (
        isVideo
          ? <video src={p.media_url} controls className="w-full max-h-56 object-contain bg-black" />
          : <img src={p.media_url} alt={p.title} className="w-full max-h-56 object-contain bg-black" />
      )}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-50 truncate flex items-center gap-1.5">
              {isVideo ? <Film className="w-3.5 h-3.5 text-amber-400" /> : <ImageIcon className="w-3.5 h-3.5 text-amber-400" />}
              {p.title}
            </p>
            <p className="text-[11px] text-amber-200/50 truncate">{p.brand_name}{p.platform_target ? ` · ${p.platform_target}` : ""} · v{p.version || 1}</p>
          </div>
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === "certified" ? "bg-emerald-950/60 text-emerald-300" : p.status === "published" ? "bg-sky-950/60 text-sky-300" : "bg-amber-950/60 text-amber-300"}`}>{p.status}</span>
        </div>

        {p.certificate && <ZeroDefectCertificate certificate={p.certificate} governance={p.governance} />}

        {p.scene_plan?.length > 0 && (
          <details>
            <summary className="text-[10px] text-amber-300/70 cursor-pointer hover:text-amber-200">Scene plan ({p.scene_plan.length})</summary>
            <ol className="mt-1.5 space-y-1 list-decimal list-inside">
              {p.scene_plan.map((s, i) => (
                <li key={i} className="text-[10px] text-amber-200/60 leading-snug"><span className="font-semibold text-amber-200/80">{s.scene}:</span> {s.description}</li>
              ))}
            </ol>
          </details>
        )}

        {p.audit_trail?.length > 0 && (
          <details>
            <summary className="text-[10px] text-amber-300/70 cursor-pointer hover:text-amber-200 flex items-center gap-1"><History className="w-3 h-3" /> Audit trail ({p.audit_trail.length})</summary>
            <ul className="mt-1.5 space-y-1">
              {p.audit_trail.map((a, i) => (
                <li key={i} className="text-[10px] text-amber-200/50 flex gap-1.5">
                  <Clock className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                  <span><span className="text-amber-200/70 font-semibold">{a.step}</span> — {a.detail}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {onReopen && (
          <button onClick={() => onReopen(p)} className="w-full text-[11px] font-semibold text-amber-200 bg-black/40 hover:bg-black/60 border border-amber-900/30 px-3 py-1.5 rounded-lg">
            Reopen this brief
          </button>
        )}
      </div>
    </div>
  );
}