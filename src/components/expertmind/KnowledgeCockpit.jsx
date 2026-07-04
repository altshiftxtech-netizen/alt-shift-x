import React from "react";
import { MessageSquareText, ScanLine, Share2, IdCard, CheckCircle2 } from "lucide-react";
import { EM } from "./emTokens";

const THEMES = ["Leadership under pressure", "Risk calibration", "Pattern recognition", "Stakeholder management"];
const NODES = ["experience", "principle", "heuristic", "outcome", "lesson"];

function Panel({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: EM.surfaceAlt, border: `1px solid ${EM.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" strokeWidth={1.75} style={{ color: EM.accent }} />
        <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: EM.primary2 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * The signature "Knowledge Cockpit" — an executive software module.
 * Static/sample content only; the single "live" pulse lives in the status band.
 */
export default function KnowledgeCockpit() {
  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: EM.surface, border: `1px solid ${EM.border}`, boxShadow: `0 12px 40px ${EM.shadow}` }}
    >
      {/* Top status band */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
        style={{ background: EM.primary, color: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: EM.accent }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: EM.accent }} />
          </span>
          <span className="text-[13px] font-medium">Extraction in progress</span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="opacity-70">Subject: <span className="opacity-100 font-medium">Verified Expert</span></span>
          <span className="opacity-100 font-semibold">68%</span>
        </div>
      </div>
      {/* thin progress line */}
      <div className="h-1 w-full" style={{ background: EM.surfaceAlt }}>
        <div className="h-full" style={{ width: "68%", background: `linear-gradient(90deg, ${EM.primary2}, ${EM.accent})` }} />
      </div>

      {/* 2x2 internal grid */}
      <div className="grid sm:grid-cols-2 gap-3 p-5">
        <Panel icon={MessageSquareText} title="Live Interview">
          <p className="text-[14px] leading-relaxed italic" style={{ color: EM.text }}>
            “Tell me about the decision you made under pressure that changed the outcome.”
          </p>
        </Panel>

        <Panel icon={ScanLine} title="Extracted Themes">
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map((t) => (
              <span key={t} className="text-[12px] font-medium px-2.5 py-1 rounded-md" style={{ background: EM.accentSoft, color: EM.primary }}>{t}</span>
            ))}
          </div>
        </Panel>

        <Panel icon={Share2} title="Knowledge Graph Preview">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {NODES.map((n, i) => (
              <React.Fragment key={n}>
                <span className="text-[12px] px-2 py-1 rounded-full" style={{ border: `1px solid ${EM.border}`, color: EM.primary2 }}>{n}</span>
                {i < NODES.length - 1 && <span style={{ color: EM.border }}>—</span>}
              </React.Fragment>
            ))}
          </div>
        </Panel>

        <Panel icon={IdCard} title="Expert Profile Summary">
          <ul className="space-y-1 text-[13px]" style={{ color: EM.text }}>
            <li>Senior operator</li>
            <li>20+ years experience</li>
            <li>Cross-functional leadership</li>
            <li>High-trust domain authority</li>
          </ul>
        </Panel>
      </div>

      {/* Bottom status footer */}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3"
        style={{ borderTop: `1px solid ${EM.border}`, background: EM.surface }}
      >
        {["Ready for structuring", "Consent confirmed", "Deployment eligible"].map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: EM.primary2 }}>
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} style={{ color: EM.accent }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}