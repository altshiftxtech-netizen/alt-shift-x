import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { downloadAsset } from '@/components/upkeeper/creativeAssets';
export default function UpkeeperArticleDraft({article}) {
  return <section className="creative-panel" aria-label="Master article draft"><h2>Article Draft</h2>{article?<><h3 className="text-xl font-semibold">{article.title}</h3><p className="text-muted-foreground">{article.excerpt}</p><div className="space-y-3 break-words" data-testid="master-article"><ReactMarkdown>{article.body}</ReactMarkdown></div><Button onClick={()=>downloadAsset(new Blob([`# ${article.title}\n\n${article.body}`],{type:'text/markdown'}),'article.md')}>Download article</Button><p className="text-xs text-muted-foreground">Draft only. Nothing has been published.</p></>:<p>Describe an article in the master prompt, then run the engine.</p>}</section>;
}