import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Star, Activity, BadgeCheck, Heart, ArrowRight, Sparkles,
} from "lucide-react";

// Confidence-building explanation of the Trust Engine + Verified Rating systems.
// Deliberately describes WHAT they guarantee for the buyer — never the proprietary
// scoring math, weights, or internal signals (the IP stays protected).
const TRUST_FACETS = [
  { icon: Activity, label: "Performance", body: "Does it actually deliver — accurately, consistently, at speed — on real inputs, not cherry-picked demos." },
  { icon: ShieldCheck, label: "Safety", body: "Continuously audited for Do-No-Harm compliance, so what you install can't quietly work against you." },
  { icon: Heart, label: "Satisfaction", body: "Built from how real operators actually experience it — not marketing, not promises." },
  { icon: BadgeCheck, label: "Retention", body: "People who install it keep using it. Staying power is the hardest signal to fake, and we weigh it." },
];

export default function TrustRatingSection() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-violet-900/30 via-black/40 to-black/40 backdrop-blur-md p-8 md:p-12">
        {/* Heading */}
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> How you know you can trust it
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            You don't have to take a leap of faith. The proof is already done.
          </h2>
          <p className="text-white/70 leading-relaxed">
            Here's the relief: by the time a component reaches you, the hard part of trusting it is already finished.
            Every listing carries a <span className="text-white font-semibold">Trust Score</span> and a{" "}
            <span className="text-white font-semibold">Verified Rating</span> — two independent systems that quietly do
            the vetting most marketplaces leave entirely up to you. You get to choose with confidence, not cross your fingers.
          </p>
        </div>

        {/* Two systems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* Trust Score */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-violet-200" />
              </div>
              <h3 className="text-white font-black text-lg">The Trust Score</h3>
            </div>
            <p className="text-white/65 text-sm leading-relaxed mb-5">
              A single, living number that tells you how much a component has earned your confidence. It's not a star a
              builder gave themselves — it's an ongoing measurement that updates as the component proves itself in the real
              world. If quality slips, the score reflects it. If it stays excellent, the score holds. The exact engine is
              ours; what it gives you is dead simple: <span className="text-white font-semibold">higher means safer to install.</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TRUST_FACETS.map(({ icon: Icon, label, body }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-violet-300" />
                    <span className="text-white text-xs font-bold">{label}</span>
                  </div>
                  <p className="text-white/50 text-[11px] leading-snug">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Rating */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-violet-200" />
              </div>
              <h3 className="text-white font-black text-lg">The Verified Rating</h3>
            </div>
            <p className="text-white/65 text-sm leading-relaxed mb-5">
              Ratings here mean something because they can't be gamed. They come from genuine, verified usage — not anonymous
              drive-by reviews, not bought stars, not bot swarms. When you see a rating on Alt+Shift+X, real operators put it
              there, and our systems confirm it before it ever counts.
            </p>
            <div className="space-y-3">
              {[
                "Tied to real, verified installs — not anonymous opinions",
                "Filtered for manipulation, fakes, and review fraud",
                "Refreshed continuously, so it reflects the product as it is today",
                "Read alongside the Trust Score for a complete, honest picture",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5">
                  <BadgeCheck className="w-4 h-4 text-violet-300 mt-0.5 shrink-0" />
                  <span className="text-white/65 text-sm leading-snug">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reassurance closer */}
        <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-600/20 via-white/5 to-transparent p-6 md:p-7 mb-9">
          <p className="text-white/85 text-base md:text-lg leading-relaxed font-medium">
            So breathe easy — and get excited. The thing you'd normally lose sleep over, “is this AI actually trustworthy?”,
            is already answered before you ever click install. Every component here arrives pre-vouched, scored, and verified.
            All that's left for you is the fun part: <span className="text-violet-300 font-semibold">picking the one that fires you up.</span>
          </p>
        </div>

        <Link to="/marketplace">
          <Button className="h-11 px-6 bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2 shadow-lg shadow-violet-900/40">
            See the scores for yourself <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}