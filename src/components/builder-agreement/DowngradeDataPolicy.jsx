import React from "react";
import { Database, ArrowDownCircle, Lock, CheckCircle2 } from "lucide-react";

/**
 * DowngradeDataPolicy — explains the "Free baseline + Paid addendum" model:
 * everyone is bound by the same free baseline terms; paid simply adds benefits on top.
 * When a paid user downgrades to Free, ALL their data is preserved — only paid-only
 * benefits are hidden until they re-subscribe.
 */
export default function DowngradeDataPolicy() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Free Baseline & Paid Addendum</h2>

      {/* Unified baseline */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white mb-1">One Agreement for Everyone</h3>
            <p className="text-sm text-slate-400">
              All builders — free or paid — are bound by the same baseline Builder Agreement and
              Component Integrity & Escrow Policy above. A paid subscription does not change your
              core terms; it simply <strong className="text-white">adds benefits on top</strong> of
              the free baseline (e.g. enterprise visibility, advanced analytics, reduced escrow tiers).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white mb-1">Your Data Is Always Yours</h3>
            <p className="text-sm text-slate-400">
              Everything you build and create — your profile, published components, badges,
              installs, reviews, revenue history, and account information —
              is <strong className="text-white">permanently preserved</strong> regardless of your
              plan. Upgrading from Free to Paid keeps all of it. Downgrading from Paid to Free keeps
              all of it too.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ArrowDownCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white mb-1">Downgrade to Free — What Changes</h3>
            <p className="text-sm text-slate-400 mb-2">
              If your paid subscription is cancelled or expires, your account automatically reverts
              to the <strong className="text-white">Free tier</strong>. No data is deleted. The only
              change is that <strong className="text-white">paid-only benefits are hidden</strong>{" "}
              until you re-subscribe — at which point they reappear instantly, exactly as you left them.
            </p>
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Hidden on Free: advanced analytics suite, enterprise marketplace visibility,
                reduced-escrow tiers, and other paid-tier features. Your underlying records stay
                intact and reactivate the moment you upgrade again.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}