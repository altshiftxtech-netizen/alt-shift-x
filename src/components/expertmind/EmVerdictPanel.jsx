import React from "react";
import { ShieldCheck, Activity, GitBranch, AlertTriangle, CheckCircle2, Gauge } from "lucide-react";
import { EM } from "./emTokens";
import { parseBobEmResponse } from "@/lib/gspParser";

// Tone → color mapping for verdict chips/badges.
const TONE = {
  green: { bg: "rgba(16,185,129,0.12)", border: "#10B981", text: "#065F46" },
  amber: { bg: "rgba(245,158,11,0.14)", border: "#F59E0B", text: "#92400E" },
  red: { bg: "rgba(239,68,68,0.12)", border: "#EF4444", text: "#991B1B" },
  info: { bg: "rgba(59,130,246,0.12)", border: "#3B82F6", text: "#1E40AF" },
  neutral: { bg: "rgba(100,116,139,0.10)", border: "#94A3B8", text: "#475569" },
};

function Chip({ tone = "neutral", children }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.text }}
    >
      {children}
    </span>
  );
}

function Card({ icon: Icon, title, source, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: EM.surface, border: `1px solid ${EM.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(46,139,132,0.12)" }}>
          <Icon className="w-4 h-4" style={{ color: EM.accent }} />
        </div>
        <div>
          <p className="text-[13px] font-bold leading-none" style={{ color: EM.text }}>{title}</p>
          {source && <p className="text-[10px] mt-0.5" style={{ color: EM.muted }}>{source}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Clinical Verdict card ─────────────────────────────────────────────────────
function ClinicalVerdict({ v }) {
  const paragraphB = ["Understand/Remember", "Interact with Others", "Concentrate/Persist", "Adapt/Manage Self"];
  return (
    <Card icon={ShieldCheck} title={`SSA Listing ${v.listingCode} — ${v.listingName}`} source="WEAR-MH-DISABILITY-1.0">
      {v.probableDisability && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ background: TONE.red.bg, border: `1px solid ${TONE.red.border}` }}>
          <AlertTriangle className="w-4 h-4" style={{ color: TONE.red.border }} />
          <span className="text-[12px] font-bold" style={{ color: TONE.red.text }}>Probable Disability Finding</span>
        </div>
      )}
      <p className="text-[11px] font-semibold mb-2" style={{ color: EM.muted }}>Paragraph B Functional Ratings</p>
      <div className="space-y-1.5 mb-3">
        {v.ratings.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-[12px]" style={{ color: EM.text }}>{paragraphB[i] || `Domain ${i + 1}`}</span>
            <Chip tone={r.tone}>{r.label}</Chip>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${EM.border}` }}>
        {v.eligibility.tone === "green" ? <CheckCircle2 className="w-4 h-4" style={{ color: TONE.green.border }} /> : null}
        <Chip tone={v.eligibility.tone}>{v.eligibility.label}</Chip>
      </div>
      {v.auditHash && (
        <p className="text-[10px] font-mono mt-3" style={{ color: EM.muted }}>QR-Seal · evidence …{v.auditHash}</p>
      )}
    </Card>
  );
}

// ── Trend Verdict card ────────────────────────────────────────────────────────
function TrendVerdict({ v }) {
  return (
    <Card icon={Activity} title="Longitudinal Trend" source="WEAR-MH-LONGITUDINAL-1.0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px]" style={{ color: EM.text }}>
          {v.windowDays != null ? `${v.windowDays}-day lookback` : "Lookback window"}
        </span>
        <Chip tone={v.trajectory.tone}>{v.trajectory.label}</Chip>
      </div>
      {v.confidence != null && (
        <p className="text-[11px]" style={{ color: EM.muted }}>Confidence: <strong style={{ color: EM.text }}>{v.confidence}%</strong></p>
      )}
    </Card>
  );
}

// ── Identity Verdict card ─────────────────────────────────────────────────────
function IdentityVerdict({ v }) {
  return (
    <Card icon={GitBranch} title="Lineage & Governance" source="BOB-EM-1.0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px]" style={{ color: EM.text }}>Gen-2 Lineage</span>
        <span className="text-[12px] font-mono font-semibold" style={{ color: EM.accent }}>{v.genToken}</span>
      </div>
      <p className="text-[11px] font-semibold mb-1.5" style={{ color: EM.muted }}>Active Protocols</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {v.protocols.map((p) => (
          <Chip key={p.code} tone="info">{p.name}</Chip>
        ))}
      </div>
      {v.concordance != null && (
        <div className="p-3 rounded-lg" style={{ background: "rgba(46,139,132,0.08)", border: `1px solid ${EM.border}` }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Gauge className="w-3.5 h-3.5" style={{ color: EM.accent }} />
            <span className="text-[11px] font-semibold" style={{ color: EM.muted }}>Clinical Concordance</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[26px] font-bold leading-none" style={{ color: EM.text }}>{v.concordance}%</span>
          </div>
          <div className="h-2 rounded-full mt-2 overflow-hidden" style={{ background: EM.border }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, v.concordance)}%`, background: EM.accent }} />
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Renders BOB-EM-1.0 GSP Super-Tokens as human-readable clinical/legal verdicts.
 * Pass either a raw response object (with the gsp_* hash fields) via `response`,
 * or already-parsed verdicts. The raw hash is never shown to the end user.
 */
export default function EmVerdictPanel({ response, className = "" }) {
  const parsed = parseBobEmResponse(response || {});
  const hasAny = parsed.clinical || parsed.trend || parsed.identity;
  if (!hasAny) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
      {parsed.clinical && <ClinicalVerdict v={parsed.clinical} />}
      {parsed.trend && <TrendVerdict v={parsed.trend} />}
      {parsed.identity && <IdentityVerdict v={parsed.identity} />}
    </div>
  );
}