import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Building2 } from "lucide-react";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 29,
    icon: Zap,
    description: "Perfect for individual developers exploring the platform.",
    features: [
      "1,000 API calls / month",
      "Access to all X1 & X2 components",
      "Standard latency",
      "Community support",
      "JSON & webhook output",
    ],
    highlight: false,
    cta: "Get Started",
  },
  {
    key: "pro",
    name: "Pro",
    price: 99,
    icon: Shield,
    description: "Built for growing teams with higher throughput needs.",
    features: [
      "10,000 API calls / month",
      "Access to all component types",
      "Priority latency queue",
      "Email support (24h SLO)",
      "Usage analytics dashboard",
      "Webhook retries",
    ],
    highlight: true,
    cta: "Start Pro",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 299,
    icon: Building2,
    description: "Unlimited scale with SLA guarantees and dedicated support.",
    features: [
      "Unlimited API calls",
      "All component types + early access",
      "Dedicated latency lane",
      "Dedicated support engineer",
      "Custom SLA & contract",
      "SSO / SAML support",
      "Audit logs",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export default function Pricing() {
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (planKey) => {
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
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white text-xs font-black">A</span>
          </div>
          <span className="font-bold text-slate-900 text-sm hidden sm:block">Alt+Shift+X</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/marketplace" className="text-sm text-slate-500 hover:text-slate-800">Marketplace</Link>
          <Link to="/dashboard">
            <Button size="sm" variant="outline" className="text-xs">Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          Developer API Access
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3">Simple, Predictable Pricing</h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Subscribe to get API access to Alt+Shift+X's verified AI components. All plans include a 7-day free trial.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(({ key, name, price, icon: Icon, description, features, highlight, cta }) => (
          <div
            key={key}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              highlight
                ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-105"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${highlight ? "bg-white/10" : "bg-slate-100"}`}>
              <Icon className={`w-5 h-5 ${highlight ? "text-white" : "text-slate-600"}`} />
            </div>

            <h2 className={`text-lg font-bold mb-1 ${highlight ? "text-white" : "text-slate-900"}`}>{name}</h2>
            <p className={`text-xs mb-4 ${highlight ? "text-slate-300" : "text-slate-500"}`}>{description}</p>

            <div className="flex items-end gap-1 mb-6">
              <span className={`text-4xl font-black ${highlight ? "text-white" : "text-slate-900"}`}>${price}</span>
              <span className={`text-sm mb-1 ${highlight ? "text-slate-400" : "text-slate-400"}`}>/month</span>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-violet-400" : "text-emerald-500"}`} />
                  <span className={highlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe(key)}
              disabled={loading === key}
              className={`w-full font-semibold ${
                highlight
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {loading === key ? "Redirecting..." : cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center pb-12 text-xs text-slate-400">
        All plans include a 7-day free trial. Cancel anytime. Billed monthly.
      </div>
    </div>
  );
}