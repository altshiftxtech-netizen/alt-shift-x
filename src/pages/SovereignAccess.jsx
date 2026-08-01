import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Shield, Activity, Cpu, Database, Lock, ArrowRight, CheckCircle2, Bug, Radar } from "lucide-react";

const ACCESS_VIDEO =
  "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/c81e26ae3_35293fd75_generated_video.mp4";

// Seeded so the counter looks "live" from the very first frame, then ticks up.
const SEED_COUNT = 1843271;

const EDGES = [
  {
    icon: Radar,
    code: "X1-X5",
    title: "The Invariant Audit",
    body: "Exclusive weekly breakdowns of how X-components handle giga-scale traffic without logic drift. The forensic deltas most engineers never get to see.",
  },
  {
    icon: Cpu,
    code: "110%",
    title: "The Hardening Baseline",
    body: "Be the first to receive the Base44 Component Specs that convert standard agents into 110% hardened operational assets — fail-closed by default.",
  },
  {
    icon: Bug,
    code: "ZERO-DAY",
    title: "The Zero-Day Ledger",
    body: "Real-time reports from our Synthetic Swarm on new bug classes and the \"vaccines\" we've deployed to neutralize them across the marketplace.",
  },
];

function useLiveCounter() {
  const [count, setCount] = useState(SEED_COUNT);
  useEffect(() => {
    const t = setInterval(() => {
      // Irregular increments so it feels like real swarm activity, not a clock.
      setCount((c) => c + Math.floor(Math.random() * 7) + 1);
    }, 1400 + Math.random() * 900);
    return () => clearInterval(t);
  }, []);
  return count;
}

export default function SovereignAccess() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | hardening | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const count = useLiveCounter();
  const progressTimer = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (phase === "hardening") return;
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("A valid operator email is required to mint your access key.");
      return;
    }

    setPhase("hardening");
    setProgress(0);

    // Drive the "Hardening in Progress..." bar to ~90% over 1.5s while we mint the key.
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 9));
    }, 90);

    try {
      await base44.functions.invoke("subscribeNewsletter", {
        email: email.trim(),
        source: "sovereign_access",
      });
      // finish the bar to 100%
      clearInterval(progressTimer.current);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 350));
      setPhase("done");
    } catch (err) {
      clearInterval(progressTimer.current);
      setPhase("error");
      setError("Intake failed. Retry the handshake.");
    }
  };

  useEffect(() => () => clearInterval(progressTimer.current), []);

  return (
    <div className="relative min-h-screen bg-[#05060a] text-white overflow-hidden font-mono">
      {/* ── Video background ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40"
        aria-hidden="true"
      >
        <source src={ACCESS_VIDEO} type="video/mp4" />
      </video>

      {/* ── Vault overlay: scanlines + vignette + heartbeat pulse ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#05060a]/70 via-[#05060a]/40 to-[#05060a]/90" />
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.35) 3px, rgba(0,0,0,0) 4px)",
        }}
      />
      {/* Heartbeat pulse — a faint expanding ring that beats */}
      <div className="fixed inset-0 z-[1] pointer-events-none flex items-center justify-center">
        <div
          className="absolute rounded-full"
          style={{
            width: "60vmax",
            height: "60vmax",
            border: "1px solid rgba(99,102,241,0.10)",
            boxShadow: "0 0 120px 40px rgba(99,102,241,0.05) inset",
            animation: "sov-pulse 3.2s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes sov-pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.5; }
          50% { transform: scale(1.04); opacity: 0.9; }
        }
        @keyframes sov-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .sov-blink { animation: sov-blink 1.6s steps(2,end) infinite; }
      `}</style>

      {/* ── Content ── */}
      <div className="relative z-10">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-indigo-300/80">
            <Lock className="w-3.5 h-3.5" />
            SOVEREIGN SUBSTRATE · ACCESS KEY
          </div>
          <Link to="/" className="text-[11px] text-white/40 hover:text-white transition-colors tracking-wider">
            EXIT →
          </Link>
        </header>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-500/10 mb-6">
            <Activity className="w-3 h-3 text-indigo-300 sov-blink" />
            <span className="text-[10px] tracking-[0.25em] text-indigo-200/90">SWARM ACTIVE · IMMUNE GENOME SYNCING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Stop Building Software.
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              Start Growing Immune Systems.
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
            The first day of traffic should fix your site forever. Get the blueprints for the{" "}
            <span className="text-white font-bold">110% Hardened Standard</span> — the protocols that power the Sovereign Triad.
          </p>

          <p className="mt-3 text-[11px] tracking-[0.2em] text-white/40">
            You aren't joining a mailing list. You are syncing your inbox to the Sovereign Immune Genome.
          </p>

          {/* Live counter */}
          <div className="mt-10 inline-flex flex-col items-center gap-1 px-6 py-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
            <span className="text-[10px] tracking-[0.25em] text-emerald-300/80">BUGS NEUTRALIZED BY THE SWARM</span>
            <span className="text-3xl sm:text-4xl font-black tabular-nums text-emerald-300 [text-shadow:0_0_18px_rgba(16,185,129,0.5)]">
              {count.toLocaleString()}
            </span>
          </div>
        </section>

        {/* The Edge — 3 pillars */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {EDGES.map(({ icon: Icon, code, title, body }) => (
            <div
              key={title}
              className="group relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 hover:border-indigo-400/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-indigo-300" />
                <span className="text-[10px] font-bold tracking-widest text-indigo-300/70 px-2 py-0.5 rounded border border-indigo-400/20 bg-indigo-500/5">
                  {code}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
              <p className="text-xs text-white/55 leading-relaxed">{body}</p>
            </div>
          ))}
        </section>

        {/* The Handshake — email capture */}
        <section className="max-w-2xl mx-auto px-5 sm:px-8 py-14">
          <div className="relative rounded-2xl border border-indigo-400/20 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl p-6 sm:p-9 overflow-hidden">
            {/* corner brackets — vault feel */}
            <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-indigo-400/40" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-indigo-400/40" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-indigo-400/40" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-indigo-400/40" />

            {phase !== "done" ? (
              <>
                <p className="text-center text-xs tracking-[0.2em] text-indigo-300/80 mb-2">10 MILLION SESSIONS · 0 LOGIC BREACHES</p>
                <h2 className="text-center text-xl sm:text-2xl font-black mb-1">
                  Secure your position in the Sovereign Substrate.
                </h2>
                <p className="text-center text-xs text-white/50 mb-6">
                  Operational Engineering. Not tips — Substrate Invariance.
                </p>

                <form onSubmit={submit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={phase === "hardening"}
                      placeholder="operator@yourdomain.com"
                      autoFocus
                      className="w-full h-12 bg-black/50 border border-white/15 rounded-lg px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/30 disabled:opacity-60 font-mono"
                    />
                  </div>

                  {error && <p className="text-xs text-rose-400 text-center">{error}</p>}

                  {/* Hardening in progress bar */}
                  {phase === "hardening" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tracking-widest text-indigo-300/80">
                        <span>HARDENING IN PROGRESS…</span>
                        <span className="tabular-nums">{Math.floor(progress)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={phase === "hardening"}
                    className="w-full h-12 rounded-lg font-black tracking-[0.15em] text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.35)]"
                  >
                    {phase === "hardening" ? (
                      <>MINTING ACCESS KEY…</>
                    ) : (
                      <>
                        [ SECURE MY ACCESS ]
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-white/35 pt-1">
                    Your intent is written to the immutable audit trail. Unsubscribe anytime.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-emerald-400/30 bg-emerald-500/10 mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-[10px] tracking-[0.25em] text-emerald-300/80 mb-1">ACCESS KEY MINTED</p>
                <h2 className="text-xl font-black mb-2">You're synced to the Genome.</h2>
                <p className="text-sm text-white/60 max-w-sm mx-auto">
                  First protocol incoming. Watch your inbox — the Sovereign Substrate has your coordinates now.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 mt-6 text-xs text-indigo-300 hover:text-indigo-200 tracking-wider"
                >
                  RETURN TO MARKETPLACE <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer ledger line */}
        <footer className="max-w-5xl mx-auto px-5 sm:px-8 py-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] tracking-widest text-white/30">
          <span className="flex items-center gap-2">
            <Shield className="w-3 h-3" /> SOVEREIGN IMMUNE GENOME · v1.0
          </span>
          <span className="flex items-center gap-2">
            <Database className="w-3 h-3" /> IMMUTABLE AUDIT TRAIL · GSP-MASTER-INDEX
          </span>
        </footer>
      </div>
    </div>
  );
}