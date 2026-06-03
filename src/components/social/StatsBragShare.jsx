import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Copy, Check, Twitter, Linkedin, Facebook, Lock, ExternalLink } from "lucide-react";

const PLATFORMS = [
  {
    key: "twitter",
    label: "X / Twitter",
    icon: Twitter,
    color: "bg-black hover:bg-gray-900 text-white",
    getUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "bg-[#0077b5] hover:bg-[#005f8d] text-white",
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "bg-[#1877f2] hover:bg-[#145fce] text-white",
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

/**
 * Lets a builder boast their stats and share their personal profile webpage.
 * The profile webpage is a paid-tier perk — gated when `hasProfilePage` is false.
 */
export default function StatsBragShare({ builderId, builderName, slug, stats, hasProfilePage }) {
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://altshiftx.tech/builders/${builderId}`;
  const { installs = 0, avgTrust = 0, components = 0, revenue = 0 } = stats || {};

  const bragText = `🏗️ My AI components on @AltShiftXMarket: ${installs.toLocaleString()} installs · ${avgTrust} avg trust score · ${components} components shipped. Check out my work 👇`;

  const trackShare = (platform) => {
    if (!builderId) return;
    base44.entities.SocialShare.create({
      builder_id: builderId,
      platform,
      share_url: profileUrl,
    }).catch(() => {});
  };

  const handleShare = (p) => {
    if (!hasProfilePage) return;
    window.open(p.getUrl(profileUrl, bragText), "_blank", "noopener,noreferrer,width=600,height=500");
    trackShare(p.key);
  };

  const handleCopy = () => {
    if (!hasProfilePage) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare("copy_link");
  };

  const STAT_CARDS = [
    { label: "Installs", value: installs.toLocaleString() },
    { label: "Avg Trust", value: avgTrust },
    { label: "Components", value: components },
    { label: "Revenue", value: `$${revenue.toLocaleString()}` },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Brag Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500">
          Show off your numbers and share your public builder page across socials.
        </p>

        {/* Stat preview */}
        <div className="grid grid-cols-4 gap-2">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl py-3 text-center border border-slate-100">
              <p className="text-lg font-black text-slate-900 leading-none">{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {hasProfilePage ? (
          <>
            {/* Profile URL */}
            <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-3 py-2 border border-violet-100">
              <span className="text-xs text-violet-700 font-mono flex-1 truncate">{profileUrl}</span>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-700">
                <ExternalLink className="w-4 h-4" />
              </a>
              <button onClick={handleCopy} className="text-violet-400 hover:text-violet-700 transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleShare(p)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${p.color}`}
                >
                  <p.icon className="w-3.5 h-3.5" /> {p.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <Lock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 mb-1">Your public profile page is a paid perk</p>
            <p className="text-xs text-slate-500 mb-3">
              Upgrade your plan to unlock a shareable builder webpage and start broadcasting your stats.
            </p>
            <a href="/pricing" className="inline-block text-xs font-semibold bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-lg transition-colors">
              View Plans
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}