import React, { useState } from "react";
import { FileText, BookOpen, Wrench, Megaphone } from "lucide-react";
import PdfViewerModal from "./PdfViewerModal";

// The three Sovereign Guide PDFs. Swap the `url` values for the real signed
// document URLs once uploaded; the internal viewer renders whatever is set.
const GUIDES = [
  {
    code: "KBT-SOVEREIGN-BUILD-GUIDE-1.0",
    title: "Sovereign Build Guide",
    blurb: "The canonical reference for building on the Sovereign environment — architecture, key lifecycle, and deploy discipline.",
    icon: BookOpen,
    url: "",
  },
  {
    code: "PATCH-FIX",
    title: "Patch & Fix Playbook",
    blurb: "How to shim Fix-Only components into a live key without a full redeploy, and how to verify the shim held.",
    icon: Wrench,
    url: "",
  },
  {
    code: "COMMERCIAL",
    title: "Commercial Guide",
    blurb: "Client-facing packaging, per-client key scoping, and the commercial doctrine for Sovereign engagements.",
    icon: Megaphone,
    url: "",
  },
];

export default function SovereignGuideRepo() {
  const [active, setActive] = useState(null);

  return (
    <div className="rounded-2xl border p-6" style={{ background: "rgba(10,12,18,0.6)", borderColor: "#ffffff14" }}>
      <div className="flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-[#C8A95B]" />
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Knowledge Repository</h3>
      </div>
      <p className="text-xs text-white/45 mb-5">Sovereign Guide PDFs — read directly in the internal viewer.</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {GUIDES.map((g) => (
          <button
            key={g.code}
            onClick={() => setActive(g)}
            className="text-left rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-[#C8A95B]/40 hover:bg-white/[0.06] transition-colors"
          >
            <g.icon className="w-5 h-5 text-[#C8A95B] mb-3" />
            <p className="text-sm font-bold text-white leading-tight">{g.title}</p>
            <p className="text-[9px] font-mono text-white/35 mt-1">{g.code}</p>
            <p className="text-[11px] text-white/50 mt-2 leading-snug">{g.blurb}</p>
            <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6C878]">Read →</span>
          </button>
        ))}
      </div>

      <PdfViewerModal guide={active} onClose={() => setActive(null)} />
    </div>
  );
}