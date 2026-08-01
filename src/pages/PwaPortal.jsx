import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, ShieldCheck, Lock, ArrowRight, CheckCircle2, Loader2, FileText, Monitor, Radio } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import CosmicBackground from "@/components/CosmicBackground";
import UniversalPwaInstall from "@/components/pwa/UniversalPwaInstall";
import MyBuilds from "@/components/pwa/MyBuilds";
import PwaHandbook from "@/components/pwa/PwaHandbook";
import PwaLegalAssets from "@/components/pwa/PwaLegalAssets";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getLockedManifestUrl } from "@/lib/lockedManifest";
import { getAgentManifestUrl, DEFAULT_AGENT_DOMAIN } from "@/lib/agentManifest";
import { getBobbyManifestUrl } from "@/lib/bobbyManifest";

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
  const isEnterprise = (sub && sub.plan === "enterprise" && ["active", "trialing", "past_due"].includes(sub.status)) || isAdmin;

  // The Site Mirror PWA manifest is permanently locked to pwa.altshiftx.tech.
  const lockedManifestUrl = useMemo(() => getLockedManifestUrl(), []);

  // The Agent Wrapper PWA domain is user-configurable (not locked).
  const [agentDomain, setAgentDomain] = useState(DEFAULT_AGENT_DOMAIN);
  const agentManifestUrl = useMemo(() => getAgentManifestUrl(agentDomain), [agentDomain]);
  const bobbyManifest10 = useMemo(() => getBobbyManifestUrl("1.0"), []);
  const bobbyManifest11 = useMemo(() => getBobbyManifestUrl("1.1"), []);

  return (
    <div className="min-h-screen">
      <CosmicBackground />
      <SharedNav mode="user" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img
                src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/98d0068c6_Copilot_20260731_032927.png"
                alt="Sovereign PWA Portal emblem"
                className="w-12 h-12 rounded-full object-cover border border-slate-300 shrink-0"
              />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#343A40]" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                Sovereign PWA Portal
              </h1>
              <p className="text-sm text-slate-500">Install Alt+Shift+X as a standalone desktop or mobile app.</p>
            </div>
            <PwaHandbook />
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
                <img
                  src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/beac80924_altxlogo2.jpg"
                  alt="Alt+Shift+X logo"
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-300 bg-white p-0.5"
                />
                <div>
                  <h2 className="font-bold text-[#343A40] text-base" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                    Site Mirror PWA
                  </h2>
                  <p className="text-xs text-slate-400">Mirrors altshiftx.tech · /state/* excluded</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                Standalone app that mirrors the full altshiftx.tech site. No app store required.
              </p>
              <div className="flex items-start gap-2 mb-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <Radio className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Hybrid Mirror:</span> installs the global shell (<span className="font-mono">pwa.altshiftx.tech</span>) for updates &amp; P2P signaling, then uses a local <span className="font-mono">.local</span> fast-path for zero-latency transfers between nearby devices.
                </p>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Checking tier...</div>
              ) : isTopTier || isAdmin ? (
                <div className="space-y-2">
                  <UniversalPwaInstall manifestUrl={lockedManifestUrl} pwaName="Alt+Shift+X" swapManifest domainLocked zipName="altshiftx-site-mirror" zipSubtitle="Hybrid Mirror · pwa.altshiftx.tech" iconUrl="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/beac80924_altxlogo2.jpg" />
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
                <img
                  src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png"
                  alt="Agent Wrapper logo"
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-300"
                />
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
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Deployment Domain</label>
                    <input
                      type="text"
                      value={agentDomain}
                      onChange={(e) => setAgentDomain(e.target.value)}
                      placeholder="https://your-domain.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-[#343A40] bg-white/60 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Customize the deployment domain for your Agent Wrapper PWA.</p>
                  </div>
                  <UniversalPwaInstall manifestUrl={agentManifestUrl} pwaName="Agent Wrapper" swapManifest zipName="altshiftx-agent-wrapper" zipSubtitle="PWA-AGENT-WRAPPER-1.0 · Generic Office" iconUrl="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png" />
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

          {/* BOBby 1.0 PWA — standard builder yield */}
          <Card className="border-slate-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <img
                  src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24e433342_image.png"
                  alt="BOBby logo"
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-300 bg-black"
                />
                <div>
                  <h2 className="font-bold text-[#343A40] text-base" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                    BOBby 1.0
                  </h2>
                  <p className="text-xs text-slate-400">BOBby-BUILDER-1.0 · Build Yielder</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                The developer's canvas as a standalone PWA. Prompt-to-concept yield, sealed by the Sovereign Substrate.
              </p>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Checking tier...</div>
              ) : isTopTier || isAdmin ? (
                <div className="space-y-2">
                  <UniversalPwaInstall manifestUrl={bobbyManifest10} pwaName="BOBby 1.0" swapManifest zipName="bobby-1.0" zipSubtitle="BOBby-BUILDER-1.0 · Build Yielder" iconUrl="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24e433342_image.png" />
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

          {/* BOBby 1.1 Enterprise PWA — enterprise role only */}
          <Card className="border-amber-200 bg-amber-50/40">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <img
                  src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24e433342_image.png"
                  alt="BOBby Enterprise logo"
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-amber-300 bg-black"
                />
                <div>
                  <h2 className="font-bold text-[#343A40] text-base flex items-center gap-1.5" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                    BOBby 1.1 Enterprise
                  </h2>
                  <p className="text-xs text-amber-700/70">BOBby-ENTERPRISE-1.1 · Sovereign Yield</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Enterprise-grade yield with the full Sovereign Triad unlocked. Restricted to the enterprise user role.
              </p>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Checking access...</div>
              ) : isEnterprise ? (
                <div className="space-y-2">
                  <UniversalPwaInstall manifestUrl={bobbyManifest11} pwaName="BOBby 1.1 Enterprise" swapManifest zipName="bobby-1.1-enterprise" zipSubtitle="BOBby-ENTERPRISE-1.1 · Sovereign Yield" iconUrl="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24e433342_image.png" />
                  <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Enterprise role verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white gap-2 w-full">
                    <Link to="/enterprise"><Lock className="w-4 h-4" /> Enterprise Access Required</Link>
                  </Button>
                  <p className="text-xs text-amber-700/70">BOBby 1.1 is restricted to the enterprise user role.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My B.O.B.Init Builds — persisted, installable, downloadable */}
        <MyBuilds />

        {/* PWA Download Package — legal assets */}
        <PwaLegalAssets />

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