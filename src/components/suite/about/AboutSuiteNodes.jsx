import React from 'react';
import { SOVEREIGN_NODES } from '@/components/suite/about/aboutSuiteData';
export default function AboutSuiteNodes() {
  return <div className="space-y-6">
    <div className="text-center mb-6"><h2 className="text-xl font-black">Explore the 8 Specialized Enterprise Nodes</h2><p className="text-xs text-muted-foreground mt-1">Each node operates independently or syncs through our unified cross-database registry.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{SOVEREIGN_NODES.map(node => <article key={node.id} data-node={node.id} className="about-suite-node min-w-0 p-5 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
      <div><div className="flex flex-wrap items-center justify-between gap-2 mb-2"><h3 className="text-base font-bold flex items-center gap-2"><span className="about-suite-node-dot w-2.5 h-2.5 rounded-full shrink-0" /><span>{node.name}</span></h3><span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground">{node.heroMetric}</span></div>
        <p className="text-xs text-primary/90 font-medium mb-2">{node.tagline}</p><p className="text-xs text-muted-foreground leading-relaxed mb-4">{node.summary}</p></div>
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border"><span className="text-[11px] font-mono text-muted-foreground">Route: {node.route}</span><a href={node.route} className="text-xs font-bold text-primary hover:text-primary/80">Explore Platform →</a></div>
    </article>)}</div>
  </div>;
}