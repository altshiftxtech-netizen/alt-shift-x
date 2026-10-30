import suiteBrandNames from '@/components/suite/suiteBrandNames';

export const SUITE_TABS = [
  { id: 'overview', label: '⚡ The Paradigm Shift', badge: 'Why Alt+Shift+X' },
  { id: 'nodes', label: '🌐 8 Sovereign Nodes', badge: 'Live Substrates' },
  { id: 'comparisons', label: '⚖️ Why We Win', badge: 'Zero Token Tax' },
  { id: 'audience', label: '🎯 Who It Is For', badge: 'Target Verticals' },
  { id: 'security', label: '🛡️ Sovereign Trust & IP', badge: 'Air-Gapped & WORM' },
];
export const SOVEREIGN_NODES = [
  { id: 'altshiftx', name: suiteBrandNames.altshiftx, route: '/aibuilder', tagline: 'Sovereign Intelligence & Component Foundry', summary: 'The central intelligence exchange. Deploy, audit, and orchestrate certified modular AI workflows, execution protocols (X1–X5), and enterprise pipelines.', heroMetric: '5,000+ Verified Standards' },
  { id: 'turimc', name: suiteBrandNames.turimc, route: '/turimc', tagline: 'Extreme Compute & Hardware Proving Ground', summary: 'Hardware-in-the-loop physics, 10-domain FEA/thermal/stress simulation, Octa-Bus avionic decoders, and spot-arbitrage extreme compute dispatch.', heroMetric: '<1ms Local WASM Solvers' },
  { id: 'codevault', name: suiteBrandNames.codevault, route: '/codevault', tagline: 'Sovereign Git & WASM Repositories', summary: 'True client-side Git packfile decompression, multi-lane 3D canvas commit topologies, and ChaCha20-protected private repositories.', heroMetric: '100% In-Browser Git Engine' },
  { id: 'dblive', name: suiteBrandNames.dblive, route: '/dblive', tagline: 'Sovereign WORM Append-Only Database', summary: 'Statutory evidentiary database. WORM (Write-Once-Read-Many) Merkle ledger ensuring courtroom-grade audit trails (MRE 901/902 compliant).', heroMetric: 'Zero Tamper Merkle Spines' },
  { id: 'omnibridge', name: suiteBrandNames.omnibridge, route: '/omnibridge', tagline: 'Executive Pipeline & Telephony', summary: 'Autonomous executive pipeline orchestration, omnichannel voice/telephony conduits, and strategic client retention forecasting.', heroMetric: 'Sub-300ms SLA Dispatch' },
  { id: 'bitfolio', name: suiteBrandNames.bitfolio, route: '/bitfolio', tagline: '3D Portfolio & Digital Cards', summary: 'Hyper-visual 3D digital cards, WebNFC contactless tap-share integration, and cinematic real-time asset showcases.', heroMetric: 'Native WebNFC Tap Engine' },
  { id: 'sourcebridge', name: suiteBrandNames.sourcebridge, route: '/sourcebridge', tagline: 'Universal API Substrate & Network', summary: 'High-throughput enterprise API gateway, auto-healing Dead Letter Queues (DLQ), and cross-cluster event brokering.', heroMetric: 'Zero-Bleed Event Routing' },
  { id: 'magna', name: suiteBrandNames.magna, route: '/magna', tagline: 'Visual Canvas Site Foundry', summary: 'Visual drag-and-drop web engine with cryptographic Remote Site Maintenance Keys (RSMK) and self-healing fleet deployment.', heroMetric: 'Turnkey Visual AST Engine' },
];
export const COMPARISONS = [
  ['Monthly AI Inference Costs', 'Variable per-token API billing that scales with usage', 'Flat-rate passes ($0.00 token tax; client-side execution)'],
  ['Data Privacy & Sovereignty', 'Stored on shared multi-tenant cloud databases', 'Tamper-proof enclaves & local browser sandboxing'],
  ['Audit & Court Admissibility', 'Mutable application logs prone to admin alteration', 'WORM Merkle trees (MRE 901/902 statutory certified)'],
  ['Offline Availability', 'Zero functionality when internet drops', 'Self-healing offline PWA bootloaders with WASM engines'],
  ['Cross-App Telemetry Sync', 'Fragmented third-party webhooks & Zapier connectors', 'Built-in Sovereign Event Relay & SDK broadcast conduit'],
];
export const AUDIENCES = [
  { label: 'ENTERPRISE BUILDERS & CTOs', title: 'High-Throughput Engineering Teams', description: 'Teams building complex AI agents, automated pipelines, and simulation engines who are tired of unpredictable token spikes and third-party rate limits.', items: ['Code Vault for private in-memory Git topologies', 'SourceBridge for auto-remediating API gateways', `${suiteBrandNames.turimc} for hardware-in-the-loop co-simulation`] },
  { label: 'REGULATED INDUSTRIES & LEGAL COUNSEL', title: 'Compliance & Statutory Operations', description: 'Firms subject to strict evidentiary disclosure, SOC2, HIPAA, or statutory scrutiny who require immutable proof of records.', items: ['dbLive for WORM append-only Merkle chains', 'Blackstone Protocol for regulatory exposure checks', 'Unalterable timestamped event logs'] },
  { label: 'VENTURE STUDIOS & DIGITAL AGENCIES', title: 'Rapid Product & Site Foundries', description: 'Creators and agencies deploying dozens of client portals and interactive visual apps without managing complex DevOps infrastructure.', items: [`${suiteBrandNames.magna} for visual site duplication & RSMK keys`, `${suiteBrandNames.bitfolio} for 3D interactive client showcases`, 'Turnkey WebNFC contact sharing'] },
  { label: 'EXECUTIVE LEADERSHIP & REVENUE ORGS', title: 'Sales Velocity & Telephony', description: 'Organizations requiring autonomous pipeline triage, predictive client retention models, and friction-free communications.', items: ['OmniBridge CRM for autonomous lead dispatch', 'Consuela privy-core intelligence dossiers', 'Tri-Agent Synergy governance'] },
];