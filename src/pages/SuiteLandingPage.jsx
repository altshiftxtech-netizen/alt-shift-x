// src/pages/SuiteLandingPage.jsx
import React, { useState, useEffect } from 'react';
import CinematicDesert from '@/components/suite/CinematicDesert';
import HolographicCarousel from '@/components/suite/HolographicCarousel';
import useSuiteOrbit from '@/components/suite/useSuiteOrbit';
import '@/components/suite/suiteScene.css';

// The 8 Calibrated Sovereign Enterprise Nodes
const SUITE_NODES = [
  {
    id: 'altshiftx',
    name: 'Alt+Shift+X',
    tagline: 'Sovereign Intelligence & Component Foundry',
    subpath: '/',
    color: '#EAB308',
    icon: '⚡',
    category: 'Master Foundry',
    price: 'Sovereign Core',
    desc: 'The master intelligence exchange for AI agents, modular components, and certified architecture standards.',
    specs: ['Root Hub', 'X1–X5 Protocols', 'Zero-Bleed Edge Routing'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/a3882799c_altxlogo2.jpeg',
    blendMode: 'multiply',
  },
  {
    id: 'turimc',
    name: 'Turi MC x APPerdeen',
    tagline: 'Extreme Compute & Hardware Proving Ground',
    subpath: '/turimc',
    color: '#10B981',
    icon: '⚙️',
    category: 'Physics & Hardware',
    price: '$299 / mo',
    desc: 'Hardware-in-the-loop simulation, 10-domain FEA/thermal/stress testing, and RLVR spot GPU inference.',
    specs: ['120 FPS WASM', 'SPICE Netlists', 'Tri-Agent Synergy'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/d041f00a6_TuriFutureLogo.png',
    blendMode: 'screen',
  },
  {
    id: 'codevault',
    name: 'Code Vault',
    tagline: 'Sovereign Git & WASM Repositories',
    subpath: '/codevault',
    color: '#06B6D4',
    icon: '📦',
    category: 'Version Control & Repos',
    price: '$199 / mo',
    desc: 'Client-side Git packfile engine, multi-lane canvas topology visualizer, and ChaCha20 encrypted commit enclaves.',
    specs: ['Zero Cloud Tokens', '4-Lane Git Graph', 'Level 1-100 Ascension'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/3b25cb263_CodeVaultlogo1.png',
    blendMode: 'screen',
  },
  {
    id: 'dblive',
    name: 'dbLive',
    tagline: 'Sovereign WORM Append-Only Database',
    subpath: '/dblive',
    color: '#F59E0B',
    icon: '🗄️',
    category: 'Immutable Ledger',
    price: '$249 / mo',
    desc: 'WORM append-only Merkle ledger database, time-travel query engine, and zero-knowledge partition sync.',
    specs: ['MRE 901/902 Audit', 'Merkle Tree Spines', 'Zero-Bleed Storage'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/bbed1883d_dbLiveLogo.png',
    blendMode: 'screen',
  },
  {
    id: 'omnibridge',
    name: 'OmniBridge CRM',
    tagline: 'Executive Pipeline & Telephony',
    subpath: '/omnibridge',
    color: '#F43F5E',
    icon: '📞',
    category: 'Executive CRM',
    price: '$249 / mo',
    desc: 'Autonomous lead velocity dispatch, executive client churn forecasting, and Consuela privy-core intelligence.',
    specs: ['Consuela C-Suite', 'Telephony Webhooks', '1-Click Dossiers'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/5c16d1ea1_OmniBridgeCRMLogo.png',
    blendMode: 'screen',
  },
  {
    id: 'bitfolio',
    name: 'Bitfolio Hub',
    tagline: '3D Portfolio & Digital Cards',
    subpath: '/bitfolio',
    color: '#6366F1',
    icon: '💳',
    category: 'Identity & NFC',
    price: '$149 / mo',
    desc: 'Interactive 3D digital cards, Linq WebNFC tap-share conduit, and vCard 4.0 real-time asset synchronization.',
    specs: ['WebNFC NDEF', 'Cinematic Montage', 'Zero Token ASTs'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/0d58346d9_BitfolioLogo2.png',
    blendMode: 'screen',
  },
  {
    id: 'sourcebridge',
    name: 'SourceBridge',
    tagline: 'Universal API Substrate & Network',
    subpath: '/sourcebridge',
    color: '#14B8A6',
    icon: '🌐',
    category: 'API Gateway & Event Broker',
    price: '$299 / mo',
    desc: 'Universal API gateway, Kafka/RabbitMQ throttle sentinel, Protobuf/Avro schemas, and pipeline drift correction.',
    specs: ['DLQ Remediation', 'Tri-Agent Council', 'Universal Connectors'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/7c36007e1_SourceBridgeLogo.png',
    blendMode: 'multiply',
  },
  {
    id: 'magna',
    name: 'MAGNA Builder',
    tagline: 'Visual Canvas Site Foundry',
    subpath: '/magna',
    color: '#D946EF',
    icon: '🎨',
    category: 'Site Foundry & RSMK',
    price: '$199 / mo',
    desc: 'High-speed visual canvas editor, duplicated-site autonomous upkeeper, and cryptographic RSMK key management.',
    specs: ['RSMK Fleet Keys', 'Self-Healing ASTs', 'Turnkey Foundry'],
    logo: 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/9de3176f7_MAGNALogoBlack.png',
    blendMode: 'screen',
  },
];

export default function SuiteLandingPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { rotationAngle, select: selectOrbit, handlers: orbitHandlers, motion } = useSuiteOrbit();
  const [activeModal, setActiveModal] = useState(null); // 'sovereignpass' | 'about' | 'consuela'
  const [consuelaQuery, setConsuelaQuery] = useState('');
  const [consuelaAnswer, setConsuelaAnswer] = useState(null);
  const [consuelaLoading, setConsuelaLoading] = useState(false);

  const activeNode = SUITE_NODES[selectedIndex];

  // Sync selected index with rotation angle
  useEffect(() => {
    const total = SUITE_NODES.length;
    const slice = 360 / total;
    // Normalized angle where front card is at the bottom (90 deg)
    const normalized = (360 - (rotationAngle % 360) + 90) % 360;
    const closestIndex = Math.round(normalized / slice) % total;
    setSelectedIndex(closestIndex);
  }, [rotationAngle]);



  // Navigate directly through Cloudflare pure subpath
  const handleLaunchNode = (subpath) => {
    window.location.href = subpath;
  };

  // Consuela AI Advisor Interaction
  const handleAskConsuela = () => {
    if (!consuelaQuery.trim()) return;
    setConsuelaLoading(true);
    setConsuelaAnswer(null);

    // Turnkey client-side heuristic recommendation
    setTimeout(() => {
      const q = consuelaQuery.toLowerCase();
      let recNode = SUITE_NODES[0];
      let rationale = 'Comprehensive sovereign foundation for agent workflows and certified components.';
      let tier = 'All-Access Suite Pass ($499/mo)';

      if (q.includes('hardware') || q.includes('compute') || q.includes('cad') || q.includes('gpu') || q.includes('circuit')) {
        recNode = SUITE_NODES[1];
        rationale = 'Matches your high-performance compute and hardware co-simulation requirements with sub-millisecond SPICE solvers.';
        tier = 'Single Node Pass ($299/mo) or All-Access Pass';
      } else if (q.includes('git') || q.includes('repo') || q.includes('code') || q.includes('commit') || q.includes('wasm')) {
        recNode = SUITE_NODES[2];
        rationale = 'Zero-cloud token in-browser WASM Git packfile processing and multi-lane commit topologies.';
        tier = 'Single Node Pass ($199/mo)';
      } else if (q.includes('database') || q.includes('worm') || q.includes('ledger') || q.includes('immutable') || q.includes('audit')) {
        recNode = SUITE_NODES[3];
        rationale = 'WORM append-only Merkle ledger for statutory court/compliance evidence and unalterable logs.';
        tier = 'Single Node Pass ($249/mo)';
      } else if (q.includes('crm') || q.includes('sales') || q.includes('lead') || q.includes('phone') || q.includes('client')) {
        recNode = SUITE_NODES[4];
        rationale = 'Direct pipeline acceleration with autonomous telephony integration and client churn forecasting.';
        tier = 'Single Node Pass ($249/mo)';
      } else if (q.includes('portfolio') || q.includes('nfc') || q.includes('card') || q.includes('business card') || q.includes('tap')) {
        recNode = SUITE_NODES[5];
        rationale = '3D interactive cards with Linq WebNFC tap-share hardware integration.';
        tier = 'Single Node Pass ($149/mo)';
      } else if (q.includes('api') || q.includes('pipeline') || q.includes('broker') || q.includes('webhook') || q.includes('connector')) {
        recNode = SUITE_NODES[6];
        rationale = 'Universal API substrate and auto-remediating Dead Letter Queue event broker.';
        tier = 'Single Node Pass ($299/mo)';
      } else if (q.includes('site') || q.includes('web') || q.includes('builder') || q.includes('client site') || q.includes('canvas')) {
        recNode = SUITE_NODES[7];
        rationale = 'Visual canvas editor with cryptographic remote site maintenance keys (RSMK).';
        tier = 'Single Node Pass ($199/mo)';
      }

      setConsuelaAnswer({ node: recNode, rationale, tier });
      setConsuelaLoading(false);
    }, 600);
  };

  return (
    <div
      className="suite-cinematic relative w-full overflow-hidden select-none font-sans"
    >
      {/* 1. Fullscreen Background Simulation Canvas */}
      <CinematicDesert />

      {/* 2. Exotic HUD Ambient Grid & Reticle Overlay */}
      <div className="suite-scene-shade absolute inset-0 pointer-events-none z-10">
        {/* Subtle Crosshairs in Corners */}
        <div className="suite-hud absolute top-20 left-6 font-mono">
          PROVING GROUND ELEV: 12,480 FT // LAT: 47.6062° N // LONG: 122.3321° W
        </div>
        <div className="suite-hud suite-hud-right absolute top-20 right-6 font-mono">
          RECONNAISSANCE // AUTONOMOUS SYSTEMS // CLIENT-SIDE WEBGL
        </div>
      </div>

      {/* 3. Header Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md border-b border-yellow-500/20 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = '/')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-200 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            ASX
          </div>
          <div>
            <span className="font-black tracking-widest text-base text-yellow-400">ALTSHIFTX</span>
            <span className="text-xs text-zinc-400 tracking-wider ml-2 hidden sm:inline">SOVEREIGN SUITE</span>
          </div>
        </div>

        <nav className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveModal('sovereignpass')}
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-1 px-2"
          >
            /sovereignpass
          </button>
          <button
            onClick={() => setActiveModal('about')}
            className="text-zinc-300 hover:text-yellow-400 transition-colors py-1 px-2"
          >
            /aboutaltshiftxsuite
          </button>
          <button
            onClick={() => setActiveModal('consuela')}
            className="flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 px-3 py-1.5 rounded-full transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
          >
            <span>💬</span>
            <span>/helpmechoose</span>
          </button>
        </nav>
      </header>

      {/* 4. Center Stage: JARVIS 3D Holographic Circular Carousel */}
      <main className="absolute inset-0 flex flex-col items-center justify-end z-20 pointer-events-none pb-16 pt-20">
        {/* Holographic Ring Container */}
        <div className="suite-orbit relative flex items-center justify-center" {...orbitHandlers}>
          <HolographicCarousel nodes={SUITE_NODES} angle={rotationAngle} selected={selectedIndex} />
          {/* Accessible labels over depth-tested 3D glass slabs. */}
          {SUITE_NODES.map((node, i) => {
            const total = SUITE_NODES.length;
            const slice = 360 / total;
            const currentItemAngle = (i * slice + rotationAngle) % 360;
            const rad = (currentItemAngle * Math.PI) / 180;

            // Perspective ellipse projection — wider spread
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const orbitWidth = Math.min(isMobile ? window.innerWidth * .96 : 760, window.innerWidth * .96);
            const radiusX = isMobile ? orbitWidth * .34 : Math.min(280, orbitWidth * .37);
            const radiusY = isMobile ? 86 : 115;
            const x = Math.cos(rad) * radiusX;
            const y = Math.sin(rad) * radiusY;

            // Depth calculation: items at bottom (sin ~ 1) are closest/largest
            const depth = (Math.sin(rad) + 1) / 2; // 0 to 1
            const scale = 0.65 + depth * 0.5;
            const opacity = 0.35 + depth * 0.65;
            const zIndex = Math.round(depth * 50);

            const isSelected = i === selectedIndex;

            return (
              <div
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${node.name}`}
                aria-pressed={isSelected}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOrbit(90 - i * slice); } }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (motion.current.moved) { motion.current.moved = false; return; }
                  selectOrbit(90 - i * slice);
                }}
                onDoubleClick={() => handleLaunchNode(node.subpath)}
                style={{
                  transform: `translate(${x}px, ${y}px) perspective(900px) rotateY(${-Math.cos(rad) * 7}deg) scale(${scale})`,
                  filter: `blur(${(1 - depth) * .65}px)`,
                  opacity,
                  zIndex,
                }}
                className={`suite-node absolute cursor-pointer pointer-events-auto transition-shadow duration-300 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl backdrop-blur-xl border overflow-hidden ${
                  isSelected
                    ? 'border-yellow-400 bg-black/85 shadow-[0_0_25px_rgba(234,179,8,0.45)] ring-2 ring-yellow-400/50'
                    : 'border-white/10 bg-black/60 hover:border-white/30'
                }`}
              >
                {/* Holographic emblem — watermark cropped out of frame, blended holographically */}
                {node.logo && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={node.logo}
                      alt={node.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: 'left top',
                        transform: 'scale(1.8)',
                        mixBlendMode: node.blendMode || 'screen',
                        opacity: 0.55 + depth * 0.3,
                        filter: `drop-shadow(0 0 6px ${node.color}80) brightness(0.85)`,
                        clipPath: 'inset(0 0 0 0)',
                      }}
                    />
                    {/* Holographic scanline shimmer overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, transparent 40%, ${node.color}15 50%, transparent 60%)`,
                        mixBlendMode: 'screen',
                        opacity: 0.6,
                      }}
                    />
                    {/* Bottom fade for text legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                )}
                <div className="suite-node-copy relative z-10 text-center">
                  <div className="font-bold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                    {node.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 hidden sm:block whitespace-nowrap">
                    {node.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Dynamic Tactical Under-Carousel Dossier Card */}
        <div className="suite-dossier w-[92%] max-w-lg mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 backdrop-blur-2xl border border-yellow-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto transition-all duration-300">
          <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{activeNode.icon}</span>
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">{activeNode.name}</h2>
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${activeNode.color}20`, color: activeNode.color }}
                >
                  {activeNode.category}
                </span>
              </div>
              <p className="text-xs text-yellow-400/90 font-medium mt-0.5">{activeNode.tagline}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 font-mono block">STARTING AT</span>
              <span className="text-sm sm:text-base font-black text-white font-mono">{activeNode.price}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-3">{activeNode.desc}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {activeNode.specs.map((spec, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md"
              >
                {spec}
              </span>
            ))}
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              ✓ Sovereign Pass Included
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLaunchNode(activeNode.subpath)}
              className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-yellow-500 to-amber-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Enter Sovereign Node →
            </button>
            <button
              onClick={() => setActiveModal('sovereignpass')}
              className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-all"
            >
              View Sovereign Passes
            </button>
          </div>
        </div>
      </main>

      {/* 6. Ultra-Slim Low-Profile Footer (~48px) */}
      <footer className="absolute bottom-0 left-0 right-0 h-12 bg-black/75 backdrop-blur-md border-t border-yellow-500/20 z-30 px-6 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate">
            SOLE TITLE: The Trust of Casey Maheni Brown // Magna Lorem LLC // Trust AR
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-zinc-500">EDGE GATEWAY: 200 OK</span>
          <a href="/legal/terms" className="hover:text-yellow-400 transition-colors">
            Terms
          </a>
          <a href="/legal/privacy" className="hover:text-yellow-400 transition-colors">
            Privacy
          </a>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 7. MODALS: Sovereign Pass | About | Consuela AI Dropdown */}
      {/* ------------------------------------------------------------- */}

      {/* /sovereignpass Modal */}
      {activeModal === 'sovereignpass' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-yellow-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(234,179,8,0.25)]">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-400 font-mono text-xs">TIER ARCHITECTURE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Sovereign Pass Options</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6">
              Unlock dedicated platform capabilities across our sovereign edge network with zero token markups.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Single Node Pass */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-colors">
                <div className="text-yellow-400 font-bold text-sm mb-1">SINGLE NODE PASS</div>
                <div className="text-2xl font-black text-white font-mono mb-2">$99 - $299<span className="text-xs text-zinc-400 font-normal"> / mo</span></div>
                <p className="text-xs text-zinc-400 mb-4">Dedicated access to any single sovereign node of your choice with unlimited local client execution.</p>
                <ul className="text-xs text-zinc-300 space-y-1.5 font-mono mb-4">
                  <li>✓ 1 Chosen Suite Node</li>
                  <li>✓ High-Speed Edge Relay</li>
                  <li>✓ Zero Cloud Token Surcharges</li>
                </ul>
                <button
                  onClick={() => alert('Single Node Pass selected. Choose your node in checkout.')}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Configure Node
                </button>
              </div>

              {/* Suite-Wide All-Access Pass */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/50 relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                  BEST VALUE
                </div>
                <div className="text-yellow-400 font-bold text-sm mb-1">ALL-ACCESS SUITE PASS</div>
                <div className="text-2xl font-black text-white font-mono mb-2">$499<span className="text-xs text-zinc-400 font-normal"> / mo</span></div>
                <p className="text-xs text-zinc-400 mb-4">Unrestricted access to all 8 enterprise nodes with unified SSO session bridging and cross-db relays.</p>
                <ul className="text-xs text-zinc-300 space-y-1.5 font-mono mb-4">
                  <li>✓ All 8 Sovereign Nodes Active</li>
                  <li>✓ Universal dbLive Merkle Sync</li>
                  <li>✓ Priority Agent Synergies</li>
                </ul>
                <button
                  onClick={() => alert('All-Access Suite Pass checkout initialized.')}
                  className="w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                >
                  Claim All-Access Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* /aboutaltshiftxsuite Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">About The Alt+Shift+X Suite</h3>
            <p className="text-xs sm:text-sm text-yellow-400/90 font-medium mb-4">
              Autonomous, Client-Side, Zero-Bleed Sovereign Substrates.
            </p>
            <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                The Alt+Shift+X Enterprise Suite represents an evolutionary leap in sovereign software architecture. Built from the ground up to eliminate recurring SaaS token taxes, each node executes high-tier computational workloads directly in the client browser using WebGPU, WebAssembly (WASM), and Cloudflare Edge Workers.
              </p>
              <p>
                From the WORM append-only Merkle ledger of <strong className="text-amber-400">dbLive</strong>, to the hardware-in-the-loop physics solvers of <strong className="text-emerald-400">Turi MC</strong>, to the client-side Git packfile compiler of <strong className="text-cyan-400">Code Vault</strong>, the suite guarantees data privacy, statutory evidentiary compliance (MRE 901/902), and uncompromised speed.
              </p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <div>• APEX ROUTE: altshiftx.tech</div>
                <div>• PROTOCOLS: X1 Reading, X2 Prophecy, X3 Speed, X4 Councils, X5 Autonomous</div>
                <div>• CHAIN OF TITLE: The Trust of Casey Maheni Brown</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* /helpmechoose Consuela Advisor Slide-Down Modal */}
      {activeModal === 'consuela' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-yellow-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            <button
              onClick={() => {
                setActiveModal(null);
                setConsuelaAnswer(null);
              }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl">
                👩‍💼
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Consuela — Suite Project Advisor</h3>
                <p className="text-xs text-yellow-400 font-mono">Autonomous Architecture Consultation</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 mb-4">
              Describe your project goals, database needs, or software stack, and I will recommend the exact node pairing or pass for your deployment.
            </p>

            <div className="space-y-3 mb-4">
              <textarea
                value={consuelaQuery}
                onChange={(e) => setConsuelaQuery(e.target.value)}
                placeholder="e.g. I need an immutable database for court compliance and an API gateway for event streaming..."
                rows={3}
                className="w-full bg-black/60 border border-white/15 focus:border-yellow-400 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none resize-none transition-colors"
              />
              <button
                onClick={handleAskConsuela}
                disabled={consuelaLoading || !consuelaQuery.trim()}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-yellow-400 hover:bg-yellow-300 text-black transition-all disabled:opacity-50"
              >
                {consuelaLoading ? 'Consuela is analyzing your stack...' : 'Analyze & Prescribe Solution →'}
              </button>
            </div>

            {consuelaAnswer && (
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 animate-fadeIn">
                <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase mb-1">
                  RECOMMENDED NODE: {consuelaAnswer.node.name}
                </div>
                <p className="text-xs text-zinc-200 mb-2">{consuelaAnswer.rationale}</p>
                <div className="text-xs font-mono text-zinc-400 mb-3">
                  Recommended Tier: <strong className="text-white">{consuelaAnswer.tier}</strong>
                </div>
                <button
                  onClick={() => handleLaunchNode(consuelaAnswer.node.subpath)}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                >
                  Go to {consuelaAnswer.node.name} ({consuelaAnswer.node.subpath}) →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}