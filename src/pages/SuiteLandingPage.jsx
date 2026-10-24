// src/pages/SuiteLandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';

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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentAngleAtDragStart, setCurrentAngleAtDragStart] = useState(0);
  const [activeModal, setActiveModal] = useState(null); // 'sovereignpass' | 'about' | 'consuela'
  const [consuelaQuery, setConsuelaQuery] = useState('');
  const [consuelaAnswer, setConsuelaAnswer] = useState(null);
  const [consuelaLoading, setConsuelaLoading] = useState(false);

  const canvasRef = useRef(null);
  const entitiesRef = useRef({
    rovers: [],
    drones: [],
    convoys: [],
    dust: [],
  });
  const cameraRef = useRef({ x: 0, y: 0, hoverT: 0 });

  const activeNode = SUITE_NODES[selectedIndex];

  // -------------------------------------------------------------
  // 1. SPACE-DESERT ANIMATED CANVAS (Drone View + Reactive Entities)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 6 Rovers, 8 Drones, 3 Convoys, 100 Dust particles
    const rovers = Array.from({ length: 6 }, (_, i) => ({
      id: `rover-${i}`,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      heading: Math.random() * Math.PI * 2,
      scanning: false,
      scanRadius: 0,
      size: 14,
    }));

    const drones = Array.from({ length: 8 }, (_, i) => ({
      id: `drone-${i}`,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      evading: 0,
      coneAngle: Math.random() * Math.PI * 2,
      altitude: 20 + Math.random() * 25,
    }));

    const convoys = [
      { x: 50, y: canvas.height * 0.75, vx: 0.35, len: 4, shield: false },
      { x: canvas.width * 0.7, y: canvas.height * 0.25, vx: -0.3, len: 3, shield: false },
    ];

    const dust = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0.15 + Math.random() * 0.25,
      vy: (Math.random() - 0.5) * 0.1,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    entitiesRef.current = { rovers, drones, convoys, dust };

    // Click on canvas to interact with entities
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check Drones
      entitiesRef.current.drones.forEach((d) => {
        const dist = Math.hypot(d.x - clickX, d.y - clickY);
        if (dist < 40) {
          d.evading = 60; // 60 frames of evasive spiral
          d.vx = (Math.random() - 0.5) * 3;
          d.vy = (Math.random() - 0.5) * 3;
        }
      });

      // Check Rovers
      entitiesRef.current.rovers.forEach((r) => {
        const dist = Math.hypot(r.x - clickX, r.y - clickY);
        if (dist < 35) {
          r.scanning = true;
          r.scanRadius = 5;
        }
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Main Render Loop (Epilepsy safe, smooth sinusoidal transitions)
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera gentle hover breathing
      cameraRef.current.hoverT += 0.008;
      const camSwayX = Math.sin(cameraRef.current.hoverT) * 12;
      const camSwayY = Math.cos(cameraRef.current.hoverT * 0.8) * 8;

      ctx.save();
      ctx.translate(camSwayX, camSwayY);

      // Deep Space-Desert Gradient Background
      const bgGrad = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        100,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.8
      );
      bgGrad.addColorStop(0, '#120f18'); // Core deep obsidian violet
      bgGrad.addColorStop(0.5, '#181216'); // Terracotta dusk
      bgGrad.addColorStop(1, '#09070c'); // Edge black
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);

      // Neon Mineral Veins (Subtle terrain contour lines)
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.05)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yBase = canvas.height * (0.2 + i * 0.18);
        ctx.moveTo(0, yBase);
        for (let x = 0; x < canvas.width; x += 120) {
          const yOff = Math.sin(x * 0.005 + i + cameraRef.current.hoverT * 0.2) * 28;
          ctx.lineTo(x, yBase + yOff);
        }
        ctx.stroke();
      }

      // Convoys
      entitiesRef.current.convoys.forEach((convoy) => {
        convoy.x += convoy.vx;
        if (convoy.x > canvas.width + 100) convoy.x = -80;
        if (convoy.x < -100) convoy.x = canvas.width + 80;

        for (let c = 0; c < convoy.len; c++) {
          const cx = convoy.x - c * 22 * (convoy.vx > 0 ? 1 : -1);
          ctx.fillStyle = 'rgba(217, 70, 239, 0.45)';
          ctx.fillRect(cx - 7, convoy.y - 4, 14, 8);
          ctx.fillStyle = '#00F5FF';
          ctx.fillRect(cx - 2, convoy.y - 1, 4, 2);
        }
      });

      // Rovers
      entitiesRef.current.rovers.forEach((r) => {
        if (!r.scanning) {
          r.x += r.vx;
          r.y += r.vy;
          if (r.x < 50 || r.x > canvas.width - 50) r.vx *= -1;
          if (r.y < 50 || r.y > canvas.height - 50) r.vy *= -1;
        }

        // Rover Chassis (Hex/Crawler)
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(Math.atan2(r.vy, r.vx));

        // Dust Trail
        ctx.fillStyle = 'rgba(202, 138, 4, 0.12)';
        ctx.beginPath();
        ctx.arc(-14, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Hull
        ctx.fillStyle = '#374151';
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-8, -5, 16, 10);
        ctx.fill();
        ctx.stroke();

        // Cockpit sensor
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(3, -2, 4, 4);
        ctx.restore();

        // Active Scan Pulse
        if (r.scanning) {
          r.scanRadius += 0.8;
          ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 1 - r.scanRadius / 45)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.scanRadius, 0, Math.PI * 2);
          ctx.stroke();
          if (r.scanRadius > 45) {
            r.scanning = false;
            r.scanRadius = 0;
          }
        }
      });

      // Drones
      entitiesRef.current.drones.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 30 || d.x > canvas.width - 30) d.vx *= -1;
        if (d.y < 30 || d.y > canvas.height - 30) d.vy *= -1;

        if (d.evading > 0) {
          d.evading--;
          d.coneAngle += 0.15;
        } else {
          d.coneAngle += 0.01;
        }

        // Volumetric Spotlight on Desert Floor
        const spotX = d.x + Math.cos(d.coneAngle) * 35;
        const spotY = d.y + Math.sin(d.coneAngle) * 20;
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, 26);
        spotGrad.addColorStop(0, 'rgba(0, 245, 255, 0.16)');
        spotGrad.addColorStop(1, 'rgba(0, 245, 255, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 26, 0, Math.PI * 2);
        ctx.fill();

        // Drone Body
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(d.x, d.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Rotor trails
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Ambient Drifting Atmospheric Dust
      entitiesRef.current.dust.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        ctx.fillStyle = `rgba(234, 179, 8, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  // -------------------------------------------------------------
  // 2. IDLE AUTO-ROTATION (Gently spins carousel until dragged)
  // -------------------------------------------------------------
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.15) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isDragging]);

  // Sync selected index with rotation angle
  useEffect(() => {
    const total = SUITE_NODES.length;
    const slice = 360 / total;
    // Normalized angle where front card is at the bottom (90 deg)
    const normalized = (360 - (rotationAngle % 360) + 90) % 360;
    const closestIndex = Math.round(normalized / slice) % total;
    setSelectedIndex(closestIndex);
  }, [rotationAngle]);

  // Drag handlers for 3D Carousel
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setCurrentAngleAtDragStart(rotationAngle);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    setRotationAngle(currentAngleAtDragStart + deltaX * 0.3);
  };

  const handleMouseUp = () => setIsDragging(false);

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
      className="relative w-screen h-screen overflow-hidden select-none bg-black text-white font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => {
        setIsDragging(true);
        setDragStartX(e.touches[0].clientX);
        setCurrentAngleAtDragStart(rotationAngle);
      }}
      onTouchMove={(e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - dragStartX;
        setRotationAngle(currentAngleAtDragStart + deltaX * 0.4);
      }}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* 1. Fullscreen Background Simulation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto z-0" />

      {/* 2. Exotic HUD Ambient Grid & Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.85)_100%)]">
        {/* Subtle Crosshairs in Corners */}
        <div className="absolute top-16 left-6 text-xs text-yellow-500/30 font-mono">
          PROVING GROUND ELEV: 12,480 FT // LAT: 47.6062° N // LONG: 122.3321° W
        </div>
        <div className="absolute top-16 right-6 text-xs text-yellow-500/30 font-mono">
          DRONE TELEMETRY: CAM-01 [120 FPS] // CLOUDFLARE EDGE: &lt;12ms
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
        <div className="relative w-[380px] h-[380px] sm:w-[640px] sm:h-[640px] flex items-center justify-center">
          {/* Animated SVG HUD Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full rounded-full border border-yellow-500/15 animate-[spin_80s_linear_infinite]" />
            <div className="w-[85%] h-[85%] rounded-full border border-dashed border-cyan-400/20 animate-[spin_50s_linear_infinite_reverse]" />
            <div className="w-[60%] h-[60%] rounded-full border border-yellow-500/10" />
            <div className="w-16 h-16 rounded-full bg-yellow-400/5 blur-xl" />
          </div>

          {/* Carousel Nodes orbiting in a 3D circle */}
          {SUITE_NODES.map((node, i) => {
            const total = SUITE_NODES.length;
            const slice = 360 / total;
            const currentItemAngle = (i * slice + rotationAngle) % 360;
            const rad = (currentItemAngle * Math.PI) / 180;

            // Perspective ellipse projection — wider spread
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const radiusX = isMobile ? 155 : 280;
            const radiusY = isMobile ? 70 : 130;
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(i);
                  const targetAngle = 90 - i * slice;
                  setRotationAngle(targetAngle);
                }}
                onDoubleClick={() => handleLaunchNode(node.subpath)}
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
                className={`absolute cursor-pointer pointer-events-auto transition-shadow duration-300 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl backdrop-blur-xl border overflow-hidden ${
                  isSelected
                    ? 'border-yellow-400 bg-black/85 shadow-[0_0_25px_rgba(234,179,8,0.45)] ring-2 ring-yellow-400/50'
                    : 'border-white/10 bg-black/60 hover:border-white/30'
                }`}
              >
                {/* Holographic emblem — watermark pushed out of frame, blended holographically */}
                {node.logo && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={node.logo}
                      alt={node.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        objectPosition: 'left center',
                        transform: 'scale(1.35)',
                        mixBlendMode: node.blendMode || 'screen',
                        opacity: 0.55 + depth * 0.3,
                        filter: `drop-shadow(0 0 6px ${node.color}80) brightness(0.85)`,
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
                    {/* AI watermark mask — top-right corner */}
                    <div className="absolute top-0 right-0 w-20 h-14 bg-black rounded-bl-2xl z-10" />
                  </div>
                )}
                <div
                  className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-inner mb-1.5"
                  style={{ backgroundColor: `${node.color}25`, border: `1px solid ${node.color}60` }}
                >
                  {node.icon}
                </div>
                <div className="relative z-10 text-center">
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
        <div className="w-[92%] max-w-lg mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 backdrop-blur-2xl border border-yellow-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto transition-all duration-300">
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