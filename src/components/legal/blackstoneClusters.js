// Mandatory Legal Handoff — the clusters whose components require a signed
// Blackstone acceptance BEFORE any purchase, download, or install proceeds.
//
// A component belongs to a legal-clearance cluster if its code starts with one
// of these prefixes. Keep this list as the single source of truth so the gate,
// the badge, and any checkout path all agree.

export const BLACKSTONE_CLUSTERS = ["BIO-", "VANA-VOICE-", "UNZIP-", "SOVEREIGN-"];

// True when a component code falls inside a legal-clearance cluster.
export function requiresBlackstoneClearance(code) {
  const c = String(code || "").toUpperCase();
  return BLACKSTONE_CLUSTERS.some((prefix) => c.startsWith(prefix));
}