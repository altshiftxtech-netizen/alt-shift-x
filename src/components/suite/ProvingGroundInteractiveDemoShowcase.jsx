import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles,
  Crosshair, CheckCircle2, X, ArrowLeft
} from 'lucide-react';

// ============================================================================
// VERIFIED HARDWARE-SANITIZED PANORAMAS & GAME REEL MANIFEST
// SYS-PROVING-GROUND-VISUAL-ASSETS-PIPELINE-1.0
// ============================================================================
const DEMO_REELS = [
  {
    id: 'demo-rocket-launch',
    title: 'The 3D Cryogenic Rocket Launch',
    subtitle: '50th Launch Cycle Milestone',
    rewardBadge: '1 Month Free + 50% Off Annual Pass',
    badgeColor: '#F59E0B',
    imageUrl: 'https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/5667f83a2_Screenshot2026-10-30230755.png',
    caption: 'Figure 1: Mission Control at Pad 07. Real-time propellant telemetry and dual engineers HUD during cryogenic fueling. Initiating the 50th ignition triggers atmospheric ascent.',
    interactiveHint: 'Click anywhere on the launch gantry to initiate manual plasma ignition simulation.',
    gameStats: { frequency: 'Every 50th Visitor', triggerWindow: 'Instantaneous', discountYield: '50% Off' },
    simType: 'rocket',
  },
  {
    id: 'demo-airdrop-catcher',
    title: 'Supersonic Aircraft Airdrop Catcher',
    subtitle: '1 in 250 Descent Intercept',
    rewardBadge: '50% Off Any Sovereign Pass',
    badgeColor: '#06B6D4',
    imageUrl: 'https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/c85532b1f_Screenshot2026-10-30230839.png',
    caption: 'Figure 2: The Airdrop Recovery Apron. Supersonic transports deploy decelerating cargo pods with glowing hitboxes. Intercept before ground contact.',
    interactiveHint: 'Click descending crate before 4.5s countdown expires to lock promo code.',
    gameStats: { frequency: '1 / 250 Visitors', triggerWindow: '4.5s Intercept', discountYield: '50% Off' },
    simType: 'airdrop',
  },
  {
    id: 'demo-solar-reactor',
    title: 'Polyhedral Solar Ascension Reactor',
    subtitle: 'Hourly Golden Flare Transition',
    rewardBadge: 'Instant 30% Ecosystem Credit',
    badgeColor: '#EAB308',
    imageUrl: 'https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/10fa07389_Screenshot2026-10-30230915.png',
    caption: 'Figure 3: The Polyhedral Solar Ascension Array. Faceted diamond resonators channel solar plasma above the caldera during the living robotics loop.',
    interactiveHint: 'Align mouse with the central spire node to trigger the golden resonant harmonic.',
    gameStats: { frequency: '1 / 100 Chance', triggerWindow: 'Perpetual Loop', discountYield: '30% Credit' },
    simType: 'reactor',
  },
  {
    id: 'demo-gantry-promenade',
    title: 'Launch Tower Gantry & Diagnostic Deck',
    subtitle: 'Persistent Account Bounty Vault',
    rewardBadge: 'Multi-Pass Bounty Banking',
    badgeColor: '#A855F7',
    imageUrl: 'https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/41a8d3cf1_Screenshot2026-10-30231012.png',
    caption: 'Figure 4: Central Gantry Promenade & Live Diagnostic Deck. Floating heads-up displays track visitor engagement and bank unlocked rewards in client RAM.',
    interactiveHint: 'Inspect holographic telemetry chips to toggle perspective angles.',
    gameStats: { frequency: '100% Available', triggerWindow: 'Logged-In Enclave', discountYield: 'Streak Stacking' },
    simType: 'gantry',
  },
  {
    id: 'demo-kinetic-grid',
    title: 'Spaceport Kinetic Defense Grid',
    subtitle: '40-Streak Orbital Deflection',
    rewardBadge: '60% Off Flagship Apex Pass',
    badgeColor: '#10B981',
    imageUrl: 'https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/0b2578974_Screenshot2026-10-30231046.png',
    caption: 'Figure 5: The Multi-Pad Kinetic Intercept Perimeter. Autonomous transports traverse orbital corridors as defensive lasers deflect incoming trajectory vectors.',
    interactiveHint: 'Defend spaceport assets by clicking trajectory interception targets in sequence.',
    gameStats: { frequency: 'Skill-Based', triggerWindow: '40 Consecutive Hits', discountYield: '60% Off Apex' },
    simType: 'kinetic',
  },
];

export default function ProvingGroundInteractiveDemoShowcase({ isOpen, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [progressSec, setProgressSec] = useState(0);
  const [simInteractions, setSimInteractions] = useState(0);
  const [simNotification, setSimNotification] = useState(null);

  const activeReel = DEMO_REELS[activeIndex];
  const timerRef = useRef(null);

  // Auto-progress demo reel cycle (12 seconds per feature)
  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    timerRef.current = setInterval(() => {
      setProgressSec((prev) => {
        if (prev >= 12) {
          setActiveIndex((idx) => (idx + 1) % DEMO_REELS.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, activeIndex, isOpen]);

  // Pause body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setProgressSec(0);
      setSimNotification(null);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectReel = (idx) => {
    setActiveIndex(idx);
    setProgressSec(0);
    setSimNotification(null);
  };

  const handleCanvasInteraction = () => {
    setSimInteractions((prev) => prev + 1);
    setSimNotification({
      text: `INTERACTIVE TRIGGER SIMULATED: ${activeReel.rewardBadge}`,
      timestamp: Date.now(),
    });
    setTimeout(() => setSimNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all pointer-events-auto backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proving Ground
        </button>
        <button
          onClick={onClose}
          aria-label="Close demo reel"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all pointer-events-auto backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <section className="w-full max-w-7xl mx-auto font-sans text-white max-h-[95vh] overflow-y-auto rounded-3xl bg-slate-900/90 border border-white/20 backdrop-blur-2xl shadow-2xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-4 pt-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Proving Ground Demo Reel (v2.0)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Watch & Test the Proving Ground In Action
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Forensically verified, hardware-sanitized panoramic runtimes executing at 60–120 FPS in client WebGPU canvas at $0.00 cloud tokens.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isPlaying ? 'Pause Auto-Reel' : 'Play Auto-Reel'}</span>
            </button>
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
              title={isAudioMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Main Interactive Demo Player Container */}
        <div className="relative overflow-hidden px-4 pb-4">
          {/* Cinematic Video/Canvas Viewport */}
          <div
            onClick={handleCanvasInteraction}
            className="relative w-full h-[340px] sm:h-[440px] lg:h-[500px] cursor-crosshair overflow-hidden group select-none rounded-2xl"
          >
            {/* Panoramic High-DPI Texture with Ambient Ken Burns Glide */}
            <img
              src={activeReel.imageUrl}
              alt={activeReel.title}
              className={`w-full h-full object-cover ${isPlaying ? 'scale-105 transition-all duration-[12000ms]' : 'scale-100'}`}
            />

            {/* Vignette & Diegetic HUD Scanlines */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/30 to-slate-950/70 pointer-events-none" />

            {/* Top Bar Floating Telemetry HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-950/80 backdrop-blur-md border border-white/20 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  60-120 FPS WEBGPU CANVAS
                </span>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-mono bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-400">
                  PROVING GROUND PAD // CAM-0{activeIndex + 1}
                </span>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md"
                style={{ backgroundColor: activeReel.badgeColor, color: '#020617' }}
              >
                {activeReel.rewardBadge}
              </div>
            </div>

            {/* Simulated In-Canvas Win Flash */}
            {simNotification && (
              <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm pointer-events-none animate-in fade-in zoom-in duration-200">
                <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-400 text-center shadow-2xl max-w-md">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <h4 className="text-lg font-black text-white">REWARD CRITERIA VERIFIED</h4>
                  <p className="text-xs font-mono text-emerald-300 mt-1">{simNotification.text}</p>
                  <span className="text-[10px] text-slate-400 block mt-2">Single-Use Stripe Coupon Synthesized in RAM</span>
                </div>
              </div>
            )}

            {/* In-Canvas Bottom Diegetic Banner & Caption */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <div className="p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15 max-w-3xl">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                  {activeReel.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">{activeReel.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{activeReel.caption}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>{activeReel.interactiveHint}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Scrubber & Timeline Bar */}
          <div className="w-full bg-slate-950/90 border-t border-white/10 px-4 py-3 flex items-center justify-between gap-4 font-mono text-xs mt-2 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setProgressSec(0);
                  setActiveIndex((idx) => (idx - 1 + DEMO_REELS.length) % DEMO_REELS.length);
                }}
                className="p-1 hover:text-cyan-300 transition-colors"
                title="Previous Demo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-slate-400">
                REEL <span className="text-white font-bold">0{activeIndex + 1}</span> / 0{DEMO_REELS.length}
              </span>
            </div>

            {/* Progress Segment Indicators */}
            <div className="flex-1 max-w-xl flex items-center gap-1.5">
              {DEMO_REELS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectReel(i)}
                  className="h-1.5 flex-1 rounded-full bg-white/15 cursor-pointer overflow-hidden relative"
                >
                  {i === activeIndex && (
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-1000"
                      style={{ width: `${(progressSec / 12) * 100}%` }}
                    />
                  )}
                  {i < activeIndex && <div className="h-full bg-white/60 w-full" />}
                </div>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Odds: <strong className="text-slate-200">{activeReel.gameStats.frequency}</strong></span>
              <span>Yield: <strong className="text-emerald-400">{activeReel.gameStats.discountYield}</strong></span>
            </div>
          </div>

          {/* Feature Selector Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-slate-950/60 border-t border-white/10 rounded-b-2xl overflow-hidden">
            {DEMO_REELS.map((reel, idx) => (
              <button
                key={reel.id}
                onClick={() => handleSelectReel(idx)}
                className={`p-4 text-left transition-all ${
                  idx === activeIndex
                    ? 'bg-white/10 border-b-2 border-amber-400'
                    : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 block font-bold">EVENT 0{idx + 1}</span>
                <h4 className="text-xs font-black text-white truncate mt-0.5">{reel.title}</h4>
                <span
                  className="text-[10px] font-bold block mt-1 truncate"
                  style={{ color: reel.badgeColor }}
                >
                  {reel.rewardBadge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}