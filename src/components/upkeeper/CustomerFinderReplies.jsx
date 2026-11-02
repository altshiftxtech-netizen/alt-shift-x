import React from 'react';
import { Button } from '@/components/ui/button';

export default function CustomerFinderReplies({discussions,onCopy}) {
  return <section className="rounded-xl border p-4 space-y-4 min-w-0" aria-label="Value-First Ghost Replies">
    <h3 className="text-lg font-semibold">2. Value-First Ghost Replies</h3>
    <p className="text-xs text-muted-foreground">Helpful, source-specific drafts. Disclose affiliation, check community rules and review before posting. Nothing is sent automatically.</p>
    {!discussions.length&&<p className="text-sm text-muted-foreground">Replies appear when a verified discussion is found; no invented conversations or endorsements.</p>}
    {discussions.map((item,i)=><article key={item.url+'-'+i} className="space-y-3 border-t pt-4">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline break-words">{item.title}</a>
      <p className="text-sm whitespace-pre-wrap break-words">{item.reply}</p>
      <Button variant="outline" size="sm" onClick={()=>onCopy(item.reply)}>Copy reply {i+1}</Button>
    </article>)}
  </section>;
}