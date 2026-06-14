import React from "react";
import { Link } from "react-router-dom";
import { openCookiePreferences } from "@/components/cookies/cookiePrefStore";

const LEGAL_LINKS = [
  { label: "Terms of Service", to: "/legal/terms" },
  { label: "Privacy Policy", to: "/legal/privacy" },
  { label: "Cookie Policy", to: "/legal/cookies" },
  { label: "Acceptable Use Policy", to: "/legal/acceptable-use" },
  { label: "Builder Agreement", to: "/legal/builder-agreement" },
  { label: "Refund Policy", to: "/legal/refunds" },
  { label: "DMCA Policy", to: "/legal/dmca" },
  { label: "Export Controls", to: "/legal/export-controls" },
  { label: "AI Disclosure", to: "/legal/ai-disclosure" },
  { label: "Security Disclosure", to: "/legal/security-disclosure" },
  { label: "Referral & Affiliate Terms", to: "/legal/referral-terms" },
  { label: "Accessibility", to: "/legal/accessibility" },
  { label: "Children's Safety", to: "/legal/childrens-safety" },
  { label: "DPA", to: "/legal/dpa" },
];

/**
 * LegalFooterLinks — the full legal links block + sanctions notice + copyright.
 * variant "light" for dark backgrounds (white-ish text), "dark" for light pages.
 */
export default function LegalFooterLinks({ variant = "light" }) {
  const linkCls =
    variant === "light"
      ? "text-white/50 hover:text-white"
      : "text-slate-500 hover:text-slate-800";
  const sep = variant === "light" ? "text-white/20" : "text-slate-300";
  const noticeCls = variant === "light" ? "text-white/50" : "text-slate-500";

  return (
    <div className="space-y-3">
      {/* Row 1 — legal links */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs">
        {LEGAL_LINKS.map((l, i) => (
          <React.Fragment key={l.to}>
            {i > 0 && <span className={sep}>·</span>}
            <Link to={l.to} className={linkCls}>{l.label}</Link>
          </React.Fragment>
        ))}
        <span className={sep}>·</span>
        <button type="button" onClick={() => openCookiePreferences()} className={linkCls}>
          Cookie Settings
        </button>
      </div>

      {/* Row 2 — sanctions notice */}
      <p className={`text-[11px] text-center ${noticeCls} max-w-3xl mx-auto`}>
        🚫 Sales prohibited to OFAC, EU, UK, UN, and NATO-sanctioned countries and entities.{" "}
        <Link to="/legal/export-controls" className="underline hover:no-underline">
          Export Controls Policy →
        </Link>
      </p>

      {/* Row 3 — copyright */}
      <p className={`text-[11px] text-center ${noticeCls}`}>© 2026 Alt+Shift+X. All rights reserved.</p>
    </div>
  );
}