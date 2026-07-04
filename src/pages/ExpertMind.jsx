import React from "react";
import { EM } from "@/components/expertmind/emTokens";
import EmNav from "@/components/expertmind/EmNav";
import EmHero from "@/components/expertmind/EmHero";
import EmWhy from "@/components/expertmind/EmWhy";
import EmProcess from "@/components/expertmind/EmProcess";
import EmOutputs from "@/components/expertmind/EmOutputs";
import EmEnterprise from "@/components/expertmind/EmEnterprise";
import EmRevenue from "@/components/expertmind/EmRevenue";
import EmFinalCta from "@/components/expertmind/EmFinalCta";
import EmFooter from "@/components/expertmind/EmFooter";

/**
 * ExpertMind™ — premium executive landing page (Alt+Shift+X).
 * Standalone & intentionally UNCONNECTED: all CTAs are static placeholders
 * until wiring instructions are provided.
 */
export default function ExpertMind() {
  return (
    <div style={{ background: EM.bg, color: EM.text, fontFamily: "Inter, 'IBM Plex Sans', system-ui, sans-serif" }}>
      <EmNav />
      <main>
        <EmHero />
        <EmWhy />
        <EmProcess />
        <EmOutputs />
        <EmEnterprise />
        <EmRevenue />
        <EmFinalCta />
      </main>
      <EmFooter />
    </div>
  );
}