import React from 'react';
import { Button } from '@/components/ui/button';
import HeyCatchIntentRadar from '@/components/upkeeper/HeyCatchIntentRadar';

export default function HeyCatchCampaignResults({ result, onCopy }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));
    const a = document.createElement('a'); a.href=url; a.download='heycatch-campaign-brief.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  return <div className="space-y-6" data-testid="heycatch-results">
    <section className="rounded-xl border p-4 space-y-3">
      <h3 className="text-lg font-semibold">1. Reverse ICP · {result.product}</h3>
      <p>{result.value_proposition}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><h4 className="font-semibold">Target audience</h4><ul className="list-disc pl-5 text-sm">{result.audience.map((v,i)=><li key={i}>{v}</li>)}</ul></div>
        <div><h4 className="font-semibold">Likely objections</h4><ul className="list-disc pl-5 text-sm">{result.objections.map((v,i)=><li key={i}>{v}</li>)}</ul></div>
      </div>
      <p className="text-sm text-muted-foreground">{result.limitations}</p>
      <p className="text-xs text-muted-foreground">Researched {new Date(result.researched_at).toLocaleString()} · Audience and objections may include inferences.</p>
      <div className="flex flex-wrap gap-3">{result.sources.map((s,i)=><a key={i} className="text-xs underline break-all" href={s} target="_blank" rel="noopener noreferrer">Source {i+1}</a>)}</div>
    </section>
    <HeyCatchIntentRadar discussions={result.discussions} onCopy={onCopy}/>
    <section className="space-y-3"><h3 className="text-lg font-semibold">4. Three-week milestone calendar</h3>
      <div className="grid md:grid-cols-3 gap-3">{result.weeks.map((week,i)=><article key={i} className="rounded-xl border p-4 space-y-3"><h4 className="font-semibold">{week.title}</h4><ul className="text-sm list-disc pl-4 space-y-2">{week.actions.map((a,j)=><li key={j}>{a}</li>)}</ul><p className="text-sm text-muted-foreground">Goal: {week.goal}</p></article>)}</div>
    </section>
    <section className="space-y-3"><h3 className="text-lg font-semibold">Social thread drafts</h3>{result.social_posts.map((p,i)=><article key={i} className="border rounded-xl p-4 space-y-2"><h4 className="font-semibold">{p.platform}</h4><p className="text-sm whitespace-pre-wrap">{p.text}</p><Button variant="outline" onClick={()=>onCopy(p.text)}>Copy post</Button></article>)}</section>
    <div className="flex flex-wrap gap-3"><Button onClick={()=>onCopy(JSON.stringify(result,null,2))}>Batch copy campaign</Button><Button variant="outline" onClick={download}>Fast-Ship campaign brief</Button></div>
    <p className="text-xs text-muted-foreground">This brief includes analysis, sourced opportunities, replies, social drafts and roadmap. Use Fast-Ship Hub to bundle your logo kit and rendered reel. Goals are not guaranteed customer outcomes.</p>
  </div>;
}