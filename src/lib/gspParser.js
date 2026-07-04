// GSP Super-Token parser (GPM-V2.1) — turns the high-density hashes returned by
// the BOB-EM-1.0 brain into structured, human-readable clinical/legal verdicts.
// All parsing is client-side; the raw hash is never surfaced to the end user.

// ── Code reference maps ───────────────────────────────────────────────────────
const PARAGRAPH_B_RATINGS = {
  "1": { label: "None", tone: "neutral" },
  "2": { label: "Mild Limitation", tone: "info" },
  "3": { label: "Moderate Limitation", tone: "amber" },
  "4": { label: "Marked Limitation", tone: "red" },
  "5": { label: "Extreme Limitation", tone: "red" },
};

// Common SSA mental-disorder listings (extend as needed).
const SSA_LISTINGS = {
  "12.02": "Neurocognitive Disorders",
  "12.03": "Schizophrenia Spectrum & Psychotic Disorders",
  "12.04": "Depressive, Bipolar & Related Disorders",
  "12.06": "Anxiety & Obsessive-Compulsive Disorders",
  "12.08": "Personality & Impulse-Control Disorders",
  "12.15": "Trauma- & Stressor-Related Disorders",
};

const ELIGIBILITY_FLAGS = {
  C1: { label: "Paragraph C Evidentiary Criteria Satisfied", tone: "green" },
  C0: { label: "Paragraph C Criteria Not Met", tone: "neutral" },
};

const TRAJECTORY_CODES = {
  STABLE: { label: "Stable Trajectory", tone: "green" },
  DRIFT: { label: "Gradual Drift Detected", tone: "amber" },
  RELAPSE: { label: "High-Risk Trajectory Detected", tone: "red" },
};

const PROTOCOL_NAMES = {
  SC: "Sentinel",
  OE: "Operational",
  HP: "Hippocrates",
  BS: "Blackstone",
};

// Friendly lineage labels for known Gen tokens (falls back to the raw token).
const LINEAGE_LABELS = {
  "G2-EM-APEX": "Gen-2 Apex",
};

// ── A. Clinical Verdict — gsp_master_evaluation_hash ──────────────────────────
// Format: [ListingCode]-[Rating].[Rating].[Rating]|[EligibilityFlag]|[AuditHash]
// Example: 12.04-3.3.2.1|C1|7f3a9
export function parseMasterEvaluation(hash) {
  if (!hash || typeof hash !== "string") return null;
  const [listingBlock = "", eligibilityRaw = "", auditHash = ""] = hash.split("|");

  const dashIdx = listingBlock.indexOf("-");
  const listingCode = dashIdx >= 0 ? listingBlock.slice(0, dashIdx) : listingBlock;
  const ratingsRaw = dashIdx >= 0 ? listingBlock.slice(dashIdx + 1) : "";

  const ratings = ratingsRaw
    .split(".")
    .filter(Boolean)
    .map((digit) => ({
      code: digit,
      ...(PARAGRAPH_B_RATINGS[digit] || { label: `Unknown (${digit})`, tone: "neutral" }),
    }));

  const eligibility = ELIGIBILITY_FLAGS[eligibilityRaw] || {
    label: eligibilityRaw || "Unknown",
    tone: "neutral",
  };

  // A "Marked" (4) or "Extreme" (5) rating flags a probable disability finding.
  const probableDisability = ratings.some((r) => r.code === "4" || r.code === "5");

  return {
    kind: "clinical",
    listingCode,
    listingName: SSA_LISTINGS[listingCode] || "Unspecified Listing",
    ratings,
    eligibility,
    probableDisability,
    auditHash,
  };
}

// ── B. Trend Verdict — gsp_longitudinal_summary_hash ──────────────────────────
// Format: [Window]d|[TrajectoryCode].[Confidence]
// Example: 90d|STABLE.98
export function parseLongitudinalSummary(hash) {
  if (!hash || typeof hash !== "string") return null;
  const [windowRaw = "", trajectoryBlock = ""] = hash.split("|");

  const windowDays = parseInt(windowRaw.replace(/d$/i, ""), 10);
  const dotIdx = trajectoryBlock.indexOf(".");
  const trajectoryCode = dotIdx >= 0 ? trajectoryBlock.slice(0, dotIdx) : trajectoryBlock;
  const confidenceRaw = dotIdx >= 0 ? trajectoryBlock.slice(dotIdx + 1) : "";

  const trajectory = TRAJECTORY_CODES[trajectoryCode] || {
    label: trajectoryCode || "Unknown",
    tone: "neutral",
  };

  return {
    kind: "trend",
    windowDays: Number.isNaN(windowDays) ? null : windowDays,
    trajectoryCode,
    trajectory,
    confidence: confidenceRaw ? Number(confidenceRaw) : null,
  };
}

// ── C. Identity Verdict — gsp_lineage_audit_supertoken ────────────────────────
// Format: [GenToken]|[CouncilFlag]|[Concordance]
// Example: G2-774|SC-OE-HP|98.2
export function parseLineageAudit(hash) {
  if (!hash || typeof hash !== "string") return null;
  const [genToken = "", councilFlag = "", concordanceRaw = ""] = hash.split("|");

  const protocols = councilFlag
    .split("-")
    .filter(Boolean)
    .map((code) => ({ code, name: PROTOCOL_NAMES[code] || code }));

  return {
    kind: "identity",
    genToken,
    lineageLabel: LINEAGE_LABELS[genToken] || genToken,
    protocols,
    concordance: concordanceRaw ? Number(concordanceRaw) : null,
  };
}

// ── Convenience: parse a full BOB-EM-1.0 response object ──────────────────────
export function parseBobEmResponse(payload = {}) {
  return {
    clinical: parseMasterEvaluation(payload.gsp_master_evaluation_hash),
    trend: parseLongitudinalSummary(payload.gsp_longitudinal_summary_hash),
    identity: parseLineageAudit(payload.gsp_lineage_audit_supertoken),
  };
}