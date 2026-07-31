import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Cpu, Download, Loader2 } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { base44 } from "@/api/base44Client";

// PWA-AGENT-WRAPPER-1.0 — the Generic Office PWA landing page.
// This is the start_url target for the Agent Wrapper PWA manifest.
// It serves as the portable container entry point for AI services.
export default function PwaAgent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => setUser(u)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <SharedNav mode="user" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/04ee9da8c_Copilot_20260730_173833.png"
            alt="Agent Wrapper logo"
            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-300"
          />
          <div>
            <h1 className="text-2xl font-black text-[#343A40]">Agent Wrapper</h1>
            <p className="text-sm text-slate-500">PWA-AGENT-WRAPPER-1.0 · Generic Office Shell</p>
          </div>
        </div>

        {/* Status banner */}
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#343A40]">Shell Status: Inert / Neutral</p>
              <p className="text-xs text-slate-400">
                {loading ? "Initializing..." : user ? `Authorized operator: ${user.email}` : "No operator signed in — shell is dormant."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Capability injection notice */}
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-5 space-y-3">
            <h2 className="font-bold text-[#343A40] text-sm">Capability Injection</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This wrapper is authorized to call existing Magna Dev / Alt+Shift+X component APIs. Deploy to a client by generating a unique manifest for that business's specific AI service.
            </p>
            <Button asChild variant="outline" size="sm" className="border-slate-400 text-slate-600 hover:bg-slate-100 gap-1.5 text-xs">
              <Link to="/dashboard/pwa"><Download className="w-3.5 h-3.5" /> Back to PWA Portal</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Deploy to Client */}
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-5 space-y-3">
            <h2 className="font-bold text-[#343A40] text-sm">Deploy to Client</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate a unique manifest.json for a business's specific AI service. The client PWA inherits the Generic Office aesthetic and neutral shell doctrine.
            </p>
            <Button asChild size="sm" className="bg-[#343A40] hover:bg-black text-[#F8F9FA] gap-1.5 text-xs">
              <Link to="/enterprise"><ArrowRight className="w-3.5 h-3.5" /> Enterprise Deployment</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Shell doctrine */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 pb-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-900">Inert Architectural Shell</p>
              <p className="text-xs text-amber-700 mt-1">
                This PWA is a neutral container. It does not possess intent, governance, or agency. Usage does not create a contract with altshiftx.tech.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2 border-amber-400 text-amber-700 hover:bg-amber-100 gap-1 text-xs">
                <Link to="/legal/sovereign-pwa">Full Disclaimer <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}