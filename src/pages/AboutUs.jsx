import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ShieldCheck, Sparkles, Compass, Target, Gem, Cpu, Eye,
  Layers, Award, Lock, Zap, LogIn, UserPlus,
} from "lucide-react";
import Logo from "@/components/Logo";
import VideoBackground from "@/components/VideoBackground";
import PlatformSocials from "@/components/PlatformSocials";
import LegalFooterLinks from "@/components/legal/LegalFooterLinks";
import BuilderInnovationSection from "@/components/about/BuilderInnovationSection";
import BuyerBrandSection from "@/components/about/BuyerBrandSection";
import { setSEOMeta, setBreadcrumbSchema } from "@/lib/seoHelpers";
import { useAuth } from "@/lib/AuthContext";

const PILLARS = [
  { icon: ShieldCheck, title: "Verified, not vibes", body: "Every component is benchmarked against real-world inputs and Do-No-Harm audited before it is ever listed. If it can't prove itself, it doesn't ship." },
  { icon: Compass, title: "Curated, not crowded", body: "We don't chase a giant catalog. We chase the right one — a focused shelf of components worth staking our name on." },
  { icon: Award, title: "Accountable by design", body: "Trust scores, full version history, and an auditable trail behind every build. Accountability isn't a feature here — it's the foundation." },
  { icon: Lock, title: "Safe by default", body: "Sensitive-intelligence guardrails, legal gating, and export-control discipline are wired in from the first line of code." },
];

const STANDARDS = [
  { icon: Cpu, label: "Reading Protocols", desc: "Structured extraction that turns messy documents into clean, decision-ready data." },
  { icon: Eye, label: "Prophecy Models", desc: "Forecasting engines tuned for operations where being wrong is expensive." },
  { icon: Zap, label: "Speed Profiles", desc: "Latency-optimized pipelines built for the pace of a live job site." },
  { icon: Layers, label: "Reason Councils", desc: "Multi-model deliberation that pressure-tests an answer before you act on it." },
];

export default function AboutUs() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setSEOMeta({
      title: "About Alt+Shift+X — Built by Magna Dev | Verified AI Components",
      description: "The story behind Alt+Shift+X and Magna Dev: a curated proving ground for verified, trust-scored, Do-No-Harm audited AI components. We hand you the few you can actually trust.",
      keywords: "about Alt+Shift+X, Magna Dev, verified AI marketplace, trust-scored AI components, Do-No-Harm audited AI, AI agents construction",
      robots: "index, follow",
    });
    setBreadcrumbSchema([
      { label: "Home", url: "https://altshiftx.com" },
      { label: "About", url: "https://altshiftx.com/about" },
    ]);
  }, []);

  return (
    <div className="min-h-screen relative">
      <VideoBackground />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-8 w-auto" variant="purple" />
        <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link to="/marketplace" className="hover:text-white">Marketplace</Link>
          <Link to="/about" className="text-white">About</Link>
          <Link to="/builder" className="hover:text-white">Build</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/dashboard"><Button className="text-sm h-8 bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><LogIn className="w-3.5 h-3.5" /> Dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button className="text-sm h-8 bg-white/15 hover:bg-white/25 border border-white/25 text-white gap-1.5 backdrop-blur-sm"><LogIn className="w-3.5 h-3.5" /> Sign in</Button></Link>
              <Link to="/register"><Button className="text-sm h-8 bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Sign up</Button></Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-7 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" /> Our Story
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-7 drop-shadow-lg">
          We don't sell AI.<br />
          <span className="text-violet-300">We vouch for it.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
          Alt+Shift+X is a proving ground built by <span className="text-white font-semibold">Magna Dev</span> —
          where AI earns the right to be trusted before it ever reaches your operation.
        </p>
      </section>

      {/* Origin / belief */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-violet-900/40 via-white/5 to-black/40 backdrop-blur-md p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
            The gap nobody wanted to own.
          </h2>
          <div className="space-y-5 text-white/75 text-base md:text-lg leading-relaxed">
            <p>
              Everywhere you look, AI "works." It works in a demo. It works in a notebook. It works in the
              screenshot on the landing page. And then it meets a real document, a real deadline, a real
              consequence — and the magic quietly falls apart.
            </p>
            <p>
              That gap — between <span className="text-white font-semibold">looks impressive</span> and{" "}
              <span className="text-white font-semibold">can be trusted</span> — is where most of the industry
              shrugs and ships anyway. We built Alt+Shift+X to stand exactly in that gap and refuse to move.
            </p>
            <p className="text-white/90 font-medium">
              Builders engineer the components. Alt+Shift+X is the gate they have to pass through. Nothing
              reaches you that hasn't earned it.
            </p>
            <p>
              And that gate isn't empty rigor — it's backed by{" "}
              <span className="text-white font-semibold">76 years of compounded operational, strategic, and engineering knowledge</span>.
              When a builder uploads to Alt+Shift+X, that depth is poured into their work through the standards,
              audits, and frameworks every component runs through — engineered not just to help a product{" "}
              <span className="text-white font-semibold">meet the Magna Doctrine</span>, but to{" "}
              <span className="text-violet-300 font-semibold">accomplish and exceed it</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Mission + Vision split */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
          <Target className="w-7 h-7 text-violet-300 mb-4" />
          <h3 className="text-xl font-black text-white mb-3">Our Mission</h3>
          <p className="text-white/70 leading-relaxed">
            To hand serious operators the few AI components they can actually trust — benchmarked, audited, and
            accountable — so they can move faster without betting the business on a black box.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
          <Gem className="w-7 h-7 text-violet-300 mb-4" />
          <h3 className="text-xl font-black text-white mb-3">Our Vision</h3>
          <p className="text-white/70 leading-relaxed">
            A world where "AI-powered" stops being a marketing word and starts being a guarantee — where a trust
            score means as much as a price tag, and a verified mark is the default, not the exception.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">What we stand on</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Four non-negotiables behind every component that carries our mark.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-violet-400/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-violet-300" />
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What Magna Dev builds */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl border border-white/15 bg-black/30 backdrop-blur-md p-8 md:p-12">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-white/20">
              <Cpu className="w-3.5 h-3.5" /> The craft
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              The standard behind the standard.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Magna Dev doesn't dabble. We engineer the layers that real operations depend on — then hold each one
              to a discipline most of the industry skips entirely.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {STANDARDS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{label}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For builders — innovation through a trusted process */}
      <BuilderInnovationSection />

      {/* For buyers building a brand/business — subliminal how & when to use */}
      <BuyerBrandSection />

      {/* The promise / pull quote */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <blockquote className="text-3xl md:text-5xl font-black text-white leading-tight">
          “We're not here to flood you with options.
          <br className="hidden md:block" />
          <span className="text-violet-300"> We're here to hand you the few you can trust</span> —
          and put our name on every one.”
        </blockquote>
        <p className="text-white/50 mt-8 text-sm uppercase tracking-widest">— Magna Dev × Alt+Shift+X</p>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 bg-black/40 backdrop-blur-sm py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Trust is the whole product.</h2>
        <p className="text-white/60 mb-9 max-w-xl mx-auto">
          Explore a marketplace where every component has already earned its place — or build one worthy of the mark.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/marketplace">
            <Button className="h-12 px-7 bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2 shadow-lg shadow-violet-900/40">
              Explore the marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/white-paper">
            <Button variant="outline" className="h-12 px-7 text-sm bg-white/5 border-white/25 text-white hover:bg-white/15">
              Read our white paper
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm py-8 text-center text-xs text-white/40 space-y-4">
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
          <Link to="/tutorials" className="hover:text-white">Tutorials</Link>
        </div>
        <LegalFooterLinks variant="light" />
        <PlatformSocials variant="light" />
        <p className="text-white/30">Powered by: Trust AR LLC.</p>
      </footer>
    </div>
  );
}