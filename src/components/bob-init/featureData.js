// Centralized feature definitions for the B.O.B.Init Feature Selection page.
// Each feature maps to a CLI flag that gets injected into the build manifest.
export const FEATURE_GROUPS = [
  {
    category: "Security",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: "Shield",
    features: [
      { id: "sel4", label: "seL4 Isolation", desc: "Injects microkernel-level process separation", flag: "--seL4-isolate" },
      { id: "fpga", label: "FPGA Ingress Gate", desc: "Hardens the component against non-authorized traffic", flag: "--fpga-gate-ingress" },
    ],
  },
  {
    category: "Data",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    icon: "Database",
    features: [
      { id: "pii", label: "PII Fragmentation", desc: "Automatically applies K-of-N Shamir Secret Sharing", flag: "--fragment-k3-n5" },
    ],
  },
  {
    category: "Ops",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    icon: "Radio",
    features: [
      { id: "d2d", label: "D2D Sync", desc: "Enables the 'Internet Bluetooth' P2P file-sharing protocol", flag: "--noise-handshake --p2p" },
    ],
  },
  {
    category: "Compliance",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: "Scale",
    features: [
      { id: "blackstone", label: "Blackstone Guard", desc: "Applies the real-time liability-shift disclaimer", flag: "--blackstone-audit" },
      { id: "hippocrates", label: "Hippocrates Shield", desc: "Enforces HIPAA-grade health data encryption", flag: "--hippocrates-shield" },
    ],
  },
  {
    category: "Maintenance",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    icon: "Wrench",
    features: [
      { id: "shim", label: "Self-Healing Shim", desc: "Injects the adaptive API-bridge heartbeat", flag: "--inject-shim-v1" },
    ],
  },
  {
    category: "Titan Features",
    color: "text-amber-300",
    border: "border-amber-400/40",
    bg: "bg-amber-400/5",
    icon: "Crown",
    features: [
      { id: "brand-absorption", label: "Brand Absorption (Zero-Fingerprint Mirroring)", desc: "Scans a client's website and adopts exact CSS variables, typography, and spacing" },
      { id: "reason-council", label: "Reason Council Visual Logic Mapping", desc: "Interactive wiring diagram showing X4 agent consensus communication" },
      { id: "ghost-build", label: "Ghost-Build (Metadata Obfuscation)", desc: "Scrambles build metadata and file headers using Sovereign Code-Obfuscation" },
      { id: "perfect-play", label: "'Perfect Play' Pre-Render Simulation", desc: "Runs 1M virtual interactions in 5 seconds with resilience heatmaps" },
    ],
  },
];