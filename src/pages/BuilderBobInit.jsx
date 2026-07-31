import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, Lock, Terminal, ArrowRight } from "lucide-react";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import BobInit from "@/pages/BobInit";

/**
 * Tier-gated B.O.B.Init for the Builder Portal.
 * Sovereign-tier subscribers and admins get full terminal access.
 * Everyone else sees a paywall with upgrade CTA.
 */
export default function BuilderBobInit() {
  const { status, isAdmin } = useSovereignAccess();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Sovereign tier or admin → full access
  if (status === "sovereign" || isAdmin) {
    return <BobInit navMode="builder" />;
  }

  // Denied / non-sovereign → paywall
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center rounded-2xl border border-[#30363d] bg-[#0d1117] p-8">
        <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 bg-cyan-600/10 border border-cyan-500/30">
          <Terminal className="w-6 h-6 text-cyan-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">B.O.B.Init Requires Sovereign Tier</h1>
        <p className="text-sm text-[#8b949e] mb-6">
          The Machine that Builds Machines is reserved for Sovereign-tier builders. Upgrade to unlock the terminal, hardened modules, and the full build pipeline.
        </p>
        <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3 mb-5 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Current tier: <span className="text-white">{isAdmin ? "Admin" : "Standard / Free"}</span></span>
          </div>
        </div>
        <Button asChild className="w-full bg-gradient-to-r from-[#E6C878] to-[#C8A95B] text-[#0A0A0C] font-bold gap-1.5">
          <Link to="/enterprise"><Crown className="w-4 h-4" /> Upgrade to Sovereign <ArrowRight className="w-4 h-4" /></Link>
        </Button>
        <Link to="/pricing" className="block mt-3 text-xs text-[#484f58] hover:text-[#8b949e]">← View all plans</Link>
      </div>
    </div>
  );
}