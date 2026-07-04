import React from "react";
import { EM } from "./emTokens";

export default function EmFooter() {
  return (
    <footer style={{ background: EM.surface, borderTop: `1px solid ${EM.border}` }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[12px] font-bold" style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.primary2})` }}>X</div>
          <span className="text-[14px] font-medium" style={{ color: EM.primary }}>ExpertMind™ · Alt+Shift+X</span>
        </div>
        <p className="text-[13px]" style={{ color: EM.muted }}>Governed knowledge capture for AI, enterprise, and licensing.</p>
      </div>
    </footer>
  );
}