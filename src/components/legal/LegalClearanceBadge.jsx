import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const GOLD = "#C8A95B";

/**
 * LegalClearanceBadge — the red/gold "LEGAL CLEARANCE REQUIRED" warning shown on
 * components in the BIO-, VANA-VOICE-, UNZIP-, and SOVEREIGN- clusters. It only
 * clears (turns to a gold "CLEARED" state) once the user has signed off on the
 * Blackstone terms for that component.
 */
export default function LegalClearanceBadge({ cleared = false, className = "" }) {
  if (cleared) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${className}`}
        style={{ color: GOLD, background: `${GOLD}18`, border: `1px solid ${GOLD}55` }}
      >
        <ShieldCheck className="w-3 h-3" /> Blackstone Cleared
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${className}`}
      style={{ color: "#F87171", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.5)" }}
    >
      <ShieldAlert className="w-3 h-3" /> Legal Clearance Required
    </span>
  );
}