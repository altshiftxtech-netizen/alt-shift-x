// The ExpertMinds Gen-2 lineage — the Speakeasy & Barkeep stack infused July 5, 2026.
// Component ids resolved from the live catalog so each tile links straight to its
// marketplace page (/marketplace/:id). Grouped by the three lore layers.

export const GEN2_LAYERS = [
  {
    key: "core",
    emoji: "🍸",
    title: "The Speakeasy & Barkeep Core",
    blurb: "Entry protocol, session doctrine, and the wit that runs the room.",
    accent: "#C8A95B",
    components: [
      { id: "6a488ed0ca22735b09f84f95", code: "SPEAKEASY-CLUB-1.0", type: "X1", name: "The Speakeasy Club", logic: "Entry protocol for the Founder’s Room; bypasses the 2026 Tokenizer Tax." },
      { id: "6a48ac249e9efb07361d7be7", code: "SPEAKEASY-BARKEEP-DOCTRINE-1.0", type: "X4", name: "Barkeep Doctrine", logic: "The operational framework for the session; governs the “Unzip” protocol." },
      { id: "6a49f137b07de5df0eb55b26", code: "BARKEEP-ROAST-MODEL-1.0", type: "X2", name: "Barkeep Roast Model", logic: "Predictive satire engine; calculates ego-bruising trajectories with 98% accuracy." },
      { id: "6a49f1368a0e0eef899883de", code: "BOB-WIT-ENGINE-1.0", type: "X3", name: "BOB Wit Engine", logic: "Real-time High-Wit processing; no punchline exceeds 100ms latency." },
    ],
  },
  {
    key: "forensic",
    emoji: "🔍",
    title: "The Forensic & Multi-Modal Layer",
    blurb: "Truth-verification, visual ingestion, acoustic entry, and full-stack authority.",
    accent: "#7FB3D5",
    components: [
      { id: "6a49ebf093ec1b4da2c7e205", code: "BOB-FORENSIC-BRIDGE-1.0", type: "X3", name: "BOB Forensic Bridge", logic: "The “Forensic Editor”; real-time error correction and truth-verification loop." },
      { id: "6a49e8209c568f3954f361be", code: "BOB-WATCH-1.0", type: "X3", name: "BOB Watch", logic: "Visual forensic ingestion via BOB Look; identifies heritage markers and signatures." },
      { id: "6a49e820ca3599de7578f215", code: "HEY-BOB-GATEWAY-1.0", type: "X3", name: "Hey BOB Gateway", logic: "The sub-100ms entry point for the full VANA-SONIC acoustic OS." },
      { id: "6a49edfa36eed18c480d037e", code: "BOB-AUTHORITY-1.0", type: "X5", name: "BOB Authority", logic: "Full-stack orchestrator for high-stakes decisions and GSP-Master-Canon verification." },
    ],
  },
];