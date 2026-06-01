import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Download, Twitter, Linkedin, Facebook } from "lucide-react";

const VIDEO_URL = "https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/a2ed8f4c7_Altshiftx.mov";

const PLATFORMS = [
  {
    key: "twitter",
    label: "X / Twitter",
    color: "bg-black hover:bg-gray-900 text-white",
    icon: Twitter,
    getUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    color: "bg-[#0077b5] hover:bg-[#005f8d] text-white",
    icon: Linkedin,
    getUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "bg-[#1877f2] hover:bg-[#145fce] text-white",
    icon: Facebook,
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: null,
    color: "bg-black hover:bg-gray-900 text-white border border-pink-500",
    getUrl: null, // TikTok doesn't support direct sharing — just download the video
  },
  {
    key: "instagram",
    label: "Reels / Shorts",
    icon: null,
    color: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white",
    getUrl: null, // Same — download video
  },
];

export default function SocialSharePanel({ builderId, builderName, builderSlug, componentId, componentName }) {
  const [copied, setCopied] = useState(false);
  const [videoDownloading, setVideoDownloading] = useState(false);

  const profileUrl = `https://altshiftx.tech/${builderSlug || builderName?.toLowerCase().replace(/\s+/g, "")}`;
  const shareText = `Check out ${builderName}'s AI construction components on Alt+Shift+X — ${componentName ? `"${componentName}" and more` : "built for the future of construction"}.`;

  const trackShare = async (platform, videoDownloaded = false) => {
    if (!builderId) return;
    base44.entities.SocialShare.create({
      builder_id: builderId,
      platform,
      component_id: componentId || "",
      component_name: componentName || "",
      share_url: profileUrl,
      video_downloaded: videoDownloaded,
    }).catch(() => {});
  };

  const handleShare = (platform) => {
    const p = PLATFORMS.find(x => x.key === platform);
    if (p?.getUrl) {
      window.open(p.getUrl(profileUrl, shareText), "_blank", "noopener,noreferrer,width=600,height=500");
    }
    trackShare(platform);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare("copy_link");
  };

  const handleVideoDownload = (platform) => {
    setVideoDownloading(true);
    const a = document.createElement("a");
    a.href = VIDEO_URL;
    a.download = `altshiftx-${builderSlug || "builder"}-promo.mov`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setVideoDownloading(false), 2000);
    trackShare(platform, true);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-bold text-white">Share This Profile</h3>
      </div>

      {/* Profile URL */}
      <div className="flex items-center gap-2 bg-black/30 rounded-xl px-3 py-2 border border-white/10">
        <span className="text-xs text-violet-300 font-mono flex-1 truncate">{profileUrl}</span>
        <button onClick={handleCopy} className="text-white/60 hover:text-white transition-colors">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-2">
        {PLATFORMS.filter(p => p.getUrl).map(p => (
          <button
            key={p.key}
            onClick={() => handleShare(p.key)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${p.color}`}
          >
            {p.icon && <p.icon className="w-3.5 h-3.5" />}
            {p.label}
          </button>
        ))}
      </div>

      {/* Video download for TikTok/Reels/Shorts */}
      <div className="border-t border-white/10 pt-4 space-y-2">
        <p className="text-[11px] text-white/50 font-medium uppercase tracking-wide">Promo Video Loop</p>
        <p className="text-xs text-white/60">Download the branded video loop with your developer URL for TikTok, Reels & Shorts.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleVideoDownload("tiktok")}
            disabled={videoDownloading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-black hover:bg-gray-900 text-white border border-pink-500 transition-all disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" /> TikTok
          </button>
          <button
            onClick={() => handleVideoDownload("instagram")}
            disabled={videoDownloading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white transition-all disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" /> Reels / Shorts
          </button>
        </div>
        <p className="text-[10px] text-white/30 text-center">Video includes: altshiftx.tech/{builderSlug || builderName?.toLowerCase().replace(/\s+/g, "")}</p>
      </div>
    </div>
  );
}