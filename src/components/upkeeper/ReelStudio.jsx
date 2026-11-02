import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import ReelPreview from '@/components/upkeeper/ReelPreview';
import { downloadAsset } from '@/components/upkeeper/creativeAssets';
import { recordCampaignReel } from '@/components/upkeeper/recordCampaignReel';
export default function ReelStudio({assets,onReel,onTab,autoRun,onBusy}) {
  const [width,setWidth]=useState(2160),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[error,setError]=useState('');
  const controller=useRef(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  const print=async()=>{
    setBusy(true);onBusy?.(true);setError('');setProgress(0);controller.current=new AbortController();
    try { const reel=await recordCampaignReel({...assets,url:assets.campaign.url,campaign:assets.campaign,width,onProgress:setProgress,signal:controller.current.signal});onReel(reel);downloadAsset(reel.blob,`campaign-reel-${reel.height}p.${reel.extension}`); }
    catch(e){if(!controller.current.signal.aborted)setError(e.message);}finally{setBusy(false);onBusy?.(false);}
  };
  useEffect(()=>{if(autoRun)print();},[autoRun]);
  return <section className="creative-panel" aria-label="4K Reel Studio">
    <div><p className="creative-eyebrow">ZERO-EDIT / 9:16</p><h2>4K Reel Studio</h2><p className="text-sm text-muted-foreground">Nine seconds of synchronized typography, a brand badge and split-screen product brief / source work. Silent, browser-rendered video.</p></div>
    {!assets.campaign && <div className="rounded-xl border p-4"><p>Research a HeyCatch link to compile a reel from your actual campaign.</p><Button variant="outline" onClick={()=>onTab('autopilot')}>Open HeyCatch</Button></div>}
    <div className="grid md:grid-cols-2 gap-6 items-start"><ReelPreview campaign={assets.campaign} logo={assets.logo} url={assets.campaign?.url||''}/><div className="space-y-4">
      <p className="text-sm">Preview: 1080×1920. Export is redrawn at the selected resolution, not a stretched preview.</p>
      <label className="block text-sm">Export resolution<select aria-label="Export resolution" disabled={busy} className="creative-select" value={width} onChange={e=>setWidth(Number(e.target.value))}><option value={1080}>1080p · 1080×1920</option><option value={2160}>4K · 2160×3840</option><option value={4320}>8K · 4320×7680</option></select></label>
      <p className="text-xs text-muted-foreground">4K/8K depend on your browser encoder and device memory. Keep this tab visible during capture. WebM is preferred; MP4 is used only when supported.</p>
      <Button disabled={busy||!assets.campaign} onClick={print}>{busy?`Printing reel… ${progress}%`:'Print Full Reel'}</Button>
      {busy && <div role="status"><progress className="w-full" max={100} value={progress}/><p className="text-sm">Recording locally. No uploads or AI video credits.</p></div>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {assets.reel && <div role="status" className="rounded-xl border p-4"><strong>Reel ready · {assets.reel.width}×{assets.reel.height}</strong><p className="text-sm">{assets.reel.extension.toUpperCase()} · {(assets.reel.blob.size/1048576).toFixed(1)} MB · 9 seconds</p><Button variant="outline" onClick={()=>downloadAsset(assets.reel.blob,`campaign-reel.${assets.reel.extension}`)}>Download reel again</Button></div>}
    </div></div>
  </section>;
}