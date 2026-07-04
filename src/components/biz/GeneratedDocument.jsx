import React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, ListChecks, Info } from "lucide-react";
import DraftingAidNotice from "./DraftingAidNotice";
import { exportBizDocPdf } from "./exportBizDoc";

/**
 * Shows the generated draft with the always-on assumptions panel and the
 * next-review checklist. Download is only offered after both are surfaced.
 */
export default function GeneratedDocument({ doc, onBack }) {
  const download = () => {
    exportBizDocPdf(doc);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to templates
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xl font-bold text-white">{doc.template_label}</h2>
          <p className="text-sm text-white/55">{doc.title} · {doc.jurisdiction} · v{doc.version}</p>
        </div>
        <Button onClick={download} className="bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] text-[#0A0A0C] font-bold hover:opacity-90">
          <Download className="w-4 h-4" /> Download PDF
        </Button>
      </div>

      <DraftingAidNotice compact />

      {/* Draft body */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 max-h-[46vh] overflow-y-auto">
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-[#E6C878] prose-strong:text-white text-white/80">
          <ReactMarkdown>{doc.draft_body}</ReactMarkdown>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Assumptions */}
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-200">Assumptions Made</h3>
          </div>
          {doc.assumptions?.length ? (
            <ul className="space-y-1.5 text-xs text-amber-100/80 list-disc pl-4">
              {doc.assumptions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          ) : (
            <p className="text-xs text-amber-100/60">No assumptions — all fields were provided.</p>
          )}
        </div>

        {/* Review checklist */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-[#C8A95B]" />
            <h3 className="text-sm font-bold text-white">Next Review Checklist</h3>
          </div>
          {doc.review_checklist?.length ? (
            <ul className="space-y-1.5 text-xs text-white/70 list-disc pl-4">
              {doc.review_checklist.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          ) : (
            <p className="text-xs text-white/50">No checklist items generated.</p>
          )}
        </div>
      </div>
    </div>
  );
}