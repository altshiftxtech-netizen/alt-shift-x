import React from "react";
import { ScrollText, FileText } from "lucide-react";

// Left sidebar (20%) — Table of Contents & document indexing.
export default function BobbySidebar({ modules, activeModule, document, onSelectModule, sealStatus }) {
  const sealed = sealStatus === "sealed";
  const sections = document?.sections || [];

  return (
    <aside className="w-full md:w-1/5 md:min-w-[220px] border-r border-[#D4AF37]/15 bg-black/40 backdrop-blur-md flex flex-col">
      {/* Module index */}
      <div className="px-4 py-3 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-2 mb-2">
          <ScrollText className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[10px] tracking-[0.25em] text-[#D4AF37]/80">DOCUMENT INDEX</span>
        </div>
        <div className="space-y-1">
          {modules.map((m) => {
            const active = m.key === activeModule;
            return (
              <button
                key={m.key}
                onClick={() => onSelectModule(m.key)}
                disabled={!sealed}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-[#D4AF37]/10 border border-[#D4AF37]/40"
                    : "border border-transparent hover:bg-white/5"
                } ${!sealed ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#D4AF37]" : "text-white/40"}`} />
                  <span className={`text-xs font-semibold truncate ${active ? "text-[#D4AF37]" : "text-white/70"}`}>
                    {m.title}
                  </span>
                </div>
                <p className="text-[10px] text-white/35 mt-0.5 truncate pl-5">{m.subtitle}</p>
              </button>
            );
          })}
          {!sealed && (
            <p className="text-[10px] text-white/30 pt-1 px-1">Seal session to unlock the index.</p>
          )}
        </div>
      </div>

      {/* Active document TOC */}
      {sealed && sections.length > 0 && (
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <div className="text-[10px] tracking-[0.25em] text-[#D4AF37]/80 mb-2">TABLE OF CONTENTS</div>
          <ol className="space-y-1.5">
            {sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#sec-${i}`}
                  className="block text-[11px] text-white/55 hover:text-[#D4AF37] transition-colors leading-snug"
                >
                  <span className="text-[#D4AF37]/60 mr-1.5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </aside>
  );
}