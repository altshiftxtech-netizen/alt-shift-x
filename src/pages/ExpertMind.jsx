import React, { useState } from "react";
import { EM } from "@/components/expertmind/emTokens";
import { EmLaunchProvider } from "@/components/expertmind/EmLaunchContext";
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

  return (
    <EmLaunchProvider value={() => setConsoleOpen(true)}>
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
    </EmLaunchProvider>
  );
}