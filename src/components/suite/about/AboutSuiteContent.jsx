import React, { useId, useState } from 'react';
import { SUITE_TABS } from '@/components/suite/about/aboutSuiteData';
import AboutSuiteOverview from '@/components/suite/about/AboutSuiteOverview';
import AboutSuiteNodes from '@/components/suite/about/AboutSuiteNodes';
import AboutSuiteComparisons from '@/components/suite/about/AboutSuiteComparisons';
import AboutSuiteAudience from '@/components/suite/about/AboutSuiteAudience';
import AboutSuiteSecurity from '@/components/suite/about/AboutSuiteSecurity';
import AboutSuiteCta from '@/components/suite/about/AboutSuiteCta';
const PANELS = { overview: AboutSuiteOverview, nodes: AboutSuiteNodes, comparisons: AboutSuiteComparisons, audience: AboutSuiteAudience, security: AboutSuiteSecurity };
export default function AboutSuiteContent({ onPasses, onReturn }) {
  const [activeTab, setActiveTab] = useState('overview');
  const id = useId(), Panel = PANELS[activeTab];
  const handleKey = (event, index) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? SUITE_TABS.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + SUITE_TABS.length) % SUITE_TABS.length;
    setActiveTab(SUITE_TABS[next].id);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
  };
  return <>
    <section className="about-suite-hero relative overflow-hidden pt-16 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] sm:text-xs font-mono mb-4">THE SOVEREIGN ENTERPRISE STANDARD</div>
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Software You Actually Own.<br /><span className="bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent">Zero Cloud Token Tax. Zero Data Bleed.</span></h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">The Alt+Shift+X Enterprise Suite is an interconnected matrix of 8 specialized sovereign platforms. By executing mission-critical compute in client-side WebGPU, WebAssembly, and Cloudflare edge proxies, we replace fragile, token-metered SaaS subscriptions with deterministic, permanent computing power.</p>
      <div role="tablist" aria-label="Explore the sovereign suite" className="flex flex-wrap items-center justify-center gap-2 mt-8">{SUITE_TABS.map((tab, index) => <button key={tab.id} type="button" role="tab" id={`${id}-${tab.id}-tab`} aria-selected={activeTab === tab.id} aria-controls={`${id}-panel`} tabIndex={activeTab === tab.id ? 0 : -1} onKeyDown={event => handleKey(event, index)} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors border ${activeTab === tab.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent border-border'}`}>{tab.label}</button>)}</div>
    </section>
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${activeTab}-tab`} tabIndex={0}><Panel /></div>
      <AboutSuiteCta onPasses={onPasses} onReturn={onReturn} />
    </main>
  </>;
}