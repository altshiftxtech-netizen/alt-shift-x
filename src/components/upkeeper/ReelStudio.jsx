import React,{useMemo} from 'react';
import ReelPreview from '@/components/upkeeper/ReelPreview';
import UpkeeperReferenceDock from '@/components/upkeeper/UpkeeperReferenceDock';
import UpkeeperCinemaSequencer from '@/components/upkeeper/UpkeeperCinemaSequencer';
import CinemaExportControls from '@/components/upkeeper/CinemaExportControls';
import UpkeeperAudioSynthesizer from '@/components/upkeeper/UpkeeperAudioSynthesizer';
import {cinemaSettings} from '@/components/upkeeper/cinemaSpec';
import UpkeeperWalkthroughControls from '@/components/upkeeper/UpkeeperWalkthroughControls';
export default function ReelStudio({assets,onReel,onBusy,onPatch,disabled}) {
  const update=cinema=>onPatch({cinema,reel:null});
  const cinema=useMemo(()=>({...cinemaSettings(assets.cinema),walkthrough:{...assets.cinema?.walkthrough,sourceAspect:assets.cinemaRef?.width&&assets.cinemaRef?.height?assets.cinemaRef.width/assets.cinemaRef.height:16/9}}),[assets.cinema,assets.cinemaRef]);
  return <section className="creative-panel" aria-label="4K Reel Studio">
    <div><p className="creative-eyebrow">CINEMA / VECTOR TEXT / 4K</p><h2>Cinema Visual & Dynamic Reel Engine</h2><p className="text-sm text-muted-foreground">Canonical commercial pacing, exact vector titles and synchronized music. Generate visuals or attach a reference clip, then edit the wording and export vertically or widescreen.</p></div>
    <UpkeeperReferenceDock settings={assets.cinema||{}} reference={assets.cinemaRef} onChange={update} onReference={cinemaRef=>onPatch({cinemaRef,reel:null})} disabled={disabled}/>
    {!assets.campaign&&!assets.cinemaRef&&<p role="status" className="text-sm text-muted-foreground">Describe your product in the master prompt and run the engine to generate the script and two cinema images. Preview shows the layout until then.</p>}
    {assets.campaign&&<p role="status" data-testid="cinema-ready" className="text-sm">{assets.campaign.product} · {assets.campaign.hero_url?'Cinema hero & b-roll ready':'Campaign-based scenes'}</p>}
    <ReelPreview campaign={assets.campaign} logo={assets.logo} url={assets.campaign?.url||''} settings={cinema} reference={assets.cinemaRef}/>
    <UpkeeperWalkthroughControls settings={cinema} onChange={update} disabled={disabled}/>
    <UpkeeperCinemaSequencer settings={cinema} onChange={update} campaign={assets.campaign} disabled={disabled}/>
    <UpkeeperAudioSynthesizer value={assets.audioSynth} onChange={audioSynth=>onPatch({audioSynth,reel:null})} durations={cinemaSettings(assets.cinema).durations} reference={assets.cinemaRef} referenceAudio={assets.cinema?.referenceAudio!==false} disabled={disabled}/>
    <CinemaExportControls assets={{...assets,cinema}} onReel={onReel} onBusy={onBusy}/>
  </section>;
}