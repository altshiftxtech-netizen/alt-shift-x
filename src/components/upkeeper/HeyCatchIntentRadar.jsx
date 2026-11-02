import React from 'react';
import { Button } from '@/components/ui/button';

export default function HeyCatchIntentRadar({ discussions, onCopy }) {
  return <section className="space-y-3" aria-label="Buying-signal intent radar">
    <h3 className="text-lg font-semibold">2. Buying-signal intent radar &amp; 3. Value-first replies</h3>
    <p className="text-sm text-muted-foreground">Public search snapshot, not a live social feed. Check each source, date and community rules before replying. Drafts are never posted automatically.</p>
    {!discussions.length && <p className="rounded-lg border p-4">No source-grounded discussions found in this search. No conversations or replies have been invented.</p>}
    {discussions.map((item,i) => <article key={`${item.url}-${i}`} className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-xs text-muted-foreground">{item.platform} · Posted: {item.posted_at}</p>
      <a className="font-semibold underline break-words" href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
      <blockquote className="border-l-2 pl-3 text-sm">{item.quote}</blockquote>
      <p className="text-xs font-semibold">Suggested reply · review before use</p>
      <p className="text-sm whitespace-pre-wrap">{item.reply}</p>
      <Button variant="outline" onClick={() => onCopy(item.reply)}>Copy reply</Button>
    </article>)}
  </section>;
}