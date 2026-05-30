import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Building2, Crown, Star, Rocket } from "lucide-react";

// ── User/Developer Subscription Tiers ─────────────────────────────────────────
const USER_PLANS = [
  {
    key: "free",
    name: "Developer Free",
    price: 0,
    trialMonths: 1,
    icon: Zap,
    description: "One free month to explore the platform. Browse and install components — downloads unlock with a paid subscription.",
    features: [
      "1 month free access",
      "Browse entire marketplace",
      "1 API key (1 agent pairing)",
      "Install & test components (no download)",
      "Community support",
      "Upgrade anytime",
    ],
    highlight: false,
    cta: "Start Free",
    badge: "Free for 1 Month",
  },
  {
    key: "starter",
    name: "Developer Starter",
    price: 29,
    icon: Shield,
    description: "Full access for growing developers — download components and scale your API usage.",
    features: [
      "1,000 API calls / month",
      "Access to all X1 & X2 components",
      "Download & deploy components",
      "Multiple API keys (1 agent per key)",
      "Standard latency",
      "Community support",
      "JSON & webhook output",
    ],
    highlight: false,
    cta: "Get Starter",
  },
  {
    key: "pro",
    name: "Developer Pro",
    price: 99,
    icon: Building2,
    description: "Built for teams with high throughput and priority support needs.",
    features: [
      "10,000 API calls / month",
      "All component types (X1, X2, X4)",
      "Download & deploy all components",
      "Multiple API keys (1 agent per key)",
      "Priority latency queue",
      "Email support (24h SLO)",
      "Usage analytics dashboard",
      "Webhook retries",
    ],
    highlight: true,
    cta: "Start Pro",
    badge: "Most Popular",
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

function PlanCard({ plan, onSubscribe, loading, type }) {
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

      <div className="flex items-end gap-1 mb-2">
        <span className={`text-4xl font-black ${isHighlight ? "text-white" : "text-slate-900"}`}>${plan.price}</span>
        <span className={`text-sm mb-1 ${isHighlight ? "text-slate-400" : "text-slate-400"}`}>/month</span>
      </div>

      {type === "builder" && plan.revenueShare && (
        <div className={`text-xs font-bold mb-4 px-2 py-1 rounded-lg inline-block ${isHighlight ? "bg-violet-600 text-white" : "bg-emerald-50 text-emerald-700"}`}>
          Up to {plan.revenueShare} Revenue Share
        </div>
      )}

      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlight ? "text-violet-400" : "text-emerald-500"}`} />
            <span className={isHighlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
          </li>
        ))}
      </ul>

      {type === "builder" && plan.revenueDetail && (
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
  const [tab, setTab] = useState("user");

  const handleSubscribe = async (planKey) => {
    if (planKey === "free") {
      window.location.href = "/dashboard";
      return;
    }
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

  const plans = tab === "user" ? USER_PLANS : BUILDER_PLANS;

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
        <h1 className="text-4xl font-black text-slate-900 mb-3">Simple, Transparent Pricing</h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Developers get 1 free month. Builders earn up to 85% revenue share. One monthly subscription per account, no matter how many API keys you create.
        </p>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setTab("user")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === "user" ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}
          >
            Developer Plans
          </button>
          <button
            onClick={() => setTab("builder")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === "builder" ? "bg-violet-700 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"}`}
          >
            Builder Plans
          </button>
        </div>
      </div>

      {/* Key rule callout */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3">
          <Rocket className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>One subscription, unlimited keys:</strong> You can create as many API keys as you need — each key can be paired with a different agent — but all keys on your account count toward a single monthly subscription. Builders get their first month free with full marketplace listing rights, no component downloads required.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <PlanCard key={plan.key} plan={plan} onSubscribe={handleSubscribe} loading={loading} type={tab} />
        ))}
      </div>

      {/* Builder revenue matrix callout */}
      {tab === "builder" && (
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
      )}

      <div className="text-center pb-12 text-xs text-slate-400">
        All plans billed monthly. Builders: first month free with full marketplace listing rights. Cancel anytime.
      </div>
    </div>
  );
}