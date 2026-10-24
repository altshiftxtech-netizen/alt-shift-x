import React from 'react';
import { Link } from 'react-router-dom';
export default function AboutSuiteCta({ onPasses, onReturn }) {
  return <section className="mt-12 text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-primary/15 to-transparent border border-primary/30">
    <h2 className="text-xl sm:text-2xl font-black mb-2">Ready to Deploy Sovereign Infrastructure?</h2><p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-xl mx-auto">Choose a Sprint, Flex, or Duo pass for focused workloads, or unlock the All-Access Apex Pass for the complete suite.</p>
    <div className="flex flex-wrap items-center justify-center gap-4"><Link to="/suite?modal=sovereignpass" onClick={onPasses} className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs sm:text-sm hover:bg-primary/90">View Sovereign Passes →</Link><Link to="/suite" onClick={onReturn} className="px-6 py-3 rounded-2xl bg-secondary hover:bg-accent border border-border font-bold text-xs sm:text-sm">Return to JARVIS Proving Ground</Link></div>
  </section>;
}