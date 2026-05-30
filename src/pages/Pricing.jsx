import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Building2, Crown, Star, Rocket } from "lucide-react";

// ── Developer: free account, pay per component ────────────────────────────────
const COMPONENT_TIERS = [
  {
    type: "X1",
    label: "X1 — Single Extraction",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    price: "From $49/mo",
    description: "Single-purpose AI extraction components. Pay only for what you install.",
    examples: ["Ironclad Protocol", "Ledger Protocol", "Claim Sentinel"],
  },
  {
    type: "X2",
    label: "X2 — Project Intelligence",
    color: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    price: "From $59/mo",
    description: "Multi-layer project management and scheduling intelligence modules.",
    examples: ["Estimator's Eye", "Schedule Pulse"],
  },
  {
    type: "X4",
    label: "X4 — Reason Council",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    price: "From $49/mo",
    description: "Multi-agent reasoning components for complex site and operational data.",
    examples: ["The Site Board"],
  },
];

// ── Builder Subscription Tiers (Revenue Share Matrix) ─────────────────────────
const BUILDER_PLANS = [
  {
    key: "base_operator",
    name: "Base Operator",
    price: 49,
    icon: Zap,
    revenueShare: "72%",
    revenueDetail: "70% base + 2% verified bonus",
    description: "Start building and publishing Magna Dev components to the marketplace.",
    features: [
      "Publish unlimited components",
      "70% base revenue share",
      "+2% certification bonus (if verified)",
      "Access to BOT-X test agent",
      "Component analytics",
      "1 free month — list to marketplace immediately",
      "Version control & changelogs",
    ],
    highlight: false,
    cta: "Become a Builder",
  },
  {
    key: "strategic_architect",
    name: "Strategic Architect",
    price: 149,
    icon: Star,
    revenueShare: "77.5%",
    revenueDetail: "70% base + 5% verified + 2.5% volume rebate (>$10k/mo)",
    description: "For serious builders scaling revenue with multiple high-performing components.",
    features: [
      "Everything in Base Operator",
      "70% base revenue share",
      "+5% certification bonus (if verified)",
      "+2.5% volume rebate above $10k/month",
      "Bundle Protection (full share on discounted bundles)",
      "Priority review queue",
      "Advanced governance tools",
      "BOB AI advisor (full access)",
    ],
    highlight: true,
    cta: "Become a Strategist",
    badge: "Best Value",
  },
  {
    key: "sovereign_commander",
    name: "Sovereign Commander",
    price: 499,
    icon: Crown,
    revenueShare: "85%",
    revenueDetail: "70% base + 10% verified + 5% volume rebate (>$50k/mo) + 100% Pedigree Premium",
    description: "Maximum revenue extraction for elite builders with institutional-grade components.",
    features: [
      "Everything in Strategic Architect",
      "70% base revenue share",
      "+10% certification bonus (if verified)",
      "+5% volume rebate above $50k/month",
      "100% Pedigree Premium retention",
      "Moat Protection Modifier (40% price modifier for pedigree components)",
      "Multi-Agent Deployment Credit (X4 Small Corp)",
      "Mastery Badge eligibility (300% marketplace visibility boost)",
      "Dedicated platform support",
    ],
    highlight: false,
    cta: "Command the Market",
  },
];

function isInIframe() {
  try { return window.self !== window.top; } catch { return true; }
}

function ComponentTypeCard({ tier }) {
  return (
    <div className={`rounded-2xl border p-6 flex flex-col ${tier.color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tier.badge}`}>{tier.type}</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{tier.label}</h3>
      <p className="text-xs text-slate-500 mb-4">{tier.description}</p>
      <div className="text-2xl font-black text-slate-900 mb-4">{tier.price} <span className="text-sm font-normal text-slate-400">per component</span></div>
      <div className="text-xs text-slate-500 mb-1 font-semibold">Example components:</div>
      <ul className="space-y-1 flex-1">
        {tier.examples.map(e => (
          <li key={e} className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" />{e}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanCard({ plan, onSubscribe, loading }) {
  const Icon = plan.icon;
  const isHighlight = plan.highlight;

  return (
    <div className={`relative rounded-2xl border p-6 flex flex-col ${isHighlight ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-105" : "bg-white border-slate-200 shadow-sm"}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          {plan.badge}
        </div>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isHighlight ? "bg-white/10" : "bg-slate-100"}`}>
        <Icon className={`w-5 h-5 ${isHighlight ? "text-white" : "text-slate-600"}`} />
      </div>
      <h2 className={`text-lg font-bold mb-1 ${isHighlight ? "text-white" : "text-slate-900"}`}>{plan.name}</h2>
      <p className={`text-xs mb-4 ${isHighlight ? "text-slate-300" : "text-slate-500"}`}>{plan.description}</p>
      <div className="flex items-end gap-1 mb-6">
        <span className={`text-4xl font-black ${isHighlight ? "text-white" : "text-slate-900"}`}>${plan.price}</span>
        <span className={`text-sm mb-1 ${isHighlight ? "text-slate-400" : "text-slate-400"}`}>/month</span>
      </div>
      <div className={`text-xs font-bold mb-4 px-2 py-1 rounded-lg inline-block ${isHighlight ? "bg-violet-600 text-white" : "bg-emerald-50 text-emerald-700"}`}>
        Up to {plan.revenueShare} Revenue Share
      </div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlight ? "text-violet-400" : "text-emerald-500"}`} />
            <span className={isHighlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
          </li>
        ))}
      </ul>
      {plan.revenueDetail && (
        <p className={`text-[10px] mb-4 ${isHighlight ? "text-slate-400" : "text-slate-400"}`}>{plan.revenueDetail}</p>
      )}
      <Button
        onClick={() => onSubscribe(plan.key)}
        disabled={loading === plan.key}
        className={`w-full font-semibold ${isHighlight ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
      >
        {loading === plan.key ? "Redirecting..." : plan.cta}
      </Button>
    </div>
  );
}

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [tab, setTab] = useState("developer");

  const handleBuilderSubscribe = async (planKey) => {
    if (isInIframe()) {
      alert("Checkout is only available from the published app. Please open the live URL to subscribe.");
      return;
    }
    setLoading(planKey);
    const res = await base44.functions.invoke("createCheckoutSession", { planKey });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Something went wrong. Please try again.");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/f652c13a0_AltShiftXLogo.png" alt="Alt+Shift+X" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/marketplace" className="text-sm text-slate-500 hover:text-slate-800">Marketplace</Link>
          <Link to="/dashboard"><Button size="sm" variant="outline" className="text-xs">Dashboard</Button></Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center py-14 px-4">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          Magna Dev · Alt+Shift+X Marketplace
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3">Free to Join. Pay Per Component.</h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Developers sign up for free and only pay for the components they attach to their API keys. Builders earn up to 85% revenue share.
        </p>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setTab("developer")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === "developer" ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}
          >
            For Developers
          </button>
          <button
            onClick={() => setTab("builder")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === "builder" ? "bg-violet-700 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}
          >
            For Builders
          </button>
        </div>
      </div>

      {tab === "developer" && (
        <>
          {/* Free to join hero callout */}
          <div className="max-w-3xl mx-auto px-4 mb-10">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900 mb-1">Free to join — always.</p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Create your account, generate API keys, and browse the full marketplace at no cost. You only pay a monthly subscription for each component you choose to attach to an API key. Add more components anytime — each one is billed separately, per key.
                </p>
                <Link to="/dashboard">
                  <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">Create Free Account →</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="max-w-4xl mx-auto px-4 mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-5 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Sign up free", desc: "Create your account and generate your first API key — no credit card required." },
                { step: "2", title: "Browse & choose", desc: "Explore the marketplace. Pick the components that match your project needs." },
                { step: "3", title: "Attach & pay", desc: "Attach a component to your API key. A monthly subscription starts only for that component." },
              ].map(s => (
                <div key={s.step} className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-black flex items-center justify-center mx-auto mb-3">{s.step}</div>
                  <p className="font-bold text-slate-900 text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Component type pricing */}
          <div className="max-w-4xl mx-auto px-4 mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-2 text-center">Component Pricing</h2>
            <p className="text-xs text-slate-500 text-center mb-6">Each component has its own monthly price. You pay only for what you use, per API key.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COMPONENT_TIERS.map(tier => (
                <ComponentTypeCard key={tier.type} tier={tier} />
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 mb-14">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3">
              <Rocket className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>One subscription per component per key:</strong> You can create multiple API keys and pair each with a different agent. Each component you attach to a key generates its own monthly charge. Browse the <Link to="/marketplace" className="underline">marketplace</Link> to see exact pricing per component.
              </p>
            </div>
          </div>
        </>
      )}

      {tab === "builder" && (
        <>
          {/* Builder plans */}
          <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {BUILDER_PLANS.map(plan => (
              <PlanCard key={plan.key} plan={plan} onSubscribe={handleBuilderSubscribe} loading={loading} />
            ))}
          </div>

          {/* Builder revenue matrix */}
          <div className="max-w-4xl mx-auto px-4 pb-20">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Revenue Share Matrix — Magna Dev / Alt+Shift+X</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-slate-500 font-semibold">Builder Tier</th>
                      <th className="text-center py-2 pr-4 text-slate-500 font-semibold">Base Payout</th>
                      <th className="text-center py-2 pr-4 text-slate-500 font-semibold">Certification Bonus</th>
                      <th className="text-center py-2 pr-4 text-slate-500 font-semibold">Volume Rebate</th>
                      <th className="text-center py-2 text-slate-500 font-semibold">Total Potential</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800">Base Operator</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">70%</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">+2% (if verified)</td>
                      <td className="text-center py-2.5 pr-4 text-slate-400">N/A</td>
                      <td className="text-center py-2.5 font-bold text-emerald-700">72%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800">Strategic Architect</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">70%</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">+5% (if verified)</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">+2.5% (&gt;$10k/mo)</td>
                      <td className="text-center py-2.5 font-bold text-emerald-700">77.5%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800">Sovereign Commander</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">70%</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">+10% (if verified)</td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">+5% (&gt;$50k/mo)</td>
                      <td className="text-center py-2.5 font-bold text-emerald-700">85%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Platform absorbs bundle discounts from its 30% fee to protect builder share. Pedigree Premium (40% modifier) is retained 100% by Sovereign Commander builders. Mastery Badge grants 300% marketplace visibility boost.</p>
            </div>
          </div>
        </>
      )}

      <div className="text-center pb-12 text-xs text-slate-400">
        Developers: free account, pay per component. Builders: first month free with full marketplace listing rights. Cancel anytime.
      </div>
    </div>
  );
}