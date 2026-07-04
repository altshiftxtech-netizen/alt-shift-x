// BOB² "BuilderOperatedBiz" — template + strategy catalog and shared copy.
// This is a DRAFTING AID, not legal advice — that framing lives in DISCLAIMER
// and is surfaced on the landing page, every generated doc, and the sidebar.

export const DISCLAIMER = {
  short: "Drafting Aid Only — not legal advice.",
  full:
    "BOB² BuilderOperatedBiz is a drafting aid only. It is not a law firm and does not provide legal advice. Using it does not create an attorney–client relationship. Generated documents are automated drafts whose accuracy depends entirely on the facts you provide and on assumptions the tool makes when fields are left blank. Contract enforceability is jurisdiction-dependent. You must have qualified legal counsel review any document before you rely on, sign, or distribute it.",
};

export const JURISDICTIONS = [
  "United States (general)",
  "United States — Delaware",
  "United States — California",
  "United States — New York",
  "United Kingdom",
  "European Union",
  "Canada",
  "Australia",
];

export const DEAL_STAGES = [
  { key: "pre_deal", label: "Pre-Deal", blurb: "NDAs, LOIs, evaluation terms" },
  { key: "execution", label: "Execution", blurb: "The core signed agreements" },
  { key: "post_signature", label: "Post-Signature Ops", blurb: "SOWs, orders, change requests" },
  { key: "compliance", label: "Compliance", blurb: "DPAs, security & data roles" },
];

// Each template defines its structured input fields. `critical: true` fields
// trigger a "missing critical field" prompt if left blank before generation.
export const TEMPLATES = [
  {
    key: "software_license",
    label: "Software License Agreement",
    stage: "execution",
    icon: "📜",
    summary: "Grant, scope, and restrictions for licensing your software to a customer.",
    fields: [
      { name: "licensor", label: "Licensor (your company)", critical: true },
      { name: "licensee", label: "Licensee (customer)", critical: true },
      { name: "product", label: "Software / product name", critical: true },
      { name: "license_scope", label: "License scope (users, seats, sites, usage)", critical: true },
      { name: "term", label: "Term (e.g. 12 months, perpetual)", critical: true },
      { name: "fees", label: "Fees & payment terms" },
      { name: "ip_ownership", label: "IP ownership / retained rights" },
      { name: "liability_cap", label: "Liability cap", critical: true },
      { name: "support", label: "Support & maintenance terms" },
    ],
  },
  {
    key: "sow",
    label: "Statement of Work (SOW)",
    stage: "post_signature",
    icon: "🧾",
    summary: "Define deliverables, milestones, and acceptance criteria under a master agreement.",
    fields: [
      { name: "provider", label: "Provider", critical: true },
      { name: "client", label: "Client", critical: true },
      { name: "scope", label: "Scope of work / deliverables", critical: true },
      { name: "milestones", label: "Milestones & timeline" },
      { name: "acceptance", label: "Acceptance criteria", critical: true },
      { name: "fees", label: "Fees / rate structure" },
      { name: "assumptions", label: "Project assumptions" },
    ],
  },
  {
    key: "msa_addendum",
    label: "MSA Addendum",
    stage: "execution",
    icon: "🔗",
    summary: "Amend or extend an existing Master Services Agreement.",
    fields: [
      { name: "party_a", label: "Party A", critical: true },
      { name: "party_b", label: "Party B", critical: true },
      { name: "base_msa", label: "Base MSA reference / date", critical: true },
      { name: "changes", label: "What this addendum changes", critical: true },
      { name: "effective_date", label: "Effective date" },
    ],
  },
  {
    key: "dpa",
    label: "Data Processing Addendum (DPA)",
    stage: "compliance",
    icon: "🛡️",
    summary: "Define controller/processor data roles and security obligations.",
    fields: [
      { name: "controller", label: "Data controller", critical: true },
      { name: "processor", label: "Data processor", critical: true },
      { name: "data_roles", label: "Data roles & categories of data", critical: true },
      { name: "processing_purpose", label: "Purpose of processing", critical: true },
      { name: "subprocessors", label: "Approved sub-processors" },
      { name: "security_measures", label: "Security measures" },
      { name: "breach_notice", label: "Breach notification window" },
    ],
  },
  {
    key: "nda",
    label: "Mutual NDA",
    stage: "pre_deal",
    icon: "🤝",
    summary: "Protect confidential information exchanged during evaluation or negotiation.",
    fields: [
      { name: "party_a", label: "Party A", critical: true },
      { name: "party_b", label: "Party B", critical: true },
      { name: "purpose", label: "Purpose of disclosure", critical: true },
      { name: "term", label: "Confidentiality term (e.g. 3 years)" },
      { name: "governing_law", label: "Governing law" },
    ],
  },
  {
    key: "reseller",
    label: "Reseller / Distribution Terms",
    stage: "execution",
    icon: "🌐",
    summary: "Set up a channel partner to resell or distribute your software.",
    fields: [
      { name: "vendor", label: "Vendor (you)", critical: true },
      { name: "reseller", label: "Reseller / distributor", critical: true },
      { name: "territory", label: "Territory", critical: true },
      { name: "exclusivity", label: "Exclusive or non-exclusive", critical: true },
      { name: "margin", label: "Reseller margin / pricing" },
      { name: "term", label: "Term & renewal" },
    ],
  },
];

// "Explain it like a deal desk" strategy modules.
export const STRATEGY_MODULES = [
  {
    key: "pricing_models",
    title: "Pricing Models",
    tagline: "Seat, usage, tiered, and hybrid — when each wins.",
    points: [
      "Per-seat is predictable but caps expansion; usage-based grows with value but adds billing risk.",
      "Tiered + a usage overage line is the common SaaS compromise.",
      "Annual prepay with a discount improves cash flow and reduces churn.",
    ],
  },
  {
    key: "contract_structure",
    title: "Contract Structure",
    tagline: "MSA + Order Forms/SOWs beats one monolithic contract.",
    points: [
      "Put durable terms in an MSA; put deal-specific terms in Order Forms/SOWs.",
      "This lets you close follow-on deals fast without re-negotiating the whole contract.",
      "Reference the MSA explicitly in every SOW to avoid orphaned terms.",
    ],
  },
  {
    key: "ip_protection",
    title: "IP Protection",
    tagline: "Own your work product; license — don't assign — your core.",
    points: [
      "License your platform; only assign bespoke deliverables the client paid to own.",
      "Reserve rights to general know-how and reusable components.",
      "Feedback should be freely usable by you (a 'feedback license' clause).",
    ],
  },
  {
    key: "distribution",
    title: "Distribution & Reseller",
    tagline: "Exclusivity is leverage — price it.",
    points: [
      "Grant exclusivity only against real revenue commitments and a territory.",
      "Control end-customer terms via a flow-down / pass-through clause.",
      "Define who owns the customer relationship and the renewal.",
    ],
  },
  {
    key: "risk_triage",
    title: "Warranty, Indemnity & Risk Triage",
    tagline: "Cap liability; scope indemnities narrowly.",
    points: [
      "A liability cap tied to fees paid is the market-standard risk allocation.",
      "IP-infringement indemnity is expected; keep other indemnities narrow.",
      "Carve out confidentiality and data breaches from the general cap if pushed.",
    ],
  },
];

export const STAGE_LABEL = {
  pre_deal: "Pre-Deal",
  execution: "Execution",
  post_signature: "Post-Signature Ops",
  compliance: "Compliance",
};