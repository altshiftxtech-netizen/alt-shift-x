import React from "react";
import { EM } from "./emTokens";

export default function EmFooter() {
  return (
    <footer style={{ background: EM.surface, borderTop: `1px solid ${EM.border}` }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px] font-bold" style={{ background: `linear-gradient(135deg, ${EM.primary} 45%, ${EM.accent})` }}>e</div>
          <span className="text-[14px] font-bold tracking-tight">
            <span style={{ color: EM.primary }}>expert</span><span style={{ color: EM.accent }}>minds</span>
            <span className="text-[12px] font-medium ml-1.5" style={{ color: EM.muted }}>· Alt+Shift+X.tech</span>
          </span>
        </div>
        <p className="text-[13px]" style={{ color: EM.muted }}>Governed knowledge capture for AI, enterprise, and licensing.</p>
      </div>
    </footer>
  );
}