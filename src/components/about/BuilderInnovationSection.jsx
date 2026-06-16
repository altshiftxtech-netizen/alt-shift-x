import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Beaker, GitBranch, ShieldCheck, Rocket, ArrowRight, BookOpen, Award } from "lucide-react";

const PROCESS = [
  { icon: Beaker, step: "01", title: "Innovate freely", body: "Bring the bleeding edge — novel models, unconventional pipelines, the idea nobody else dared to ship. Invention is welcome here." },
  { icon: GitBranch, step: "02", title: "Prove it the same way, every time", body: "New or not, it runs the identical gauntlet: benchmarks against real inputs, Do-No-Harm audit, trust scoring. The process never bends." },
  { icon: ShieldCheck, step: "03", title: "Earn the mark", body: "Pass and you carry a verified, trust-scored badge buyers already believe in. Your reputation rides on a standard they trust." },
  { icon: Rocket, step: "04", title: "Ship to a market that's ready", body: "Land in front of operators who came here precisely because everything is vetted — warm demand, not cold outreach." },
];

export default function BuilderInnovationSection() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-black/40 via-violet-900/20 to-black/40 backdrop-blur-md p-8 md:p-12">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-white/20">
            <Rocket className="w-3.5 h-3.5" /> For Builders
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Build the future. Ship it the trusted way.
          </h2>
          <p className="text-white/70 leading-relaxed">
            Innovation and discipline aren't opposites here — they're the deal. You get the freedom to build something
            genuinely new, and the credibility of a process every component passes through, no exceptions. That's why
            buyers trust what carries our mark, and why your work sells faster because of it.
          </p>
        </div>

        {/* 76 years of knowledge → meet or exceed the Magna Doctrine */}
        <div className="mb-10 rounded-2xl border border-violet-400/30 bg-gradient-to-r from-violet-600/20 via-white/5 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-violet-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-violet-200 text-xs font-bold uppercase tracking-widest mb-2">
                <Award className="w-3.5 h-3.5" /> 76 Years of Compounded Knowledge
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                Upload with 76 years of knowledge behind you.
              </h3>
              <p className="text-white/70 leading-relaxed">
                When you bring a component to Alt+Shift+X, you're not building alone. Every upload is reinforced by
                <span className="text-white font-semibold"> 76 years of accumulated operational, strategic, and engineering knowledge</span> —
                distilled into the standards, audits, and frameworks your work runs through. That depth doesn't just help your
                product <span className="text-white font-semibold">meet the Magna Doctrine</span> — it's engineered to help it
                <span className="text-violet-300 font-semibold"> accomplish and exceed it</span>. The result is a component that ships
                sharper, safer, and more trusted than it could ever be on its own.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS.map(({ icon: Icon, step, title, body }) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-violet-400/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-violet-300" />
                </div>
                <span className="text-2xl font-black text-white/15">{step}</span>
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/builder">
            <Button className="h-11 px-6 bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2">
              Start building <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" className="h-11 px-6 text-sm bg-white/5 border-white/25 text-white hover:bg-white/15">
              See builder revenue share
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}