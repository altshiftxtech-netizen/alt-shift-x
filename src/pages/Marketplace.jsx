import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, ShieldCheck, Download, SlidersHorizontal, ChevronRight, Loader2, LogIn, UserPlus, Zap, Package, CheckCircle2, LogOut, Crown } from "lucide-react";
import Logo from "@/components/Logo";
import InstallButton from "@/components/InstallButton";
import { base44 } from "@/api/base44Client";
import RatingDisplay from "@/components/RatingDisplay";
import AiSearchConsultant from "@/components/AiSearchConsultant";
import { useAuth } from "@/lib/AuthContext";
import VideoBackground from "@/components/VideoBackground";
import ComponentSharePanel from "@/components/ComponentSharePanel";
import FilterPanel from "@/components/marketplace/FilterPanel";
import MarketplacePagination from "@/components/marketplace/MarketplacePagination";
import FeaturedSpotlight from "@/components/marketplace/FeaturedSpotlight";
import SiteContentBanner from "@/components/site-content/SiteContentBanner";
import AiDisclosureNotice from "@/components/legal/AiDisclosureNotice";
import { isFreeGated } from "@/components/free-gate/freeGateData";
import { Share2 } from "lucide-react";
import ConsultationButton from "@/components/consultation/ConsultationButton";
import SovereignAppSwitcher from "@/components/SovereignAppSwitcher";
import DeltaWarehouseCard from '@/components/DeltaWarehouseCard';
import DeltaPurchaseGate from '@/components/warehouse/DeltaPurchaseGate';
import { startDeltaCheckout } from '@/components/warehouse/startDeltaCheckout';

const ALL_COMPONENTS = [];
const PAGE_SIZE = 50;

const CATEGORIES = [
  "All",
  "Military & Business Strategy",
  "AI Agent Development",
  "Marketplace & Deployment Kits",
  "Pedigree Specialized Pairings",
  "Legal & Compliance",
  "Operational Engineering",
  "Human Capital",
  "Strategic Growth",
  "Knowledge Book Tiles",
];
const TYPES = ["All", "X1", "X2", "X3", "X4", "X5"];
const TYPE_LABELS = {
  All: "All Types",
  X1: "X1 · Reading Protocols",
  X2: "X2 · Prophecy Models",
  X3: "X3 · Speed Profiles",
  X4: "X4 · Reason Councils",
  X5: "X5 · Complete Agents",
};

// Legacy category override map — DB categories are now correct; this is kept as a safety net for any components still showing old values
const COMPONENT_CATEGORY_OVERRIDE = {
  // Legacy "Project Management" → correct category
  "MLAAU-BUS": "AI Agent Development",
  "MLAAU-UAP": "AI Agent Development",
  "MLAAU-AA": "AI Agent Development",
  "HBP-1.0": "AI Agent Development",
  "VMP-1.0": "AI Agent Development",
  "AAD-1.0": "AI Agent Development",
  "MQR-1.0": "AI Agent Development",
  // Legacy "Risk & Compliance" → correct category
  "OVERWATCH-1.0": "Military & Business Strategy",
  "TMT-UNIFIED": "Military & Business Strategy",
  "CHAMBER-FULL": "Military & Business Strategy",
  "ASCENSION-1.01": "Military & Business Strategy",
  "CEREBRAL-1.0": "AI Agent Development",
  "SRTM-1.0": "AI Agent Development",
  "DNH-1.0": "Legal & Compliance",
  "CIP-DOCTORAL": "Legal & Compliance",
  "YJ-LIGHTYEAR-S": "Pedigree Specialized Pairings",
  "YJ-LIGHTYEAR": "Pedigree Specialized Pairings",
};
const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X3: "bg-cyan-100 text-cyan-700",
  X4: "bg-amber-100 text-amber-700",
  X5: "bg-emerald-100 text-emerald-700",
};

function ScoreBadge({ score }) {
  const color = score >= 90 ? "text-emerald-600 bg-emerald-50" : score >= 80 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${color}`}><ShieldCheck className="w-2.5 h-2.5" />{score}</span>;
}

export default function Marketplace() {
  const { isAuthenticated, logout, user: authUser } = useAuth();
  const [components, setComponents] = useState([]);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [sortBy, setSortBy] = useState("installs");
  const [showFilters, setShowFilters] = useState(false);
  const [sharingId, setSharingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(authUser);
  // map of component_id -> InstalledComponent record
  const [installedMap, setInstalledMap] = useState({});
  const [bundleInstalling, setBundleInstalling] = useState(false);
  const [featuredKit, setFeaturedKit] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCatalogCount, setTotalCatalogCount] = useState(0);

  // Accurate live catalog count (paginated server-side; not capped at 5k).
  const loadCatalogCount = React.useCallback(() => {
    base44.functions.invoke("componentCounts", {})
      .then((res) => { if (res?.data?.published != null) setTotalCatalogCount(res.data.published); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCatalogCount();
    const unsubscribe = base44.entities.Component.subscribe(() => loadCatalogCount());
    return unsubscribe;
  }, [loadCatalogCount]);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      // Load the components (the core of the page) on their OWN error boundary so
      // a later failure in the user/installs step can never wipe an already-loaded
      // grid. Only clear components if the components fetch itself fails.
      try {
        const data = await base44.entities.Component.filter({ status: "published" });
        if (!cancelled && Array.isArray(data)) setComponents(data);
      } catch {
        // Keep whatever is already rendered instead of blanking the grid.
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Featured kit — best-effort, never affects components.
      base44.entities.FeaturedKit
        .filter({ active: true }, "-created_date", 1)
        .then((kits) => { if (!cancelled) setFeaturedKit((kits && kits[0]) || null); })
        .catch(() => {});

      // User + installs — fully isolated; any failure here leaves components intact.
      try {
        const user = await base44.auth.me().catch(() => null);
        if (cancelled) return;
        setCurrentUser(user);
        if (user) {
          const installed = await base44.entities.InstalledComponent.filter({ user_id: user.id });
          const map = {};
          (installed || []).forEach(r => { map[r.component_id] = r; });
          if (!cancelled) setInstalledMap(map);
        }
      } catch {
        /* installs are non-critical — leave the grid as-is */
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const handleBundleInstall = async (bundleComponents) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    // Find first component not yet installed and start checkout
    const first = bundleComponents.find(c => !installedMap[c.id]);
    if (!first) return; // all installed
    setBundleInstalling(true);
    try {
      await startDeltaCheckout('createCheckoutSession', { componentId: first.id });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "";
      alert(/rate limit|429|too many/i.test(msg)
        ? "We're getting a lot of requests right now. Please wait a few seconds and tap Install Bundle again."
        : "Could not start checkout. Please try again.");
    }
    setBundleInstalling(false);
  };

  // Featured kit codes drive the pinned/highlighted components. Falls back to the
  // flagship Super Dev Kit trio before the AI rotation has seeded a kit.
  const FALLBACK_KIT = {
    kit_name: "Super Dev Kit",
    tagline: "3 elite AI agents bundled at 25% off",
    description: "The Super Dev Kit is a precision-engineered trio of AI agents designed to work in concert — from ideation to deployment to mastery. Together they eliminate the three biggest bottlenecks every serious builder faces: slow iteration, chaotic output, and shallow expertise.",
    component_codes: ["APP-PRINTER-1.0", "1TAKEJAY-1.0", "MIYAGI-SAN-1.0"],
    discount_percent: 25,
  };
  const activeKit = featuredKit || FALLBACK_KIT;
  const PINNED_CODES = activeKit.component_codes || [];

  // Spotlight: components explicitly flagged `featured` lead the whole page
  // (above the Enterprise Pipelines promo). Sorted by optional pinned_position.
  const spotlight = useMemo(() => {
    const safeguard = components.find((c) => c.code === "SAFEGUARD-1.0");
    const rest = components
      .filter((c) => c.featured && c.code !== "SAFEGUARD-1.0")
      .sort((a, b) => (a.pinned_position ?? 999) - (b.pinned_position ?? 999));
    return safeguard ? [safeguard, ...rest] : rest;
  }, [components]);
  const spotlightIds = useMemo(() => new Set(spotlight.map((c) => c.id)), [spotlight]);

  const filtered = useMemo(() => components
    .filter(c => {
      // Spotlighted (featured) components render in the hero strip — keep them
      // out of the normal grid only on the default "All" + no-search view.
      if (category === "All" && !search && spotlightIds.has(c.id)) return false;
      const effectiveCategory = COMPONENT_CATEGORY_OVERRIDE[c.code] || c.category;
      const categoryMatch = category === "All" || effectiveCategory === category;
      const typeMatch = type === "All" || c.type === type;
      const searchMatch = c.name.toLowerCase().includes(search.toLowerCase()) || 
        (c.description || "").toLowerCase().includes(search.toLowerCase());
      return categoryMatch && typeMatch && searchMatch;
    })
    .sort((a, b) => {
      // Pin featured components to top when viewing "All" category
      if (category === "All") {
        const aPin = PINNED_CODES.indexOf(a.code);
        const bPin = PINNED_CODES.indexOf(b.code);
        if (aPin !== -1 || bPin !== -1) {
          if (aPin === -1) return 1;
          if (bPin === -1) return -1;
          return aPin - bPin;
        }
      }
      return sortBy === "rating" ? (b.rating || 0) - (a.rating || 0) : sortBy === "trust" ? (b.trust_score || 0) - (a.trust_score || 0) : (b.installs_count || 0) - (a.installs_count || 0);
    }), [components, category, type, search, sortBy, spotlightIds]);

  // Reset to the first page whenever the result set changes (filters/search/sort).
  useEffect(() => { setPage(1); }, [category, type, search, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  return (
    <div className="min-h-screen relative">
      <VideoBackground />
      {/* Nav */}
       <nav className="relative z-20 bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
         <div className="flex items-center gap-2">
           <Link to="/" className="flex items-center gap-2">
             <Logo className="h-8 w-auto" variant="purple" />
           </Link>
           <ChevronRight className="w-3.5 h-3.5 text-white/30" />
           <span className="text-sm text-white/60">Marketplace</span>
           </div>
           <div className="hidden md:flex items-center gap-4 text-sm text-white/70 ml-8">
           <Link to="/warehouse" className="hover:text-white">Warehouse</Link>
           </div>
         <div className="flex flex-wrap items-center gap-2">
           <SovereignAppSwitcher activeAppId="altshiftx" />
           <ConsultationButton />
           {isAuthenticated ? (
             <>
               <Link to="/dashboard"><Button variant="outline" className="text-sm h-8 bg-white/10 border-white/20 text-white hover:bg-white/20">My Dashboard</Button></Link>
               <Link to="/builder"><Button className="text-sm h-8 bg-violet-600 hover:bg-violet-700">Builder Portal</Button></Link>
               <Button className="text-sm h-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white gap-1.5" onClick={() => logout()}>
                 <LogOut className="w-3.5 h-3.5" /> Sign out
               </Button>
             </>
           ) : (
             <>
               <Link to="/login"><Button variant="outline" className="text-sm h-8 gap-1.5"><LogIn className="w-3.5 h-3.5" /> Sign in</Button></Link>
               <Link to="/register"><Button className="text-sm h-8 bg-slate-900 hover:bg-slate-700 gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Sign up</Button></Link>
             </>
           )}
         </div>
       </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-8">
        {/* Live marketplace banner (managed by The UpKeeper) */}
        <div className="mb-4 pt-2">
          <SiteContentBanner contentKey="marketplace_top_banner" variant="dark" />
        </div>
        <div className="mb-4">
          <AiSearchConsultant />
        </div>
        <AiDisclosureNotice variant="light" className="mb-8" />
        <DeltaPurchaseGate component={purchase} currentUser={currentUser} installedRecord={installedMap[purchase?.id]} onClose={() => setPurchase(null)} onUninstalled={cid => setInstalledMap(m => { const n = {...m}; delete n[cid]; return n; })} />

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input placeholder="Search components…" className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(v => !v)}
                title="Filters"
                className={`flex items-center gap-1.5 text-xs h-full px-3 py-2 rounded-md border transition-all ${showFilters || type !== "All" || category !== "All" ? "bg-violet-600 border-violet-500 text-white" : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {(type !== "All" ? 1 : 0) + (category !== "All" ? 1 : 0) > 0 && (
                  <span className="bg-white text-violet-700 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {(type !== "All" ? 1 : 0) + (category !== "All" ? 1 : 0)}
                  </span>
                )}
              </button>
              {showFilters && (
                <FilterPanel
                  types={TYPES}
                  type={type}
                  onType={(t) => { setType(t); }}
                  categories={CATEGORIES}
                  category={category}
                  onCategory={(c) => { setCategory(c); }}
                  onClose={() => setShowFilters(false)}
                />
              )}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border border-white/20 rounded-md px-2 py-2 bg-white/10 text-white focus:outline-none">
              <option value="installs">Most Installed</option>
              <option value="rating">Highest Rated</option>
              <option value="trust">Trust Score</option>
            </select>
          </div>
        </div>

        {/* Featured Protection spotlight — pinned above pipelines (e.g. SAFEGUARD-1.0) */}
        {!loading && category === "All" && !search && (
          <FeaturedSpotlight
            components={spotlight}
            userId={currentUser?.id}
            installedMap={installedMap}
            isAuthenticated={isAuthenticated}
            onUninstalled={(cid) => setInstalledMap((m) => { const n = { ...m }; delete n[cid]; return n; })}
          />
        )}

        {/* Enterprise Pipelines promo — for big companies */}
        <Link to="/enterprise/expertminds" className="block mb-6 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-900/40 via-slate-900/60 to-black/60 backdrop-blur-md p-5 hover:border-amber-400/70 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Enterprise Pipelines</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-black px-1.5 py-0.5 rounded-full">For Companies</span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">License curated component bundles behind one secure key — Alt+Shift+X Exclusive (Magna Dev) + best-of pipelines. Full payment, instant key.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* For Enterprise — gate into the Sovereign tier portal */}
        <Link to="/enterprise/expertminds" className="block mb-6 rounded-2xl border border-[#C8A95B]/40 bg-gradient-to-br from-[#1b1a24]/80 via-slate-900/60 to-black/60 backdrop-blur-md p-5 hover:border-[#C8A95B]/70 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#C8A95B]/15 border border-[#C8A95B]/30 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-[#E6C878]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">For Enterprise</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C8A95B] text-black px-1.5 py-0.5 rounded-full">Sovereign Tier</span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">Enter the Sovereign portal — live key telemetry, the gated Engineering Suite, department/client key orchestration, and dedicated intelligence.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#E6C878] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <div className="flex gap-6">
          {/* Results grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            ) : (
              <>
                {/* Featured Kit of the Month (AI-rotated) */}
                {(category === "All" && !search) && (() => {
                  const bundleCodes = activeKit.component_codes || [];
                  const bundleComponents = bundleCodes.map(code => components.find(c => c.code === code)).filter(Boolean);
                  if (bundleComponents.length < 2) return null;
                  const kitSlug = (activeKit.kit_name || "featured-kit").toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const bundleUrl = `${window.location.origin}/marketplace?bundle=${kitSlug}`;
                  const isAiPick = !!featuredKit && featuredKit.selected_by === "ai";
                  return (
                    <div className="mb-6 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-900/60 via-indigo-900/50 to-black/60 backdrop-blur-md p-5 ring-1 ring-violet-400/20 shadow-xl relative">
                      {/* Share button top-right */}
                      <div className="absolute top-4 right-4">
                        <div className="relative">
                          <button
                            onClick={() => setSharingId(sharingId === "bundle" ? null : "bundle")}
                            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                          {sharingId === "bundle" && (
                            <div className="absolute right-0 top-9 z-50 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-3 w-56">
                              <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Share {activeKit.kit_name}</p>
                              {[
                                { label: "Twitter / X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${activeKit.kit_name} on Alt+Shift+X${activeKit.discount_percent ? ` — ${activeKit.discount_percent}% off this month!` : "!"}`)}&url=${encodeURIComponent(bundleUrl)}`, color: "hover:bg-sky-500/20 hover:text-sky-300" },
                                { label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(bundleUrl)}`, color: "hover:bg-blue-600/20 hover:text-blue-300" },
                                { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bundleUrl)}`, color: "hover:bg-blue-500/20 hover:text-blue-300" },
                              ].map(p => (
                                <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                                  className={`flex items-center gap-2 text-xs text-white/70 px-2 py-1.5 rounded-lg transition-all ${p.color}`}>
                                  {p.label}
                                </a>
                              ))}
                              <button
                                onClick={() => { navigator.clipboard.writeText(bundleUrl); setSharingId(null); }}
                                className="flex items-center gap-2 text-xs text-white/70 px-2 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all w-full mt-1"
                              >
                                Copy Link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Header badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Package className="w-4 h-4 text-violet-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">{isAiPick ? "AI Pick of the Month" : "Featured Kit"}</span>
                        {activeKit.discount_percent > 0 && (
                          <span className="text-[10px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">Save {activeKit.discount_percent}%</span>
                        )}
                        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">⏳ This Month Only</span>
                      </div>

                      <Link to={`/marketplace/${bundleComponents[0].id}`} className="inline-block">
                        <h2 className="text-2xl font-extrabold text-white mb-2 hover:text-violet-200 transition-colors cursor-pointer">⚡ {activeKit.kit_name}</h2>
                      </Link>

                      {/* Description */}
                      <p className="text-sm text-white/70 mb-5 max-w-2xl leading-relaxed">
                        {activeKit.description}
                      </p>

                      {/* Components in the kit */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        {bundleComponents.map((c, i) => (
                          <Link key={c.id} to={`/marketplace/${c.id}`} className="bg-white/5 border border-violet-400/20 rounded-xl p-4 relative hover:bg-white/10 hover:border-violet-400/40 transition-colors block">
                            {i > 0 && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-violet-300 bg-violet-900 border border-violet-400/30 px-2 py-0.5 rounded-full">THEN</div>
                            )}
                            <h4 className="text-sm font-bold text-white mb-1">{c.name}</h4>
                            <p className="text-xs text-white/55 leading-relaxed line-clamp-3">{c.description}</p>
                          </Link>
                        ))}
                      </div>

                      {/* CTA row */}
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                        <div className="flex gap-2 flex-wrap">
                          {bundleComponents.map(c => (
                            <Link key={c.id} to={`/marketplace/${c.id}`}
                              className="text-[10px] text-violet-300 hover:text-violet-100 bg-violet-900/40 border border-violet-400/20 px-2 py-1 rounded-lg transition-colors font-mono">
                              {c.code}
                            </Link>
                          ))}
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-xs text-white/40 hidden sm:block">{bundleComponents.length} components · bundle pricing at checkout</span>
                          {(() => {
                            const allInstalled = bundleComponents.every(c => installedMap[c.id]);
                            const someInstalled = bundleComponents.some(c => installedMap[c.id]);
                            const remaining = bundleComponents.filter(c => !installedMap[c.id]);
                            if (allInstalled) {
                              return (
                                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-400/30 px-4 py-2 rounded-xl">
                                  <CheckCircle2 className="w-4 h-4" /> All Installed
                                </span>
                              );
                            }
                            return (
                              <button
                                onClick={() => handleBundleInstall(bundleComponents)}
                                disabled={bundleInstalling}
                                className="flex items-center gap-2 text-sm font-bold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-violet-900/40"
                              >
                                {bundleInstalling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                {bundleInstalling ? "Starting…" : someInstalled ? `Install Remaining (${remaining.length})` : "Install Bundle"}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-xs text-white/40 mb-4">
                  {totalCatalogCount > 0 ? `${totalCatalogCount.toLocaleString()} components` : `${filtered.length} components`}
                  {filtered.length > PAGE_SIZE && (
                    <span> · showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pageItems.map(c => <DeltaWarehouseCard key={c.id} component={c} currentUser={currentUser} onTriggerPurchase={setPurchase} footer={<div className="relative"><button aria-label={`Share ${c.name}`} onClick={() => setSharingId(sharingId === c.id ? null : c.id)} className="text-xs text-muted-foreground hover:text-foreground inline-flex gap-1 items-center"><Share2 className="h-3.5 w-3.5" /> Share</button>{sharingId === c.id && <ComponentSharePanel component={c} onClose={() => setSharingId(null)} />}</div>} />)}
                </div>

                <MarketplacePagination page={page} pageCount={pageCount} onPage={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}