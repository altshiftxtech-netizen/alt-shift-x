import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import CosmicBackground from "@/components/CosmicBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Twitter, Linkedin, Facebook, Copy, Download, TrendingUp, Users } from "lucide-react";
import StatsBragShare from "@/components/social/StatsBragShare";

const PAID_PLANS = ["starter", "pro", "enterprise", "base_operator", "strategic_architect", "sovereign_commander"];

const PLATFORM_META = {
  twitter:    { label: "X / Twitter",       icon: Twitter,   color: "text-slate-800",   bg: "bg-slate-100" },
  linkedin:   { label: "LinkedIn",           icon: Linkedin,  color: "text-blue-700",    bg: "bg-blue-50" },
  facebook:   { label: "Facebook",           icon: Facebook,  color: "text-blue-600",    bg: "bg-blue-50" },
  tiktok:     { label: "TikTok",             icon: Download,  color: "text-pink-600",    bg: "bg-pink-50" },
  instagram:  { label: "Reels / Shorts",     icon: Download,  color: "text-purple-600",  bg: "bg-purple-50" },
  copy_link:  { label: "Copy Link",          icon: Copy,      color: "text-slate-500",   bg: "bg-slate-100" },
};

export default function BuilderSocialDashboard() {
  const [user, setUser] = useState(null);
  const [shares, setShares] = useState([]);
  const [stats, setStats] = useState({ installs: 0, avgTrust: 0, components: 0, revenue: 0 });
  const [hasProfilePage, setHasProfilePage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const data = await base44.entities.SocialShare.filter({ builder_id: me.id }, "-created_date", 200);
      setShares(data);

      const [badges, subs] = await Promise.all([
        base44.entities.BuilderBadge.filter({ builder_id: me.id }),
        base44.entities.Subscription.filter({ user_id: me.id }),
      ]);
      const badge = badges?.[0];
      if (badge) {
        setStats({
          installs: badge.total_installs || 0,
          avgTrust: Math.round(badge.avg_rating ? badge.avg_rating * 20 : 0),
          components: badge.component_count || 0,
          revenue: Math.round(badge.total_revenue || 0),
        });
      }
      const sub = subs?.[0];
      setHasProfilePage(sub && sub.status === "active" && PAID_PLANS.includes(sub.plan));

      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  // Aggregate by platform
  const byPlatform = Object.keys(PLATFORM_META).map(key => ({
    key,
    count: shares.filter(s => s.platform === key).length,
    videos: shares.filter(s => s.platform === key && s.video_downloaded).length,
  })).filter(p => p.count > 0);

  const totalShares = shares.length;
  const videoDownloads = shares.filter(s => s.video_downloaded).length;

  // Recent shares
  const recent = shares.slice(0, 20);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CosmicBackground />
      <SharedNav mode="builder" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Social Share Dashboard</h1>
            <p className="text-sm text-slate-500">Track how your profile spreads across platforms</p>
          </div>
        </div>

        {/* Account Card */}
        {user && (
          <Card className="border-violet-100 bg-gradient-to-r from-violet-50 to-white">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Name</p>
                  <p className="font-bold text-slate-900">{user.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Email</p>
                  <p className="font-bold text-slate-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Account ID</p>
                  <p className="font-mono text-xs font-bold text-violet-700">{user.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Profile URL</p>
                  <p className="font-mono text-xs font-bold text-violet-700">
                    altshiftx.tech/{user.full_name?.toLowerCase().replace(/\s+/g, "") || user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brag your stats + share profile page */}
        {user && (
          <StatsBragShare
            builderId={user.id}
            builderName={user.full_name}
            slug={user.full_name?.toLowerCase().replace(/\s+/g, "")}
            stats={stats}
            hasProfilePage={hasProfilePage}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-black text-violet-700">{totalShares}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1"><Share2 className="w-3 h-3" />Total Shares</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-black text-pink-600">{videoDownloads}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1"><Download className="w-3 h-3" />Video Downloads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-black text-blue-600">{byPlatform.length}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Platforms Used</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-3xl font-black text-emerald-600">{shares.filter(s => s.component_id).length}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1"><Users className="w-3 h-3" />Component Shares</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Breakdown */}
        {byPlatform.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700">Shares by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {byPlatform.sort((a, b) => b.count - a.count).map(p => {
                  const meta = PLATFORM_META[p.key];
                  const Icon = meta.icon;
                  const pct = totalShares > 0 ? Math.round((p.count / totalShares) * 100) : 0;
                  return (
                    <div key={p.key} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">{meta.label}</span>
                          <span className="text-slate-400">{p.count} shares{p.videos > 0 ? ` · ${p.videos} videos` : ""}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">Recent Share Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No shares yet — share your profile on social media to start tracking!</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map((s, i) => {
                  const meta = PLATFORM_META[s.platform] || PLATFORM_META.copy_link;
                  const Icon = meta.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                      <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700">{meta.label}</p>
                        {s.component_name && <p className="text-[10px] text-slate-400 truncate">{s.component_name}</p>}
                      </div>
                      {s.video_downloaded && (
                        <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full">Video</span>
                      )}
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(s.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}