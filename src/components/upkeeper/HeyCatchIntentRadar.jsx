import React from 'react';

export default function HeyCatchIntentRadar({ discussions }) {
  return <section className="rounded-xl border p-4 space-y-4 min-w-0" aria-label="Buying-Signal Radar">
    <h3 className="text-lg font-semibold">1. Buying-Signal Radar</h3>
    <p className="text-sm text-muted-foreground">Public search snapshot, not a live social feed. Check each source, date and community rules before replying. Drafts are never posted automatically.</p>
    {!discussions.length && <p className="rounded-lg border p-4">No source-grounded discussions found in this search. No conversations or replies have been invented.</p>}
    {discussions.map((item,i) => <article key={`${item.url}-${i}`} className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-xs text-muted-foreground">{item.platform} · Posted: {item.posted_at}</p>
      <a className="font-semibold underline break-words" href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
      <blockquote className="border-l-2 pl-3 text-sm">{item.quote}</blockquote>

    </article>)}
  </section>;
}