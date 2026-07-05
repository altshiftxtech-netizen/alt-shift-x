import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { EM } from "@/components/expertmind/emTokens";
import { EmLaunchProvider } from "@/components/expertmind/EmLaunchContext";
import EmPaywallModal from "@/components/expertmind/EmPaywallModal";
import EmNav from "@/components/expertmind/EmNav";
import EmHero from "@/components/expertmind/EmHero";
import EmWhy from "@/components/expertmind/EmWhy";
import EmProcess from "@/components/expertmind/EmProcess";
import EmOutputs from "@/components/expertmind/EmOutputs";
import EmEnterprise from "@/components/expertmind/EmEnterprise";
import EmRevenue from "@/components/expertmind/EmRevenue";
import EmVaultPricing from "@/components/expertmind/EmVaultPricing";
import EmFinalCta from "@/components/expertmind/EmFinalCta";
import EmFooter from "@/components/expertmind/EmFooter";
import EmExtractionConsole from "@/components/expertmind/EmExtractionConsole";

/**
 * ExpertMind™ — premium executive landing page (Alt+Shift+X.tech).
 * Connected: "Launch ExpertMind Extraction" opens the live extraction console
 * (BOB-EM-1.0) with a hardwired runtime model switcher.
 */
export default function ExpertMind() {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [paywall, setPaywall] = useState(null); // null | { isGuest: boolean }

  // Gate the paid tool: admins + paying members open the console directly,
  // guests and free-tier visitors get the paywall (the landing page stays public).
  const launchConsole = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin") { setConsoleOpen(true); return; }
      const subs = await base44.entities.Subscription.filter({ user_id: user.id });
      const sub = subs[0];
      const paying = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
      if (paying) { setConsoleOpen(true); } else { setPaywall({ isGuest: false }); }
    } catch {
      setPaywall({ isGuest: true });
    }
  };

  return (
    <EmLaunchProvider value={launchConsole}>
      <div style={{ background: EM.bg, color: EM.text, fontFamily: "Inter, 'IBM Plex Sans', system-ui, sans-serif" }}>
        <EmNav />
        <main>
          <EmHero />
          <EmWhy />
          <EmProcess />
          <EmOutputs />
          <EmEnterprise />
          <EmRevenue />
          <EmVaultPricing />
          <EmFinalCta />
        </main>
        <EmFooter />
      </div>
      {consoleOpen && <EmExtractionConsole onClose={() => setConsoleOpen(false)} />}
      <EmPaywallModal open={!!paywall} isGuest={paywall?.isGuest} onClose={() => setPaywall(null)} />
    </EmLaunchProvider>
  );
}