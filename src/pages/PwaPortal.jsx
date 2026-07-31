import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, ShieldCheck, Lock, ArrowRight, CheckCircle2, Loader2, FileText, Monitor, Bot } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import PwaInstallButton from "@/components/pwa/PwaInstallButton";
import PwaAgentInstallButton from "@/components/pwa/PwaAgentInstallButton";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// PWA-DASHBOARD-PORTAL-1.0 — tier-based install logic.
// TopTier (any active non-free subscription) → free "Install Now".
// Free tier → "Download Access" CTA to upgrade.
export default function PwaPortal() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (user?.id) {
          const subs = await base44.entities.Subscription.filter({ user_id: user.id });
          setSub(subs[0] || null);
        }
      } catch { /* guest */ }
      finally { setLoading(false); }
    })();

    // Register the Sovereign PWA service worker.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => setSwRegistered(true)).catch(() => {});
    }
  }, [user]);

  const isTopTier = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <SharedNav mode="user" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#343A40] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#F8F9FA]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#343A40]" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                Sovereign PWA Portal
              </h1>
              <p className="text-sm text-slate-500">Install Alt+Shift+X as a standalone desktop or mobile app.</p>
            </div>
          </div>
        </div>

        {/* Status row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Tier</p>
              <p className="text-sm font-bold text-[#343A40] mt-1">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isTopTier || isAdmin ? "TopTier (Free Install)" : "Free Tier"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Service Worker</p>
              <p className="text-sm font-bold text-[#343A40] mt-1 flex items-center gap-1.5">
                {swRegistered ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Registered</> : "Pending"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Shell</p>
              <p className="text-sm font-bold text-[#343A40] mt-1">Inert / Neutral</p>
            </CardContent>
          </Card>
        </div>

        {/* PWA install cards — Site Mirror + Agent Wrapper */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Site Mirror PWA */}
          <Card className="border-slate-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#343A40] flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5 text-[#F8F9FA]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#343A40] text-base" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                    Site Mirror PWA
                  </h2>
                  <p className="text-xs text-slate-400">Mirrors altshiftx.tech · /state/* excluded</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Standalone app that mirrors the full altshiftx.tech site. No app store required.
              </p>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Checking tier...</div>
              ) : isTopTier || isAdmin ? (
                <div className="space-y-2">
                  <PwaInstallButton />
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> TopTier — free install.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="bg-slate-700 hover:bg-slate-800 text-white gap-2 w-full">
                    <Link to="/pricing"><Lock className="w-4 h-4" /> Upgrade to Install</Link>
                  </Button>
                  <p className="text-xs text-slate-400">Free-tier needs a plan upgrade.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Wrapper PWA */}
          <Card className="border-slate-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#343A40] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#F8F9FA]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#343A40] text-base" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                    Agent Wrapper PWA
                  </h2>
                  <p className="text-xs text-slate-400">PWA-AGENT-WRAPPER-1.0 · Generic Office</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Portable neutral container for AI services. Deploy to clients with a unique manifest.
              </p>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Checking tier...</div>
              ) : isTopTier || isAdmin ? (
                <div className="space-y-2">
                  <PwaAgentInstallButton />
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> TopTier — free install.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="bg-slate-700 hover:bg-slate-800 text-white gap-2 w-full">
                    <Link to="/pricing"><Lock className="w-4 h-4" /> Upgrade to Install</Link>
                  </Button>
                  <p className="text-xs text-slate-400">Free-tier needs a plan upgrade.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Legal disclaimer gate */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-sm">Legal Notice & Shell-Invariance Disclaimer</h3>
                <p className="text-xs text-amber-700 mt-1">
                  Before initializing the substrate, read the Sovereign PWA legal notice. The PWA is provided as an inert architectural shell — usage does not create a contract with altshiftx.tech.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3 border-amber-400 text-amber-700 hover:bg-amber-100 gap-1.5 text-xs">
                  <Link to="/legal/sovereign-pwa">Read Full Disclaimer <ArrowRight className="w-3.5 h-3.5" /></Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature list */}
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { title: "Standalone Display", desc: "Removes browser UI for a native app feel", icon: Monitor },
            { title: "Neutral Shell", desc: "Inert container — no intent, governance, or agency", icon: ShieldCheck },
            { title: "Site Mirror", desc: "Mirrors altshiftx.tech with /state/* excluded", icon: Smartphone },
            { title: "Office-Ready Aesthetic", desc: "Generic Office look — Slate & Light Grey", icon: CheckCircle2 },
          ].map(({ title, desc, icon: Icon }) => (
            <Card key={title} className="border-slate-200">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#343A40]">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}