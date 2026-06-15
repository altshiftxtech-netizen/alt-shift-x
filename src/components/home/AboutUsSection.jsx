import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, Compass } from "lucide-react";

// Compelling About Us statement for Magna Dev × the Alt+Shift+X marketplace.
// Self-contained section dropped into the Home page.
export default function AboutUsSection() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
      <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-violet-900/40 via-white/5 to-black/40 backdrop-blur-md p-8 md:p-12 overflow-hidden">
        {/* glow accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Who we are
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">
            Built by <span className="text-violet-300">Magna Dev</span>.<br />
            Curated for the few who refuse to ship unverified AI.
          </h2>

          <div className="space-y-5 text-white/70 text-base md:text-lg leading-relaxed max-w-3xl">
            <p>
              <span className="text-white font-semibold">Alt+Shift+X</span> isn't another app store full of
              hopeful demos. It's a proving ground. Every component that earns a place here is benchmarked
              against reality, Do-No-Harm audited, and assigned a trust score before a single buyer ever sees it —
              because the gap between "it works in a notebook" and "it works on your job site" is exactly where
              most AI quietly fails.
            </p>
            <p>
              <span className="text-white font-semibold">Magna Dev</span> is the standard behind that standard.
              We engineer the reading protocols, prophecy models, reason councils, and complete agents that
              power serious operations — then we hold them to a discipline most of the industry skips. When a
              component carries our mark, it has been pressure-tested, versioned, and made accountable.
            </p>
            <p className="text-white/90 font-medium">
              We're not here to flood you with options. We're here to hand you the few you can actually trust —
              and stake our name on every one of them.
            </p>
          </div>

          {/* pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: ShieldCheck, title: "Verified, not vibes", body: "Every component benchmarked and Do-No-Harm audited before it's listed." },
              { icon: Compass, title: "Curated, not crowded", body: "A focused catalog of components worth your trust — no filler." },
              { icon: Sparkles, title: "Accountable by design", body: "Trust scores, versioning, and our name on the line for each build." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Icon className="w-6 h-6 text-violet-300 mb-3" />
                <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                <p className="text-white/55 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-10">
            <Link to="/marketplace">
              <Button className="h-11 px-6 bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2">
                Explore the marketplace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/white-paper">
              <Button variant="outline" className="h-11 px-6 text-sm bg-white/5 border-white/25 text-white hover:bg-white/15">
                Read our white paper
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}