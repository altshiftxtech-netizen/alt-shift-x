import React from 'react';
import { Button } from '@/components/ui/button';
import HeyCatchIntentRadar from '@/components/upkeeper/HeyCatchIntentRadar';
import CustomerFinderProfile from '@/components/upkeeper/CustomerFinderProfile';
import CustomerFinderReplies from '@/components/upkeeper/CustomerFinderReplies';
import CustomerFinderRoadmap from '@/components/upkeeper/CustomerFinderRoadmap';

export default function HeyCatchCampaignResults({ result, onCopy }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));
    const a = document.createElement('a'); a.href=url; a.download='customer-finder-campaign-brief.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  return <div className="space-y-6" data-testid="customer-finder-results">
    <CustomerFinderProfile result={result}/>
    <div className="grid md:grid-cols-3 gap-4 items-start" data-testid="customer-finder-growth-deck">
      <HeyCatchIntentRadar discussions={result.discussions}/>
      <CustomerFinderReplies discussions={result.discussions} onCopy={onCopy}/>
      <CustomerFinderRoadmap weeks={result.weeks}/>
    </div>
    <details className="creative-disclosure"><summary>Social thread drafts</summary><section className="space-y-3 pt-3">{result.social_posts.map((p,i)=><article key={i} className="border rounded-xl p-4 space-y-2"><h4 className="font-semibold">{p.platform}</h4><p className="text-sm whitespace-pre-wrap">{p.text}</p><Button variant="outline" onClick={()=>onCopy(p.text)}>Copy post</Button></article>)}</section></details>
    <div className="flex flex-wrap gap-3"><Button onClick={()=>onCopy(JSON.stringify(result,null,2))}>Batch copy campaign</Button><Button variant="outline" onClick={download}>Fast-Ship campaign brief</Button></div>
    <p className="text-xs text-muted-foreground">This brief includes analysis, sourced opportunities, replies, social drafts and roadmap. Use Fast-Ship Hub to bundle your logo kit and rendered reel. Goals are not guaranteed customer outcomes.</p>
  </div>;
}