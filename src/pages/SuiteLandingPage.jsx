// src/pages/SuiteLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ConsultationButton from '@/components/consultation/ConsultationButton';
import HubBrand from '@/components/suite/HubBrand';

import { openCookiePreferences } from '@/components/cookies/cookiePrefStore';
import AboutSuiteModal from '@/components/suite/about/AboutSuiteModal';
import ConsuelaAdvisorModal from '@/components/ConsuelaAdvisorModal';
import ConsuelaLogo from '@/components/suite/consuela/ConsuelaLogo';
import SuiteMusicPlayer from '@/components/suite/SuiteMusicPlayer';
import useProvingGroundUsage from '@/components/suite/useProvingGroundUsage';
import SovereignPassModal from '@/components/suite/passes/SovereignPassModal';
import DeferredProvingGround from '@/components/suite/DeferredProvingGround';

import PublicSuiteNodeGrid from '@/components/suite/PublicSuiteNodeGrid';
import ProvingGroundInteractiveDemoShowcase from '@/components/suite/ProvingGroundInteractiveDemoShowcase';
import SovereignBrowserFullViewToolbar from '@/components/SovereignBrowserFullViewToolbar';
import SuiteEmblemOrbit from '@/components/suite/SuiteEmblemOrbit';
import useSuiteOrbit from '@/components/suite/useSuiteOrbit';
import SuiteNodeDossier from '@/components/suite/SuiteNodeDossier';
import useSuiteInspection from '@/components/suite/useSuiteInspection';
import suiteBrandNames from '@/components/suite/suiteBrandNames';
import '@/components/suite/suiteScene.css';

// The 8 Calibrated Sovereign Enterprise Nodes
const SUITE_NODES = [
  {
    id: 'altshiftx',
    name: suiteBrandNames.altshiftx,
    tagline: 'Sovereign Intelligence & Component Foundry',
    subpath: '/aibuilder',
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
    name: suiteBrandNames.turimc,
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
    name: suiteBrandNames.codevault,
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
    name: suiteBrandNames.dblive,
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
    name: suiteBrandNames.omnibridge,
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
    name: suiteBrandNames.bitfolio,
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
    name: suiteBrandNames.sourcebridge,
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
    name: suiteBrandNames.magna,
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
  const onMusicChange = useProvingGroundUsage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [groundInspection, setGroundInspection] = useState(false);
  const { rotationAngle, select: selectOrbit, handlers: orbitHandlers, motion, paused, pause, togglePaused } = useSuiteOrbit();
  const { inspectionIndex, inspect, keepOpen, dismiss, leave } = useSuiteInspection(pause);
  const { search } = useLocation();
  const [activeModal, setActiveModal] = useState(null); // 'sovereignpass' | 'about' | 'consuela'
  const [demoReelOpen, setDemoReelOpen] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isNativeFullScreen, setIsNativeFullScreen] = useState(false);

  const handleToggleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsNativeFullScreen(false);
    } else {
      document.documentElement.requestFullscreen().then(() => setIsNativeFullScreen(true)).catch(() => {});
    }
  };
  useEffect(() => {
    setActiveModal(new URLSearchParams(search).get('modal') === 'sovereignpass' ? 'sovereignpass' : null);
  }, [search]);


  const activeNode = SUITE_NODES[selectedIndex];

  // Sync selected index with rotation angle
  useEffect(() => {
    if (motion.current.target !== null || motion.current.paused) return;
    const total = SUITE_NODES.length;
    const slice = 360 / total;
    // Keep the chosen dossier visible while its emblem settles at the front.
    const normalized = (360 - (rotationAngle % 360) + 90) % 360;
    const closestIndex = Math.round(normalized / slice) % total;
    setSelectedIndex(closestIndex);
  }, [rotationAngle]);



  // Navigate directly through Cloudflare pure subpath
  const handleLaunchNode = (subpath) => {
    window.location.href = subpath;
  };



  return (
    <div
      className={`suite-cinematic relative w-full select-none font-sans ${groundInspection ? 'suite-inspecting' : ''}`}
    >
     <div className={isFullView ? "fixed inset-0 z-50 flex flex-col bg-slate-950" : "relative w-full h-screen overflow-hidden"}>
      {isFullView && (
        <SovereignBrowserFullViewToolbar
          isFullScreen={isNativeFullScreen}
          onCollapseView={() => setIsFullView(false)}
          onToggleMaximize={handleToggleMaximize}
          onReturnNormal={() => setIsFullView(false)}
        />
      )}
      {/* 1. Fullscreen Background Simulation Canvas */}
      <DeferredProvingGround onInspectionChange={setGroundInspection} />

      {/* 2. Exotic HUD Ambient Grid & Reticle Overlay */}
      <div className="suite-scene-shade absolute inset-0 pointer-events-none z-10">
        {/* Subtle Crosshairs in Corners */}


      </div>

      {/* 3. Header Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-md border-b border-yellow-500/20 z-30 px-6 flex items-center justify-between">
        <HubBrand />

        <nav className="suite-navigation flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm font-medium">
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
          <SuiteMusicPlayer onPlaybackChange={onMusicChange} />

          <button
            onClick={() => setActiveModal('consuela')}
            aria-label="Help me choose"
            className="flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 px-3 py-1.5 rounded-full transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
          >
            <ConsuelaLogo />
            <span className="suite-advisor-label">/helpmechoose</span>
          </button>

          <ConsultationButton />
        </nav>
      </header>

      {/* 4. Center Stage: JARVIS 3D Holographic Circular Carousel */}
      <main className="absolute inset-0 flex flex-col items-center justify-end z-20 pointer-events-none pb-16 pt-20">
        <SuiteEmblemOrbit
          nodes={SUITE_NODES} angle={rotationAngle} selected={selectedIndex}
          handlers={orbitHandlers} motion={motion} onInspect={inspect} onInspectLeave={leave}
          onSelect={(index) => { inspect(index); setSelectedIndex(index); selectOrbit(90 - index * 360 / SUITE_NODES.length); }}
          onLaunch={handleLaunchNode}
        />

        {inspectionIndex !== null && <SuiteNodeDossier node={SUITE_NODES[inspectionIndex]}
          onInteract={pause} onKeepOpen={keepOpen} onDismiss={leave}
          onResume={() => { dismiss(); if (motion.current.paused) togglePaused(); }}
          onLaunch={handleLaunchNode} onPasses={() => setActiveModal('sovereignpass')} />}
      </main>

      {/* Low-profile glass trigger for the Proving Ground demo reel */}
      {!groundInspection && (
        <button
          onClick={() => setDemoReelOpen(true)}
          className="fixed bottom-16 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
        >
          🎬 Watch Proving Ground Demo Reel
        </button>
      )}

      {/* Sovereign Browser Full View toggle */}
      {!groundInspection && (
        <button
          onClick={() => setIsFullView(true)}
          className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/20 hover:border-cyan-400/50 text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg transition-all"
        >
          ⛶ Expand to Sovereign Browser Full View
        </button>
      )}

      {/* 6. Ultra-Slim Low-Profile Footer (~48px) */}
      <footer className="absolute bottom-0 left-0 right-0 h-12 bg-black/75 backdrop-blur-md border-t border-yellow-500/20 z-30 px-6 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate">
            SOLE TITLE: Magna Lorem // MGMT: Magna Lorem LLC // Secured Asset Repository: Trust AR LLC
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/legal/terms" className="hover:text-yellow-400 transition-colors">
            Terms
          </a>
          <a href="/legal/privacy" className="hover:text-yellow-400 transition-colors">
            Privacy
          </a>
          <button type="button" onClick={openCookiePreferences} className="hover:text-yellow-400 transition-colors">Cookie Settings</button>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 7. MODALS: Sovereign Pass | About | Consuela AI Dropdown */}
      {/* ------------------------------------------------------------- */}

      {/* Shared Pass Foundry, also available at /sovereignpass. */}
      {activeModal === 'sovereignpass' && <SovereignPassModal onClose={() => setActiveModal(null)} />}

      {/* Shared interactive showcase, also available as a standalone page. */}
      {activeModal === 'about' && <AboutSuiteModal onClose={() => setActiveModal(null)} onPasses={() => setActiveModal('sovereignpass')} />}

      {/* /helpmechoose Consuela Advisor and live local quality crucible. */}
      {activeModal === 'consuela' && <ConsuelaAdvisorModal isOpen onClose={() => setActiveModal(null)} nodes={SUITE_NODES} />}

      {/* On-demand Proving Ground interactive demo reel overlay */}
      {demoReelOpen && <ProvingGroundInteractiveDemoShowcase isOpen onClose={() => setDemoReelOpen(false)} />}
     </div>

      {/* 7. Public Suite Node Grid — scrollable below the fold */}
      <PublicSuiteNodeGrid />
    </div>
  );
}