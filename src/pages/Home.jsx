import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Users, Star, Package, X, LogOut, LogIn, UserPlus, Lock } from "lucide-react";
import Logo from "@/components/Logo";
import { setSEOMeta, setBreadcrumbSchema } from "@/lib/seoHelpers";
import { useAuth } from "@/lib/AuthContext";
import VideoBackground from "@/components/VideoBackground";
import PlatformSocials from "@/components/PlatformSocials";
import SpotlightShareButton from "@/components/marketplace/SpotlightShareButton";
import SiteContentBanner from "@/components/site-content/SiteContentBanner";
import SiteContentBlock from "@/components/site-content/SiteContentBlock";
import { base44 } from "@/api/base44Client";

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X3: "bg-cyan-100 text-cyan-700", X4: "bg-amber-100 text-amber-700", X5: "bg-emerald-100 text-emerald-700" };

function InstallCTAModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 text-violet-700" />
        </div>
        <h2 className="text-xl font-black text-slate-900 text-center mb-2">Login Required to Install</h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          You need an account to install AI components. Sign up free to get started — it only takes 2 minutes.
        </p>
        <div className="space-y-2">
          <Link to="/register" onClick={onClose}>
            <Button className="w-full bg-violet-700 hover:bg-violet-800 text-white h-11 gap-2">
              <UserPlus className="w-4 h-4" /> Create Free Account
            </Button>
          </Link>
          <Link to="/login" onClick={onClose}>
            <Button variant="outline" className="w-full h-11 gap-2">
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          </Link>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-4">No credit card required to sign up</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [componentCount, setComponentCount] = useState(0);
  const [avgTrust, setAvgTrust] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [installedMap, setInstalledMap] = useState({});

  useEffect(() => {
    base44.auth.me()
      .then(async (user) => {
        setCurrentUser(user);
        if (user) {
          const installed = await base44.entities.InstalledComponent.filter({ user_id: user.id });
          const map = {};
          (installed || []).forEach((r) => { map[r.component_id] = r; });
          setInstalledMap(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.Component.filter({ status: "published" }, "-installs_count", 100)
      .then((data) => {
        const list = data || [];
        setComponentCount(list.length);
        setFeatured(list.slice(0, 3));
        // Spotlight = any explicitly-featured component, plus SAFEGUARD pinned to the front by code.
        const safeguard = list.find((c) => c.code === "SAFEGUARD-1.0");
        const featuredList = list
          .filter((c) => c.featured && c.code !== "SAFEGUARD-1.0")
          .sort((a, b) => (a.pinned_position ?? 999) - (b.pinned_position ?? 999));
        setSpotlight(safeguard ? [safeguard, ...featuredList] : featuredList);
        const scored = list.filter((c) => c.trust_score > 0);
        if (scored.length) {
          setAvgTrust(Math.round(scored.reduce((s, c) => s + c.trust_score, 0) / scored.length));
        }
      })
      .catch(() => {});
  }, []);

  const STATS = [
    { label: "First to Market Components", value: "3000+", icon: Package },
    { label: "Avg Trust Score", value: avgTrust != null ? String(avgTrust) : "—", icon: ShieldCheck },
    { label: "Do-No-Harm Audited", value: "Every component", icon: Users },
    { label: "Stage", value: "Beta", icon: Zap },
  ];

  useEffect(() => {
    setSEOMeta({
      title: "Alt+Shift+X Market — Verified AI Components",
      description: "Discover certified, trust-scored AI-powered components — each one benchmarked, Do-No-Harm audited, and certified before publishing.",
      keywords: "AI components, construction, document extraction, risk management, project management, site reporting, verified AI, enterprise software",
      robots: "index, follow",
    });
    setBreadcrumbSchema([
      { label: "Home", url: "https://altshiftx.com" }
    ]);
  }, []);

  return (
    <div className="min-h-screen relative">
      <VideoBackground />
      {showInstallModal && <InstallCTAModal onClose={() => setShowInstallModal(false)} />}
      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-8 w-auto" variant="purple" />
        <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link to="/marketplace" className="hover:text-white">Marketplace</Link>
          <Link to="/builder" className="hover:text-white">Build</Link>
          <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard"><Button className="text-sm h-8 bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><LogIn className="w-3.5 h-3.5" /> Dashboard</Button></Link>
              <Button className="text-sm h-8 bg-white/20 hover:bg-white/30 border border-white/30 text-white gap-1.5 backdrop-blur-sm" onClick={() => logout()}>
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button className="text-sm h-8 bg-white/15 hover:bg-white/25 border border-white/25 text-white gap-1.5 backdrop-blur-sm"><LogIn className="w-3.5 h-3.5" /> Sign in</Button></Link>
              <Link to="/register"><Button className="text-sm h-8 bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Sign up</Button></Link>
            </>
          )}
        </div>
      </nav>

      {/* Live homepage announcement banner (managed by The UpKeeper) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-4">
        <SiteContentBanner contentKey="homepage_banner" variant="dark" />
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Trust-scored AI components for construction
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
          The marketplace for<br />
          <span className="text-violet-300">verified AI components</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
          Discover, install, and deploy battle-tested extraction models for construction documents — each one benchmarked, scored, and certified.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/marketplace">
            <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-700 text-sm gap-2">
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/builder">
              <Button className="h-11 px-6 text-sm gap-2 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 ring-2 ring-violet-300/40">
                <Zap className="w-4 h-4" /> Start Building
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="h-11 px-6 text-sm" onClick={() => setShowInstallModal(true)}>
              Install a Component
            </Button>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-white/10 bg-black/30 backdrop-blur-sm py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2"><Icon className="w-5 h-5 text-white/40" /></div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Components</h2>
            <Link to="/marketplace" className="text-sm text-violet-300 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map(c => (
              <Link key={c.id} to={`/marketplace/${c.id}`}>
                <div className="border border-white/10 rounded-xl p-5 hover:shadow-xl transition-shadow bg-white/10 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>{c.type}</span>
                     <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{c.category}</span>
                   </div>
                   <h3 className="text-base font-bold text-white mb-1">{c.name}</h3>
                   <p className="text-xs text-white/60 mb-4 flex-1 line-clamp-3">{c.description}</p>
                   <div className="flex items-center justify-between">
                     {(c.rating || 0) > 0 ? (
                       <div className="flex items-center gap-1 text-xs text-amber-400">
                         <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                         <span className="font-semibold">{(c.rating || 0).toFixed(1)}</span>
                       </div>
                     ) : <span />}
                     {(c.trust_score || 0) > 0 && (
                       <span className="flex items-center gap-1 text-xs text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> {c.trust_score} Trust</span>
                     )}
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Builder Agreement Section */}
      {!isAuthenticated && (
        <section className="relative z-10 max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-2">Builder Agreement</h3>
            <p className="text-sm text-white/60 mb-6">
              You must be signed in to view the full agreement. The complete text is only available to registered platform members.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button className="bg-violet-700 hover:bg-violet-800 text-white gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-slate-900 hover:bg-slate-700 text-white gap-2">
                  Create Account →
                </Button>
              </Link>
              <Link to="/builder/agreement" className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline self-center">
                View Agreement Details
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Protection spotlight (bottom) */}
      {spotlight.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <h2 className="text-2xl font-bold text-white">Featured Protection</h2>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {spotlight.map((c) => (
              <Link key={c.id} to={`/marketplace/${c.id}`}>
                <div className="relative rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-900/40 via-white/5 to-black/40 backdrop-blur-sm p-6 hover:border-emerald-400/70 transition-colors h-full">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Spotlight</span>
                    {c.requires_legal_acceptance && (
                      <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">Legal gating</span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-1">{c.name}</h3>
                  <p className="text-[11px] font-mono text-white/40 mb-3">{c.code}</p>
                  <p className="text-sm text-white/60 line-clamp-3 mb-4">{c.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300">
                    View details <ArrowRight className="w-4 h-4" />
                  </span>

                  {/* Affiliate share + gated CTA — payment only via the detail page legal walkthrough */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10" onClick={(e) => e.preventDefault()}>
                    <SpotlightShareButton component={c} />
                    {c.requires_legal_acceptance && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-amber-300/80">
                        <Lock className="w-3 h-3" /> Disclaimer required before purchase
                      </span>
                    )}
                    <Link
                      to={`/marketplace/${c.id}`}
                      className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Review &amp; Install <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative z-10 bg-black/40 backdrop-blur-sm py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to build smarter?</h2>
        <p className="text-white/50 mb-8 text-sm">Join our beta and start shipping verified, Do-No-Harm audited AI components.</p>
        <Link to="/register">
          <Button className="bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 dark:hover:bg-violet-600 text-white h-11 px-8 text-sm">Create your account</Button>
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm py-8 text-center text-xs text-white/40 space-y-4">
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/contact" className="hover:text-slate-600">Contact</Link>
          <Link to="/tutorials" className="hover:text-slate-600">Tutorials</Link>
          <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-600">Terms of Service</Link>
          <Link to="/sensitive-intelligence-policy" className="hover:text-slate-600">Sensitive Intelligence Policy</Link>
        </div>
        <SiteContentBlock contentKey="sanctions_footer_notice" short className="max-w-2xl mx-auto text-white/50" />
        <SiteContentBlock contentKey="footer_compliance_statement" short className="max-w-2xl mx-auto text-white/50" />
        <PlatformSocials variant="light" />
        <p>© 2026 Alt+Shift+X. All rights reserved.</p>
        <p className="text-white/30">Powered by: Trust AR LLC.</p>
      </footer>
    </div>
  );
}