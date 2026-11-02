import React, { useState } from 'react';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { downloadAsset, logoKit } from '@/components/upkeeper/creativeAssets';
export default function FastShipHub({assets,onTab}) {
  const [selected,setSelected]=useState({research:true,social:true,logo:true,reel:true}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const ready={research:!!assets.campaign,social:!!assets.campaign,logo:true,reel:!!assets.reel};
  const blocked=Object.keys(selected).some(key=>selected[key]&&!ready[key])||!Object.values(selected).some(Boolean);
  const exportAll=async()=>{
    setBusy(true);setError('');setNotice('');
    try {
      const zip=new JSZip(), files=[];
      const add=(name,data)=>{zip.file(name,data);files.push(name);};
      if(selected.research){add('campaign/research.json',JSON.stringify(assets.campaign,null,2));add('campaign/source.txt',assets.campaign.url);}
      if(selected.social)add('campaign/social-threads.md',assets.campaign.social_posts.map(p=>`## ${p.platform}\n\n${p.text}`).join('\n\n'));
      if(selected.logo){const kit=await logoKit(assets.logo);for(const [name,blob] of Object.entries(kit))add('logo/'+name,blob);}
      if(selected.reel)add('video/campaign-reel.'+assets.reel.extension,assets.reel.blob);
      add('manifest.json',JSON.stringify({created_at:new Date().toISOString(),source:assets.campaign?.url||'',files:[...files],reel:selected.reel?{width:assets.reel.width,height:assets.reel.height,seconds:assets.reel.seconds}:null},null,2));
      const bundle=await zip.generateAsync({type:'blob',compression:'STORE'});downloadAsset(bundle,'heycatch-campaign-assets.zip');setNotice(`Bundle ready: ${files.length} files · ${(bundle.size/1048576).toFixed(1)} MB`);
    }catch(e){setError(e.message);}finally{setBusy(false);}
  };
  return <section className="creative-panel" aria-label="Fast-Ship Hub"><div><p className="creative-eyebrow">ONE CAMPAIGN / ONE DOWNLOAD</p><h2>Fast-Ship Hub</h2><p className="text-sm text-muted-foreground">Select assets for a single ZIP. Everything stays in this browser session; export before leaving.</p></div>
    <div className="grid sm:grid-cols-2 gap-3">{Object.entries({research:'Research copy & sources',social:'Social thread drafts',logo:'Logo kit · SVG + PWA + favicon',reel:'Rendered reel video'}).map(([key,label])=><label key={key} className="flex items-center gap-3 rounded-xl border p-4"><input type="checkbox" checked={selected[key]} disabled={busy} onChange={e=>setSelected({...selected,[key]:e.target.checked})}/><span className="text-sm">{label}<span className="block text-xs text-muted-foreground">{ready[key]?'Ready':'Not created yet'}</span></span></label>)}</div>
    {!assets.campaign && <Button variant="outline" onClick={()=>onTab('autopilot')}>Research campaign first</Button>}
    {!assets.reel && <Button variant="outline" onClick={()=>onTab('reel')}>Create reel in studio</Button>}
    <Button disabled={busy||blocked} onClick={exportAll}>{busy?'Packaging assets…':'Export All Campaign Assets'}</Button>
    {blocked && <p className="text-sm text-muted-foreground">Create the missing selected assets, or deselect them to export a partial kit.</p>}
    {notice && <p role="status" data-testid="bundle-ready">{notice}</p>}{error&&<p role="alert" className="text-destructive">{error}</p>}
  </section>;
}