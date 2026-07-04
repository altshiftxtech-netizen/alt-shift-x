import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Shield, Building2, Crown, Star, Rocket, FileText, BrainCircuit, Sparkles } from "lucide-react";
import PricingSharePanel from "@/components/pricing/PricingSharePanel";
import Logo from "@/components/Logo";
import SiteContentBlock from "@/components/site-content/SiteContentBlock";

// ── Developer: free account, pay per component ────────────────────────────────
const COMPONENT_TIERS = [
  {
    type: "X1",
    label: "X1 — Reading Protocols",
    color: "bg-violet-50 border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    price: "From $49/mo",
    description: "Single-purpose AI reading & extraction protocols. Pay only for what you install.",
    examples: ["Ironclad Protocol", "Ledger Protocol", "Cerebral Training"],
  },
  {
    type: "X2",
    label: "X2 — Prophecy Models",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    price: "From $99/mo",
    description: "Developer-grade AI build agents — production-ready code, one-shot scaffolds, and disciplined engineering.",
    examples: ["1 Take Jay", "The App Printer", "Miyagi San"],
  },
  {
    type: "X4",
    label: "X4 — Reason Councils",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    price: "From $129/mo",
    description: "Multi-agent reasoning councils for complex strategy and operational data.",
    examples: ["The Site Board", "Overwatch"],
  },
];

// ── Builder Subscription Tiers (Revenue Share Matrix) ─────────────────────────
// Premium ladder: Free → $49 → $199 → $599. Top tier unlocks Platform Intelligence.
// Free tier = browse + Do-No-Harm API install + 1 component publish (no website, no Foundation Kit).
const BUILDER_PLANS = [
  {
    key: "free_builder",
    name: "Free Builder",
    price: 0,
    free: true,
    icon: Rocket,
    revenueShare: "70%",
    revenueDetail: "70% base revenue share on your one published component.",
    description: "Get started for free. Browse, install Do-No-Harm components to your API, and publish your first component.",
    features: [
      "Browse the full marketplace",
      "Do-No-Harm install to API",
      "Publish 1 component",
      "70% base revenue share",
      "Component analytics (basic)",
    ],
    notIncluded: [
      "Custom website / profile links",
      "altshiftx.tech Builder Foundation Kit",
      "Platform Intelligence access",
    ],
    highlight: false,
    cta: "Start Free",
  },
  {
    key: "base_operator",
    name: "Base Operator",
    price: 49,
    icon: Zap,
    revenueShare: "72%",
    revenueDetail: "70% base + 2% verified bonus",
    description: "Unlock unlimited publishing, your public builder website, and the Foundation Kit.",
    features: [
      "Everything in Free Builder",
      "Publish unlimited components",
      "Custom website + profile links",
      "altshiftx.tech Builder Foundation Kit",
      "+2% certification bonus (if verified)",
      "Access to BOT-X test agent",
      "Version control & changelogs",
      "1 free month — list to marketplace immediately",
    ],
    highlight: false,
    cta: "Become a Builder",
  },
  {
    key: "strategic_architect",
    name: "Strategic Architect",
    price: 199,
    icon: Star,
    revenueShare: "77.5%",
    revenueDetail: "70% base + 5% verified + 2.5% volume rebate (>$10k/mo)",
    description: "For serious builders scaling revenue with multiple high-performing components.",
    graceDays: 14,
    features: [
      "14-day grace period — build before you're billed",
      "Everything in Base Operator",
      "Foundation Kit — evolving advanced modules",
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
    price: 599,
    icon: Crown,
    revenueShare: "85%",
    revenueDetail: "70% base + 10% verified + 5% volume rebate (>$50k/mo) + 100% Pedigree Premium",
    description: "Elite tier — the only plan with full Platform Intelligence access.",
    graceDays: 14,
    features: [
      "14-day grace period — build before you're billed",
      "Everything in Strategic Architect",
      "★ Platform Intelligence access (exclusive)",
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
    badge: "Intelligence",
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

function PlanCard({ plan, onSubscribe, onPaypal, loading }) {
  const Icon = plan.icon;
  const isHighlight = plan.highlight;
  const isFree = plan.free;

  return (
    <div className={`relative rounded-2xl border p-6 flex flex-col ${isHighlight ? "bg-slate-900 text-white border-slate-900 shadow-2xl lg:scale-105" : isFree ? "bg-slate-50 border-dashed border-slate-300" : "bg-white border-slate-200 shadow-sm"}`}>
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${plan.badge === "Intelligence" ? "bg-amber-500" : "bg-violet-600"}`}>
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
        {!isFree && <span className={`text-sm mb-1 ${isHighlight ? "text-slate-400" : "text-slate-400"}`}>/month</span>}
        {isFree && <span className="text-sm mb-1 text-slate-400">forever</span>}
      </div>
      <div className={`text-xs font-bold mb-3 px-2 py-1 rounded-lg inline-block ${isHighlight ? "bg-violet-600 text-white" : "bg-emerald-50 text-emerald-700"}`}>
        Up to {plan.revenueShare} Revenue Share
      </div>
      {plan.graceDays && (
        <div className={`text-[11px] font-semibold mb-4 px-2 py-1 rounded-lg inline-flex items-center gap-1.5 ${isHighlight ? "bg-amber-400/20 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
          <Shield className="w-3 h-3 shrink-0" /> {plan.graceDays}-day grace period included
        </div>
      )}
      <ul className="space-y-2.5 mb-4 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isHighlight ? "text-violet-400" : "text-emerald-500"}`} />
            <span className={isHighlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
          </li>
        ))}
        {plan.notIncluded?.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <X className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
            <span className="text-slate-400 line-through">{f}</span>
          </li>
        ))}
      </ul>
      {plan.revenueDetail && (
        <p className={`text-[10px] mb-4 ${isHighlight ? "text-slate-400" : "text-slate-400"}`}>{plan.revenueDetail}</p>
      )}
      {isFree ? (
        <Link to="/register" className="w-full">
          <Button className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
            {plan.cta}
          </Button>
        </Link>
      ) : (
        <>
          <Button
            onClick={() => onSubscribe(plan.key)}
            disabled={loading === plan.key || loading === `pp_${plan.key}`}
            className={`w-full font-semibold ${isHighlight ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
          >
            {loading === plan.key ? "Redirecting..." : `${plan.cta} (Card)`}
          </Button>
          <Button
            onClick={() => onPaypal(plan.key)}
            disabled={loading === plan.key || loading === `pp_${plan.key}`}
            className="w-full font-semibold mt-2 bg-[#ffc439] hover:bg-[#f0b72e] text-[#003087]"
          >
            {loading === `pp_${plan.key}` ? "Redirecting..." : "Pay with PayPal"}
          </Button>
          {plan.graceDays && (
            <p className={`text-[10px] text-center mt-2 ${isHighlight ? "text-slate-400" : "text-slate-400"}`}>
              No charge for {plan.graceDays} days · cancel anytime during grace
            </p>
          )}
        </>
      )}
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

  const handleBuilderPaypal = async (planKey) => {
    if (isInIframe()) {
      alert("Checkout is only available from the published app. Please open the live URL to subscribe.");
      return;
    }
    setLoading(`pp_${planKey}`);
    const res = await base44.functions.invoke("createPaypalCheckout", { planKey });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert("Something went wrong with PayPal. Please try again.");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <Logo className="h-9 w-auto" />
        <div className="flex items-center gap-3">
          <Link to="/marketplace" className="text-sm text-slate-500 hover:text-slate-800">Marketplace</Link>
          <PricingSharePanel />
          <Link to="/expertmind">
            <Button
              size="sm"
              className="text-xs gap-1.5 font-semibold text-[#062b27] border"
              style={{
                background: "#39E6B0",
                borderColor: "#5CF2C4",
                boxShadow: "0 0 12px rgba(57,230,176,0.6), 0 0 4px rgba(57,230,176,0.9) inset",
              }}
            >
              <BrainCircuit className="w-3.5 h-3.5" /> ExpertMind
            </Button>
          </Link>
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
          Developers sign up for free and only pay for the components they attach to their API keys. Builders start free and climb a premium ladder — the top tier unlocks Platform Intelligence and earns up to 85% revenue share.
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
                { step: "3", title: "Attach & pay", desc: "Attach a component to your API key. A monthly subscription starts only for that component. Paid accounts can also download all owned components as a ZIP (full schema + JSON)." },
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
          <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUILDER_PLANS.map(plan => (
              <PlanCard key={plan.key} plan={plan} onSubscribe={handleBuilderSubscribe} onPaypal={handleBuilderPaypal} loading={loading} />
            ))}
          </div>

          {/* Speakeasy perk — unlocked on any paid tier */}
          <div className="max-w-4xl mx-auto px-4 pb-12">
            <div className="rounded-2xl border border-[#C8A95B]/40 bg-gradient-to-br from-[#1a1109] to-[#0f0a06] px-6 py-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#C8A95B]/15 border border-[#C8A95B]/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#E6C878]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B] mb-1">Platinum Perk · Included</p>
                <p className="text-sm font-bold text-[#E8DFC8] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  The Speakeasy — a members-only Founders' Room
                </p>
                <p className="text-xs text-[#9CA0A8] leading-relaxed">
                  Every paid tier unlocks the Speakeasy: an immersive Founders' Room with a robot barkeep, portrait hallways, business meetups at The Table, Circles, Raffles, and the Expertminds Vault. Explore for an invisible scavenger hunt — hidden seeds with no on-screen markers — and climb the Brass &amp; Noir <strong className="text-[#E6C878]">Founder's Board</strong> leaderboard, ranked by seeds found and tie-broken by your Platform Trust Score.
                </p>
              </div>
            </div>
          </div>

          {/* Builder revenue matrix */}
          <div className="max-w-4xl mx-auto px-4 pb-20">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Revenue Share Matrix — Magna Dev / Alt+Shift+X</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th scope="col" className="text-left py-2 pr-4 text-slate-500 font-semibold">Builder Tier</th>
                      <th scope="col" className="text-center py-2 pr-4 text-slate-500 font-semibold">Base Payout</th>
                      <th scope="col" className="text-center py-2 pr-4 text-slate-500 font-semibold">Certification Bonus</th>
                      <th scope="col" className="text-center py-2 pr-4 text-slate-500 font-semibold">Volume Rebate</th>
                      <th scope="col" className="text-center py-2 text-slate-500 font-semibold">Total Potential</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800">Free Builder <span className="text-[9px] text-slate-400">($0)</span></td>
                      <td className="text-center py-2.5 pr-4 text-slate-600">70%</td>
                      <td className="text-center py-2.5 pr-4 text-slate-400">N/A</td>
                      <td className="text-center py-2.5 pr-4 text-slate-400">N/A</td>
                      <td className="text-center py-2.5 font-bold text-emerald-700">70%</td>
                    </tr>
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

      {/* Enterprise & DPA — for companies processing personal data through the platform */}
      <div className="max-w-3xl mx-auto px-4 pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-1">Enterprise & Data Processing Agreements</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Companies processing personal data through Alt+Shift+X can execute a Data Processing Agreement (DPA) covering GDPR/UK GDPR obligations, sub-processors, and security commitments. For a countersigned DPA, custom enterprise terms, or volume pricing, contact our team.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="mailto:info@altshiftx.tech?subject=Data%20Processing%20Agreement%20Request">
                <Button size="sm" variant="outline" className="text-xs gap-1.5"><FileText className="w-3.5 h-3.5" /> Request a DPA</Button>
              </a>
              <Link to="/legal/dpa" className="text-xs text-violet-600 font-semibold hover:underline">Read the DPA →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live pricing-page legal notice (managed by The UpKeeper) */}
      <div className="max-w-3xl mx-auto px-4 pb-6">
        <SiteContentBlock contentKey="sanctions_tos_clause" short className="text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl p-4" />
      </div>

      <div className="text-center pb-12 text-xs text-slate-400">
        Developers: free account, pay per component. Builders: first month free with full marketplace listing rights. Cancel anytime.
      </div>
    </div>
  );
}