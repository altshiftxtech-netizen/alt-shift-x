/**
 * HALLWAY-PORTRAIT-REGISTRY-1.0 — single source of truth for the 12-portrait
 * Founder's Room gallery. Each portrait maps a Label/Portrait Name to a shelved
 * Component (by code + DB id), a display price, a catchy hover feature line, and
 * a unique oil-painting portrait asset. West Wing = Hallway A (P1–P6),
 * East Wing = Hallway B (P7–P12). Elias Bytewell (P12) hides the free
 * FOUNDER-LEGACY-KIT-1.0 behind the secret "eb" keystroke.
 */

export const LEGACY_BYPASS_CODE = "eb";
export const LEGACY_KIT_CODE = "FOUNDER-LEGACY-KIT-1.0";

export const PORTRAITS = [
  // ── Hallway A — West Wing ──
  {
    id: "P1", wing: "A", label: "Expertminds", founder: "Corin Bitwright",
    component_code: "SPEAKEASY-TUTORIAL-GATE-1.0", component_id: "6a4895d5d359f1129d4e192c",
    price: 0, feature: "The Apex Vault — enter the Gen-2 tutorial gate",
    accent: "#C8A95B", gate: true,
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/93336069b_generated_image.png",
  },
  {
    id: "P2", wing: "A", label: "The Architect", founder: "Magna Dev",
    component_code: "MAGNA-INFUSION-KIT-1.0", component_id: "6a48aa79ecf420fbcabb3b36",
    price: 299, feature: "Magna Dev Infusion — build like a Founder",
    accent: "#8B6FB8",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/340afd659_generated_image.png",
  },
  {
    id: "P3", wing: "A", label: "The Founder", founder: "Adele Switchford",
    component_code: "BUILDER-BRAND-ARCH-1.0", component_id: "6a48aa7a6e213e3373b40638",
    price: 199, feature: "Brand Architecture — the high-conversion blueprint",
    accent: "#C89B5E",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/d3ce9d18e_generated_image.png",
  },
  {
    id: "P4", wing: "A", label: "The Oracle", founder: "Lysa Vectora",
    component_code: "GEN2-PROMPT-ENGINEERING-1.0", component_id: "6a48aa7a9e0d60189f94777f",
    price: 149, feature: "Gen-2 Prompt Sets — high-density intelligence",
    accent: "#6d6fb8",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/4b97aef1d_generated_image.png",
  },
  {
    id: "P5", wing: "A", label: "The Artist", founder: "Bram Cacheton",
    component_code: "FORENSIC-UI-KIT-1.0", component_id: "6a48aadd1ae0efe9412c6618",
    price: 129, feature: "Forensic UI — the Gen-2 component library",
    accent: "#5EA9C8",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/5793cc08f_generated_image.png",
  },
  {
    id: "P6", wing: "A", label: "The Strategist", founder: "Tavin Gridley",
    component_code: "MONETIZATION-MATRIX-1.0", component_id: "6a48aade605455db1e5448b6",
    price: 179, feature: "The Monetization Matrix — advanced tiering",
    accent: "#C8A95B",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/6f0d2a00b_generated_image.png",
  },
  // ── Hallway B — East Wing ──
  {
    id: "P7", wing: "B", label: "The Advocate", founder: "Orrin Datamore",
    component_code: "COMPLIANCE-INFUSION-1.0", component_id: "6a48aadea05b5d1aa38b4e00",
    price: 249, feature: "Compliance Infusion — legal & clinical guardrails",
    accent: "#7FB3D5",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/47ee08246_generated_image.png",
  },
  {
    id: "P8", wing: "B", label: "The Machine", founder: "Vera Logicson",
    component_code: "LINEAGE-AUTOMATION-KIT-1.0", component_id: "6a48aae0f146ae098933131e",
    price: 499, feature: "Lineage Automation — mass-scale build patterns",
    accent: "#5EA9C8",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/0a5751980_generated_image.png",
  },
  {
    id: "P9", wing: "B", label: "The Council", founder: "Cassian Verge",
    component_code: "REASONING-COUNCIL-BLUEPRINT-1.0", component_id: "6a48aae1da078cfa65eca98b",
    price: 299, feature: "Reasoning Councils — advanced agent architecture",
    accent: "#6F9BC8",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/d92bf0129_generated_image.png",
  },
  {
    id: "P10", wing: "B", label: "The Shadow", founder: "Nira Loopin",
    component_code: "SECRET-FUNNEL-KIT-1.0", component_id: "6a48aae11a4b58e7b2285614",
    price: 199, feature: "Secret Funnels — gated UI & bypass logic",
    accent: "#8B9DC8",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/888358786_generated_image.png",
  },
  {
    id: "P11", wing: "B", label: "The Sentry", founder: "Soren Patchley",
    component_code: "HIGH-TRUST-DATA-PROTOCOLS-1.0", component_id: "6a48aae1ca441bb9cf35b41c",
    price: 149, feature: "High-Trust Protocols — validation & red-teaming",
    accent: "#9DB8D5",
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/fb22a154e_generated_image.png",
  },
  {
    id: "P12", wing: "B", label: "Elias Bytewell", founder: "The Founder",
    component_code: "FOUNDER-HERITAGE-RECORD-1.0", component_id: "6a48aae28ecb23317fbbd158",
    price: 99, feature: "Founder's Heritage — the Alt+Shift+X record",
    accent: "#E6C878", elias: true,
    image: "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/c32bbf1ad_generated_image.png",
  },
];

export const WING_A = PORTRAITS.filter((p) => p.wing === "A");
export const WING_B = PORTRAITS.filter((p) => p.wing === "B");