import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, Clock, ShieldCheck, ArrowRight } from "lucide-react";

// Each card sells the platform while quietly seeding *how* and *when* to deploy a component —
// the use-case is woven into the value, not pitched as a manual.
const USE_CASES = [
  {
    icon: Building2,
    title: "Launch a brand that looks ten years ahead",
    body: "The day you open your doors, an installed Reading Protocol is already turning client documents into clean data — so your small team moves like an enterprise from hour one.",
  },
  {
    icon: TrendingUp,
    title: "Scale without scaling your headcount",
    body: "When demand spikes and hiring can't keep pace, a Prophecy Model quietly forecasts the load and a Speed Profile absorbs it — growth handled before it becomes a fire.",
  },
  {
    icon: Clock,
    title: "Win the deal in the room",
    body: "Mid-pitch, a Reason Council pressure-tests your proposal live, so the answer you give the client is the one you can defend later. Trust closes business.",
  },
  {
    icon: ShieldCheck,
    title: "Put your name on something safe",
    body: "Every install you build your business on is already trust-scored and audited — so the brand you're staking your reputation on never inherits someone else's risk.",
  },
];

export default function BuyerBrandSection() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-white/10 text-violet-200 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-white/20">
          <Building2 className="w-3.5 h-3.5" /> For Operators & Founders
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          You're not buying a tool. You're building a business.
        </h2>
        <p className="text-white/70 leading-relaxed">
          An install isn't a gadget — it's leverage. Each one drops a verified capability straight into your
          operation, so the brand you're building runs on infrastructure you'd never have to apologize for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {USE_CASES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-violet-400/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/marketplace">
          <Button className="h-12 px-7 bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2 shadow-lg shadow-violet-900/40">
            Find the install that grows your brand <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}