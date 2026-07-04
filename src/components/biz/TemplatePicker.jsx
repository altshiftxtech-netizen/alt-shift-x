import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATES, DEAL_STAGES, STAGE_LABEL } from "./bizData";

const PAGE_SIZE = 4;

/**
 * Paginated document picker, browsable by deal stage. Selecting a template
 * hands it up to the parent to open the field-completion form.
 */
export default function TemplatePicker({ onPick }) {
  const [stage, setStage] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => (stage === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.stage === stage)),
    [stage]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const changeStage = (s) => { setStage(s); setPage(0); };

  return (
    <div>
      {/* Deal-stage filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <StageChip active={stage === "all"} onClick={() => changeStage("all")}>All</StageChip>
        {DEAL_STAGES.map((s) => (
          <StageChip key={s.key} active={stage === s.key} onClick={() => changeStage(s.key)}>{s.label}</StageChip>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {current.map((t) => (
          <button
            key={t.key}
            onClick={() => onPick(t)}
            className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#C8A95B]/50 hover:bg-white/[0.06] transition-colors p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{t.label}</h3>
                </div>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#C8A95B]/80">
                  {STAGE_LABEL[t.stage]}
                </span>
                <p className="mt-1.5 text-xs text-white/55 leading-relaxed">{t.summary}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="border-white/15 bg-transparent text-white/70 hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-white/50 tabular-nums">{page + 1} / {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}
            className="border-white/15 bg-transparent text-white/70 hover:bg-white/10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function StageChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? "bg-[#C8A95B] text-[#1a1207] border-[#C8A95B]"
          : "bg-transparent text-white/60 border-white/15 hover:border-white/30"
      }`}
    >
      {children}
    </button>
  );
}