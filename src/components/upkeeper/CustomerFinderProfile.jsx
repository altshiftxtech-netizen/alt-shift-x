import React from 'react';

export default function CustomerFinderProfile({result}) {
  const profile=result.icp;
  const fields=[['Target Buyer Persona (ICP)',profile?.target_buyer_persona||result.audience?.join('; ')],['Core Pain Points Solved',profile?.pain_points],['Key Differentiators / Unfair Advantage',profile?.differentiators],['Desired Conversion Action',profile?.conversion_action]];
  return <section className="rounded-xl border bg-muted/40 p-4 sm:p-5 space-y-4" aria-label="Normalized buyer profile">
    <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Unified customer profile · {result.input_mode==='manual'?'Product prompt':'Public website'}</p><h3 className="text-xl font-semibold mt-1 break-words">{result.product}</h3><p className="text-sm mt-2">{result.value_proposition}</p></div>
    <dl className="grid sm:grid-cols-2 gap-4">{fields.map(([label,value])=><div key={label} className="min-w-0"><dt className="font-semibold text-sm">{label}</dt><dd className="text-sm mt-1 break-words">{Array.isArray(value)?<ul className="list-disc pl-4 space-y-1">{value.map((item,i)=><li key={i}>{item}</li>)}</ul>:value||'Rerun Customer Finder to normalize this older brief.'}</dd></div>)}</dl>
    <details className="creative-disclosure"><summary>Product metadata &amp; objections</summary><div className="space-y-3 pt-3">{result.metadata&&<dl className="text-sm space-y-2"><div><dt className="font-semibold">Page title</dt><dd>{result.metadata.title}</dd></div><div><dt className="font-semibold">Description</dt><dd>{result.metadata.description}</dd></div><div><dt className="font-semibold">Primary CTA</dt><dd>{result.metadata.cta}</dd></div></dl>}<div><h4 className="font-semibold text-sm">Likely objections</h4><ul className="list-disc pl-4 text-sm">{(result.objections||[]).map((item,i)=><li key={i}>{item}</li>)}</ul></div></div></details>
    <p className="text-xs text-muted-foreground">{result.limitations}</p>
    <p className="text-xs text-muted-foreground">Researched {new Date(result.researched_at).toLocaleString()} · Profiles and advantages may include labeled inferences.</p>
    <div className="flex flex-wrap gap-3">{(result.sources||[]).map((source,i)=><a key={i} className="text-xs underline break-all" href={source} target="_blank" rel="noopener noreferrer">Source {i+1}</a>)}</div>
  </section>;
}