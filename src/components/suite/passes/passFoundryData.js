export const PASS_NODES = [
  { id: 'altshiftx', name: 'Alt+Shift+X', icon: '⚡', category: 'Foundry', route: '/' },
  { id: 'turimc', name: 'Turi MC x APPerdeen', icon: '⚙️', category: 'Hardware/Compute', route: '/turimc' },
  { id: 'codevault', name: 'Code Vault', icon: '📦', category: 'Git & Repos', route: '/codevault' },
  { id: 'dblive', name: 'dbLive', icon: '🗄️', category: 'WORM Database', route: '/dblive' },
  { id: 'omnibridge', name: 'OmniBridge CRM', icon: '📞', category: 'CRM & Pipeline', route: '/omnibridge' },
  { id: 'bitfolio', name: 'Bitfolio Hub', icon: '💳', category: '3D NFC Cards', route: '/bitfolio' },
  { id: 'sourcebridge', name: 'SourceBridge', icon: '🌐', category: 'API Substrate', route: '/sourcebridge' },
  { id: 'magna', name: 'MAGNA Builder', icon: '🎨', category: 'Visual Foundry', route: '/magna' },
];
export const PASS_TIERS = [
  { id: 'sprint', name: 'Sprint Burst Pass', badge: 'RAPID SPRINT / AUDIT', price: '$49', period: '7-Day Access · one payment', headline: 'High-intensity, low-commitment access for acute engineering sprints.', swaps: '1 Node of your choice for 7 days', seats: '1 Builder Seat', features: ['Full, unrestricted node capabilities', 'Cloudflare Edge authentication', '72-hour benchmark window', 'Ideal for audits, migrations, and stress-tests'], cta: 'Activate Sprint Pass' },
  { id: 'flex', name: 'Dynamic Flex Pass', badge: 'MOST POPULAR', price: '$149', period: 'per month', headline: 'The anti-lock-in pass: 1 active node with free monthly hot-swapping.', swaps: 'Unlimited Monthly Hot-Swaps across all 8 nodes', seats: '2 Builder Seats', features: ['Hot-Swap Nodes Anytime as your roadmap shifts', '100% Client-side WASM/WebGPU ($0 token tax)', 'Cross-app dbLive Merkle event logging', 'Roll unused days into your next node'], cta: 'Claim Flex Pass', popular: true },
  { id: 'duo', name: 'Duo-Mesh Founder Pass', badge: 'TEAM WORKFLOW', price: '$279', period: 'per month', headline: 'Pair any 2 sovereign nodes in parallel for integrated synergy.', swaps: '2 Concurrent Active Nodes', seats: '4 Team Seats (Granular Node Allocation)', features: ['Run 2 powerhouse platforms concurrently', 'Split-Seat allocation across engineering & sales', 'Automated syncInbound cross-DB event relay', 'Consuela Privy-Core consultation assistance'], cta: 'Claim Duo Pass' },
  { id: 'apex', name: 'All-Access Apex Pass', badge: 'COMPLETE SOVEREIGNTY', price: '$499', period: 'per month', headline: 'The ultimate enterprise pass: all 8 nodes unlocked simultaneously.', swaps: 'All 8 Sovereign Nodes Active Concurrently', seats: 'Unlimited Team & Builder Seats', features: ['Unrestricted enterprise-wide deployment', 'Tri-Agent Synergy Council (Consuela, BOB, Turi)', 'Custom subpath whitelisting on altshiftx.tech', 'Zero Cloud Token markup guarantee for life'], cta: 'Unlock Sovereign Apex' },
];