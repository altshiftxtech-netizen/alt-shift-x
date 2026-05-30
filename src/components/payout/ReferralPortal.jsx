import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Share2, Gift, Users, DollarSign } from "lucide-react";

export default function ReferralPortal({ badge }) {
  const [copied, setCopied] = useState(false);

  const referralCode = badge?.referral_code || null;
  const referralLink = referralCode
    ? `https://app.altshiftx.com/marketplace?ref=${referralCode}`
    : null;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      await navigator.share({ title: "Alt+Shift+X Marketplace", text: "Check out AI agent components for construction tech!", url: referralLink });
    } else {
      handleCopy();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Gift className="w-4 h-4 text-violet-500" />
          Builder Referral Portal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left: referral link + stats */}
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Share your referral link. Gold+ builders earn <span className="font-bold text-violet-700">5% commission</span> on all purchases made by referred users (first 12 months).
            </p>

            {referralCode ? (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Your Referral Link</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 truncate">
                    {referralLink}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5 text-xs">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={shareLink} className="shrink-0 bg-violet-700 hover:bg-violet-800 text-white gap-1.5 text-xs">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </Button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Referral code: </span>
                  <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{referralCode}</code>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                Referral code not yet generated. Run the badge calculation from <a href="/admin/gamification" className="underline font-semibold">Gamification Admin</a> to generate your unique code.
              </div>
            )}

            {/* Share buttons */}
            {referralLink && (
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=I+build+AI+agent+components+for+construction+tech+on+%40AltShiftX+—+check+it+out!&url=${encodeURIComponent(referralLink)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-black text-white rounded-lg px-3 py-1.5 hover:opacity-80 transition-opacity"
                >
                  𝕏 Share on X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-blue-700 text-white rounded-lg px-3 py-1.5 hover:opacity-80 transition-opacity"
                >
                  in LinkedIn
                </a>
                <a
                  href={`mailto:?subject=AI agent components for construction tech&body=Check out Alt%2BShift%2BX: ${encodeURIComponent(referralLink)}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-slate-600 text-white rounded-lg px-3 py-1.5 hover:opacity-80 transition-opacity"
                >
                  ✉ Email
                </a>
              </div>
            )}
          </div>

          {/* Right: earnings stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                <Users className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                <div className="text-2xl font-black text-slate-900">{badge?.referral_count || 0}</div>
                <div className="text-[10px] text-slate-400 uppercase">Referrals</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <div className="text-2xl font-black text-emerald-700">${(badge?.referral_earnings || 0).toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 uppercase">Earned</div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 space-y-1.5">
              <p className="text-[11px] font-bold text-violet-800">How Referrals Work</p>
              {[
                "Share your unique link with developers",
                "They sign up and purchase a component",
                "You earn 5% of their spend for 12 months",
                "Referral earnings paid with monthly splits",
                "Gold+ tier required for commission payouts",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-violet-700">
                  <span className="font-black text-violet-400 shrink-0">{i + 1}.</span>{s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}