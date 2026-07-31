// Centralized feature definitions for the B.O.B.Init Feature Selection page.
// Each feature maps to a CLI flag that gets injected into the build manifest.
// `esi` = Environment-Sovereign-Index contribution (0-20 per feature, capped at 100).

export const FEATURE_GROUPS = [
  {
    category: "Security",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: "Shield",
    features: [
      { id: "sel4", label: "seL4 Isolation", desc: "Injects microkernel-level process separation", flag: "--seL4-isolate", esi: 20 },
      { id: "fpga", label: "FPGA Ingress Gate", desc: "Hardens the component against non-authorized traffic", flag: "--fpga-gate-ingress", esi: 15 },
    ],
  },
  {
    category: "Data",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    icon: "Database",
    features: [
      { id: "pii", label: "PII Fragmentation", desc: "Automatically applies K-of-N Shamir Secret Sharing", flag: "--fragment-k3-n5", esi: 20 },
    ],
  },
  {
    category: "Ops",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    icon: "Radio",
    features: [
      { id: "d2d", label: "D2D Sync", desc: "Enables the 'Internet Bluetooth' P2P file-sharing protocol", flag: "--noise-handshake --p2p", esi: 15 },
    ],
  },
  {
    category: "Compliance",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: "Scale",
    features: [
      { id: "blackstone", label: "Blackstone Guard", desc: "Applies the real-time liability-shift disclaimer", flag: "--blackstone-audit", esi: 5 },
      { id: "hippocrates", label: "Hippocrates Shield", desc: "Enforces HIPAA-grade health data encryption", flag: "--hippocrates-shield", esi: 5 },
    ],
  },
  {
    category: "Maintenance",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    icon: "Wrench",
    features: [
      { id: "shim", label: "Self-Healing Shim", desc: "Injects the adaptive API-bridge heartbeat", flag: "--inject-shim-v1", esi: 10 },
    ],
  },
  {
    category: "Evolution",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: "GitBranch",
    features: [
      { id: "project-evolution", label: "Project Evolution & Forking", desc: "Inherit a past project manifest and auto-inject Universal Shim V110.0 substrate updates", flag: "--evolve --shim-v110", esi: 5 },
      { id: "wearable-bridge", label: "Wearable Button A-D Mapping", desc: "SOV-WEARABLE-BRIDGE-1.0: A=Confirm, B=Deny, C=Voice-Memo, D=Kill Switch + custom gestures", flag: "--wearable-bridge", esi: 10 },
    ],
  },
  {
    category: "Titan Features",
    color: "text-amber-300",
    border: "border-amber-400/40",
    bg: "bg-amber-400/5",
    icon: "Crown",
    features: [
      { id: "brand-absorption", label: "Brand Absorption (Zero-Fingerprint Mirroring)", desc: "Scans a client's website and adopts exact CSS variables, typography, and spacing", esi: 0 },
      { id: "reason-council", label: "Reason Council Visual Logic Mapping", desc: "Interactive wiring diagram showing X4 agent consensus communication", esi: 0 },
      { id: "ghost-build", label: "Ghost-Build (Metadata Obfuscation)", desc: "Scrambles build metadata and file headers using Sovereign Code-Obfuscation", esi: 5 },
      { id: "perfect-play", label: "'Perfect Play' Pre-Render Simulation", desc: "Runs 1M virtual interactions in 5 seconds with resilience heatmaps", esi: 5 },
    ],
  },
];

// Calculate ESI score (0-100) from selected features.
export function calculateEsi(selected) {
  const all = FEATURE_GROUPS.flatMap((g) => g.features);
  let score = 0;
  for (const feat of all) {
    if (selected[feat.id] && feat.esi) score += feat.esi;
  }
  return Math.min(score, 100);
}

export function getEsiTier(score) {
  if (score >= 75) return { label: "Maximum", color: "text-green-400", bar: "bg-green-500", desc: "Max fragmentation & hardware isolation" };
  if (score >= 50) return { label: "High", color: "text-cyan-400", bar: "bg-cyan-500", desc: "Strong sovereignty" };
  if (score >= 25) return { label: "Moderate", color: "text-amber-400", bar: "bg-amber-500", desc: "Partial hardening" };
  return { label: "Low", color: "text-red-400", bar: "bg-red-500", desc: "Legacy cloud dependencies" };
}