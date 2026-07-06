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
      <div className="relative min-h-screen" style={{ color: EM.text, fontFamily: "Inter, 'IBM Plex Sans', system-ui, sans-serif" }}>
        {/* Fixed video background */}
        <video
          className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
          src="https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/7bfe3d5b4_435914f42_generated_video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Frosted glass overlay — lets the video shimmer through a blurred,
            translucent pane so the whole page reads as premium "glass" while the
            executive white-on-content theme stays crisp and readable. */}
        <div
          className="fixed inset-0 z-0 pointer-events-none backdrop-blur-xl"
          style={{
            background: "linear-gradient(155deg, rgba(255,255,255,0.72) 0%, rgba(244,247,252,0.66) 45%, rgba(255,255,255,0.78) 100%)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />
        {/* Subtle top sheen + edge vignette to make the glass "pop" */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(1200px 500px at 50% -10%, rgba(255,255,255,0.9), transparent 60%), radial-gradient(900px 600px at 100% 110%, rgba(200,169,91,0.12), transparent 60%)",
          }}
        />

        <div className="relative z-10">
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
      </div>
      {consoleOpen && <EmExtractionConsole onClose={() => setConsoleOpen(false)} />}
      <EmPaywallModal open={!!paywall} isGuest={paywall?.isGuest} onClose={() => setPaywall(null)} />
    </EmLaunchProvider>
  );
}