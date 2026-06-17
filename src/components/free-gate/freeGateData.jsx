// Free Tools email-gate lookup data. Any component with price === 0 AND a code
// starting "FREE-" uses this flow.

export const isFreeGated = (component) =>
  component &&
  Number(component.price) === 0 &&
  typeof component.code === "string" &&
  component.code.toUpperCase().startsWith("FREE-");

// Tool-specific modal headlines, keyed by component code.
export const FREE_TOOL_HEADLINES = {
  "FREE-MY-AI-PROFILE-1.0": "Get your free AI Profile — tell your AI who you actually are.",
  "FREE-HONEST-MODE-1.0": "Get Honest Mode free — make your AI stop telling you what you want to hear.",
  "FREE-SMART-FRIEND-SETUP-1.0": "Get the Smart Friend Setup — make your AI talk to you like a person.",
  "FREE-DECISION-PARTNER-1.0": "Get the Decision Thinking Partner — use your AI to actually think.",
  "FREE-KNOWLEDGE-VAULT-1.0": "Get your Personal Knowledge Vault — make your AI remember what matters.",
  "FREE-10X-PROMPT-UPGRADE-1.0": "Get the 10x Prompt Upgrade — 10 swaps, better answers, right now.",
  "FREE-AGENT-AUTOPSY-1.0": "Get Agent Autopsy free — find out exactly why your AI agent failed.",
  "FREE-INJECTION-STRESS-TEST-1.0": "Get the Injection Stress Test — 10 attacks to run on your agent today.",
  "FREE-PILOT-TO-PROD-1.0": "Get the Pilot-to-Production Checklist — 12 reasons agents die before launch.",
  "FREE-BEHAVIORAL-AUDIT-1.0": "Get the Behavioral Audit — is your agent drifting? Find out in 5 minutes.",
  "FREE-HALLUCINATION-FIREWALL-1.0": "Get the Hallucination Firewall — 7 checks before you deploy.",
  "FREE-AGENT-HEALTH-CARD-1.0": "Get BOB's Health Report Card — grade your agent in 60 seconds.",
  "FREE-AGENT-SPEC-TEMPLATE-1.0": "Get the Agent Spec Template — write this before one line of code.",
  "FREE-PRICING-CALCULATOR-1.0": "Get the Pricing Calculator — stop winging your AI agent price.",
  "FREE-LOOP-BREAKER-1.0": "Get the Loop Breaker — why your agent gets stuck and how to stop it.",
  "FREE-BUYERS-TRANSLATION-1.0": "Get the Buyer's Translation Layer — explain your agent to anyone.",
  "FREE-TRUST-SCORE-EXPLAINER-1.0": "Get the Trust Score Explainer — why buyers aren't converting.",
  "FREE-30-DAY-LAUNCH-PLAN-1.0": "Get the 30-Day Launch Plan — from idea to first paying customer.",
};

export const FALLBACK_HEADLINE =
  "Get this free tool — delivered to your inbox right now.";

export const getHeadline = (code) => FREE_TOOL_HEADLINES[code] || FALLBACK_HEADLINE;

// Related-tools + paid-upsell mapping. Codes are matched against the live
// catalog at render time so links/prices come from real component records.
export const FREE_GATE_MAP = {
  "FREE-MY-AI-PROFILE-1.0": { related: ["FREE-SMART-FRIEND-SETUP-1.0", "FREE-KNOWLEDGE-VAULT-1.0"], upsell: "ICE-MEMORY-1.0" },
  "FREE-HONEST-MODE-1.0": { related: ["FREE-SMART-FRIEND-SETUP-1.0", "FREE-DECISION-PARTNER-1.0"], upsell: "ICE-RESILIENCE-1.0" },
  "FREE-SMART-FRIEND-SETUP-1.0": { related: ["FREE-HONEST-MODE-1.0", "FREE-MY-AI-PROFILE-1.0"], upsell: "ICE-EMPATHY-1.0" },
  "FREE-DECISION-PARTNER-1.0": { related: ["FREE-HONEST-MODE-1.0", "FREE-KNOWLEDGE-VAULT-1.0"], upsell: "VERITY-CORE-1.0" },
  "FREE-KNOWLEDGE-VAULT-1.0": { related: ["FREE-MY-AI-PROFILE-1.0", "FREE-10X-PROMPT-UPGRADE-1.0"], upsell: "ICE-MEMORY-1.0" },
  "FREE-10X-PROMPT-UPGRADE-1.0": { related: ["FREE-MY-AI-PROFILE-1.0", "FREE-SMART-FRIEND-SETUP-1.0"], upsell: "VERITY-DOMAIN-1.0" },
  "FREE-AGENT-AUTOPSY-1.0": { related: ["FREE-INJECTION-STRESS-TEST-1.0", "FREE-PILOT-TO-PROD-1.0"], upsell: "VERITY-1.0" },
  "FREE-INJECTION-STRESS-TEST-1.0": { related: ["FREE-AGENT-AUTOPSY-1.0", "FREE-BEHAVIORAL-AUDIT-1.0"], upsell: "VERITY-SHIELD-1.0" },
  "FREE-BEHAVIORAL-AUDIT-1.0": { related: ["FREE-HONEST-MODE-1.0", "FREE-AGENT-AUTOPSY-1.0"], upsell: "ICE-INTEGRITY-1.0" },
  "FREE-HALLUCINATION-FIREWALL-1.0": { related: ["FREE-AGENT-AUTOPSY-1.0", "FREE-AGENT-HEALTH-CARD-1.0"], upsell: "VERITY-DOMAIN-1.0" },
  "FREE-AGENT-HEALTH-CARD-1.0": { related: ["FREE-PILOT-TO-PROD-1.0", "FREE-AGENT-AUTOPSY-1.0"], upsell: "VERITY-1.0" },
  "FREE-AGENT-SPEC-TEMPLATE-1.0": { related: ["FREE-30-DAY-LAUNCH-PLAN-1.0", "FREE-PRICING-CALCULATOR-1.0"], upsell: "VERITY-PROTOCOL-1.0" },
  "FREE-PRICING-CALCULATOR-1.0": { related: ["FREE-TRUST-SCORE-EXPLAINER-1.0", "FREE-BUYERS-TRANSLATION-1.0"], upsell: "VERITY-PROTOCOL-CERT-1.0" },
  "FREE-LOOP-BREAKER-1.0": { related: ["FREE-AGENT-AUTOPSY-1.0", "FREE-AGENT-HEALTH-CARD-1.0"], upsell: "VERITY-CORE-1.0" },
  "FREE-BUYERS-TRANSLATION-1.0": { related: ["FREE-PRICING-CALCULATOR-1.0", "FREE-TRUST-SCORE-EXPLAINER-1.0"], upsell: "VERITY-PROTOCOL-CERT-1.0" },
  "FREE-TRUST-SCORE-EXPLAINER-1.0": { related: ["FREE-BUYERS-TRANSLATION-1.0", "FREE-30-DAY-LAUNCH-PLAN-1.0"], upsell: "VERITY-PROTOCOL-CERT-1.0" },
  "FREE-30-DAY-LAUNCH-PLAN-1.0": { related: ["FREE-AGENT-SPEC-TEMPLATE-1.0", "FREE-PRICING-CALCULATOR-1.0"], upsell: "VERITY-PROTOCOL-1.0" },
  "FREE-PILOT-TO-PROD-1.0": { related: ["FREE-INJECTION-STRESS-TEST-1.0", "FREE-AGENT-HEALTH-CARD-1.0"], upsell: "VERITY-SHIELD-1.0" },
};

// Everyday-user tools vs builder tools — used to tag the captured subscriber.
const EVERYDAY_PREFIXES = ["FREE-MY-", "FREE-HONEST-", "FREE-SMART-", "FREE-DECISION-", "FREE-KNOWLEDGE-", "FREE-10X-"];
export const inferUserType = (code) =>
  EVERYDAY_PREFIXES.some((p) => (code || "").toUpperCase().startsWith(p))
    ? "everyday_user"
    : "builder";