import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Watch, Mic, Loader2, KeyRound, Copy, Check, ShieldCheck, Lock } from "lucide-react";
import UniversalPwaInstall from "@/components/pwa/UniversalPwaInstall";
import { getWearableManifestUrl } from "@/lib/wearableManifest";

// WearableGatewayCard — SOV-WEARABLE-VOICE-1.0.
// Issues a secure API-key gateway for smartwatches (watchOS/Wear OS) & voice
// assistants (Siri/Alexa/Google), plus the glanceable wearable PWA install.
export default function WearableGatewayCard({ isTopTier, isAdmin, loading }) {
  const [user, setUser] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [gatewayKey, setGatewayKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const manifestUrl = useMemo(() => getWearableManifestUrl(), []);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.id) {
          setUser(me);
          const list = await base44.entities.ApiKey.filter({ user_id: me.id, name: "Wearable & Voice Gateway" });
          setActiveCount(list.filter((k) => k.status === "active").length);
        }
      } catch { /* guest */ }
    })();
  }, []);

  const issue = async () => {
    setIssuing(true);
    try {
      const res = await base44.functions.invoke("wearableGateway", { action: "issue" });
      const data = res.data || res;
      setGatewayKey(data);
      setActiveCount((c) => c + 1);
    } catch { /* surface via empty state */ }
    finally { setIssuing(false); }
  };

  const copy = () => {
    if (!gatewayKey?.key) return;
    navigator.clipboard?.writeText(gatewayKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const canUse = isTopTier || isAdmin;

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0 border border-slate-300">
            <Watch className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="font-bold text-[#343A40] text-base flex items-center gap-1.5" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
              Wearable & Voice Gateway
            </h2>
            <p className="text-xs text-slate-400">SOV-WEARABLE-VOICE-1.0 · Smartwatches + Voice Assistants</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          A secure API-key gateway lets your smartwatch (watchOS/Wear OS) and voice assistants (Siri/Alexa/Google) read glanceable substrate status. Install the glanceable PWA on the watch, then authenticate each request with your gateway key.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Checking tier…</div>
        ) : canUse ? (
          <div className="space-y-3">
            {/* Issue gateway key */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-slate-700">Secure API-Key Gateway</span>
              </div>
              {gatewayKey ? (
                <div className="space-y-1.5">
                  <code className="block text-[11px] font-mono text-slate-800 bg-white border border-slate-200 rounded px-2 py-1.5 break-all">{gatewayKey.key}</code>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={copy} className="gap-1.5 text-xs h-7">
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy key"}
                    </Button>
                    <span className="text-[10px] text-slate-400">Store securely — shown once. Masked: {gatewayKey.masked}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Button size="sm" onClick={issue} disabled={issuing} className="gap-1.5 text-xs h-7 bg-slate-800 hover:bg-slate-900">
                    {issuing ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
                    {issuing ? "Issuing…" : "Issue Gateway Key"}
                  </Button>
                  {activeCount > 0 && <p className="text-[10px] text-slate-400">{activeCount} active gateway key{activeCount > 1 ? "s" : ""} on your account.</p>}
                </>
              )}
            </div>

            {/* Install glanceable wearable PWA */}
            <UniversalPwaInstall manifestUrl={manifestUrl} pwaName="ASX Wear" swapManifest zipName="altshiftx-wearable-voice" zipSubtitle="SOV-WEARABLE-VOICE-1.0 · Glanceable substrate access" iconUrl="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png" />

            {/* Voice-assistant wiring note */}
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
              <Mic className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Voice wiring:</span> point your assistant skill at <span className="font-mono">/functions/wearableGateway</span> with header <span className="font-mono">x-api-key: ASX-WG-…</span> and action <span className="font-mono">probe</span> for a glanceable readout.
              </p>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Hardware-bound <strong className="text-slate-700">AOI/REST API</strong> key isolation — voice commands never leak outside the Sovereign shell.
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> TopTier — gateway enabled.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button asChild className="bg-slate-700 hover:bg-slate-800 text-white gap-2 w-full">
              <Link to="/pricing"><Lock className="w-4 h-4" /> Upgrade to Enable</Link>
            </Button>
            <p className="text-xs text-slate-400">Free-tier needs a plan upgrade.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}