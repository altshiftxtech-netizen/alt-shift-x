import React from 'react';
import { AUDIENCES } from '@/components/suite/about/aboutSuiteData';
export default function AboutSuiteAudience() {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{AUDIENCES.map((audience, i) => <article key={audience.label} className="p-6 rounded-3xl bg-card border border-border hover:border-primary/40 transition-colors">
    <div className={`about-suite-metric metric-${i} font-mono text-xs mb-1`}>{audience.label}</div><h3 className="text-lg font-bold mb-2">{audience.title}</h3><p className="text-xs text-muted-foreground leading-relaxed mb-4">{audience.description}</p>
    <ul className="text-xs text-secondary-foreground space-y-1.5 font-mono">{audience.items.map(item => <li key={item}>• {item}</li>)}</ul>
  </article>)}</div>;
}