import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Star, Download, CheckCircle2, Globe, ExternalLink } from "lucide-react";
import SocialSharePanel from "@/components/social/SocialSharePanel";

const BUILDERS = {
  "buildright-ai": {
    id: "buildright-ai",
    name: "BuildRight AI",
    avatar: "B",
    tagline: "Precision extraction for construction risk and site operations.",
    location: "Auckland, NZ",
    website: "https://buildright.ai",
    tier: "certified",
    memberSince: "Jan 2025",
    totalInstalls: 3565,
    avgTrustScore: 92,
    avgRating: 4.55,
    bio: "BuildRight AI specialises in contract risk and daily site intelligence for the New Zealand and Australian construction markets. Our components are built on 4-pass pipeline architecture, benchmarked quarterly, and certified by the Alt+Shift+X trust engine.",
    components: [
      { id: "ironclad-protocol", name: "Ironclad Protocol", code: "RP-CONSTRUCTION-1.0", type: "X1", trustScore: 91, rating: 4.4, installs: 2341 },
      { id: "the-site-board", name: "The Site Board", code: "RC-CONSTRUCTION", type: "X4", trustScore: 93, rating: 4.7, installs: 612 },
      { id: "cost-variance", name: "Cost Variance Lens", code: "PM-COST-1.0", type: "X2", trustScore: 86, rating: 4.3, installs: 398 },
    ],
    reviews: [
      { author: "T. Marshall", rating: 5, text: "BuildRight AI's components are consistently the most reliable on the platform. The documentation is excellent.", date: "May 2026" },
      { author: "J. Chen", rating: 4, text: "Fast to respond to issues and constantly improving. Ironclad Protocol alone is worth the subscription.", date: "Apr 2026" },
      { author: "R. Patel", rating: 5, text: "Best construction-domain AI components available. Trust scores back up the quality claims.", date: "Mar 2026" },
    ],
  },
  "siteintel": {
    id: "siteintel",
    name: "SiteIntel",
    avatar: "S",
    tagline: "Project intelligence from bid to closeout.",
    location: "Sydney, AU",
    website: "https://siteintel.io",
    tier: "official",
    memberSince: "Mar 2025",
    totalInstalls: 2022,
    avgTrustScore: 88,
    avgRating: 4.3,
    bio: "SiteIntel builds project management and scheduling intelligence components for mid-to-large tier contractors. Our focus is on bid analysis, programme scheduling, and cost variance — helping project managers make faster, better-informed decisions.",
    components: [
      { id: "estimators-eye", name: "Estimator's Eye", code: "PM-CONSTRUCTION-BID", type: "X2", trustScore: 87, rating: 4.2, installs: 890 },
      { id: "schedule-pulse", name: "Schedule Pulse", code: "PM-SCHEDULE-1.0", type: "X2", trustScore: 89, rating: 4.5, installs: 734 },
      { id: "rfi-tracker", name: "RFI Tracker", code: "RC-RFI-1.0", type: "X4", trustScore: 82, rating: 4.0, installs: 601 },
    ],
    reviews: [
      { author: "A. Wilson", rating: 5, text: "Estimator's Eye is indispensable for bid levelling. SiteIntel's components are always production-ready.", date: "May 2026" },
      { author: "M. Garcia", rating: 4, text: "Schedule Pulse has saved us significant time on programme analysis. Great team.", date: "Apr 2026" },
    ],
  },
};

const DEFAULT = BUILDERS["buildright-ai"];
const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };
const tierConfig = {
  certified: { label: "Certified Builder", className: "bg-emerald-100 text-emerald-700" },
  official: { label: "Official Partner", className: "bg-violet-100 text-violet-700" },
  community: { label: "Community Builder", className: "bg-slate-100 text-slate-600" },
};

export default function BuilderPublicProfile() {
  const { id } = useParams();
  const builder = BUILDERS[id] || DEFAULT;
  const tier = tierConfig[builder.tier];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <Link to="/marketplace" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Marketplace
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
        {/* Profile header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black shrink-0">
                {builder.avatar}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-slate-900">{builder.name}</h1>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${tier.className}`}>
                    <CheckCircle2 className="w-3 h-3" />{tier.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">{builder.tagline}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {builder.location && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{builder.location}</span>}
                  <span>Member since {builder.memberSince}</span>
                  {builder.website && (
                    <a href={builder.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 hover:underline">
                      <ExternalLink className="w-3 h-3" />{builder.website.replace("https://", "")}
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                <div>
                  <p className="text-lg font-black text-slate-900">{builder.totalInstalls.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5"><Download className="w-2.5 h-2.5" />Installs</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-600">{builder.avgTrustScore}</p>
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5"><ShieldCheck className="w-2.5 h-2.5" />Avg Trust</p>
                </div>
                <div>
                  <p className="text-lg font-black text-amber-500">{builder.avgRating}</p>
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5"><Star className="w-2.5 h-2.5" />Avg Rating</p>
                </div>
              </div>
            </div>
            {builder.bio && <p className="text-sm text-slate-600 mt-5 pt-5 border-t border-slate-100 leading-relaxed">{builder.bio}</p>}
          </CardContent>
        </Card>

        {/* Components */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Published Components ({builder.components.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {builder.components.map(c => (
              <Link key={c.id} to={`/marketplace/${c.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-0.5">{c.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 mb-3">{c.code}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold"><ShieldCheck className="w-3 h-3" />{c.trustScore}</span>
                      <span className="flex items-center gap-1 text-slate-400"><Download className="w-3 h-3" />{c.installs.toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" />{c.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Reviews</h2>
          <div className="space-y-3">
            {builder.reviews.map((r, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{r.author[0]}</div>
                    <span className="text-xs font-semibold text-slate-700">{r.author}</span>
                    <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-400" />)}</div>
                    <span className="text-[10px] text-slate-400 ml-auto">{r.date}</span>
                  </div>
                  <p className="text-xs text-slate-600">{r.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </div>{/* end main content */}

        {/* Sidebar: social share */}
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-6 bg-slate-900 rounded-2xl p-5 space-y-4">
            <SocialSharePanel
              builderId={builder.id}
              builderName={builder.name}
              builderSlug={builder.id}
            />
          </div>
        </div>
      </div>{/* end flex row */}
      </div>
    </div>
  );
}