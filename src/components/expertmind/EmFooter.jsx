import React from "react";
import { EM } from "./emTokens";

export default function EmFooter() {
  return (
    <footer style={{ background: EM.surface, borderTop: `1px solid ${EM.border}` }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/c0242c616_image.png"
            alt="expertminds"
            className="h-7 w-auto object-contain"
            draggable="false"
          />
          <span className="text-[12px] font-medium" style={{ color: EM.muted }}>· Alt+Shift+X.tech</span>
        </div>
        <p className="text-[13px]" style={{ color: EM.muted }}>Governed knowledge capture for AI, enterprise, and licensing.</p>
      </div>
    </footer>
  );
}