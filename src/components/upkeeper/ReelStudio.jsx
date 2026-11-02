import React from 'react';
import ReelPreview from '@/components/upkeeper/ReelPreview';
import UpkeeperReferenceDock from '@/components/upkeeper/UpkeeperReferenceDock';
import UpkeeperCinemaSequencer from '@/components/upkeeper/UpkeeperCinemaSequencer';
import CinemaExportControls from '@/components/upkeeper/CinemaExportControls';
import UpkeeperAudioSynthesizer from '@/components/upkeeper/UpkeeperAudioSynthesizer';
import {cinemaSettings} from '@/components/upkeeper/cinemaSpec';
export default function ReelStudio({assets,onReel,onBusy,onPatch,disabled}) {
  const update=cinema=>onPatch({cinema,reel:null});
  return <section className="creative-panel" aria-label="4K Reel Studio">
    <div><p className="creative-eyebrow">CINEMA / 9:16</p><h2>Cinema Visual & Dynamic Reel Engine</h2><p className="text-sm text-muted-foreground">Four scenes, cinematic hero and b-roll imagery, kinetic captions and a branded finish. Generate from the master prompt, then refine pacing before printing.</p></div>
    <UpkeeperReferenceDock settings={assets.cinema||{}} reference={assets.cinemaRef} onChange={update} onReference={cinemaRef=>onPatch({cinemaRef,reel:null})} disabled={disabled}/>
    {!assets.campaign&&<p role="status" className="text-sm text-muted-foreground">Describe your product in the master prompt and run the engine to generate the script and two cinema images. Preview shows the layout until then.</p>}
    {assets.campaign&&<p role="status" data-testid="cinema-ready" className="text-sm">{assets.campaign.product} · {assets.campaign.hero_url?'Cinema hero & b-roll ready':'Campaign-based scenes'}</p>}
    <ReelPreview campaign={assets.campaign} logo={assets.logo} url={assets.campaign?.url||''} settings={assets.cinema} reference={assets.cinemaRef}/>
    <UpkeeperCinemaSequencer settings={assets.cinema} onChange={update} campaign={assets.campaign} disabled={disabled}/>
    <UpkeeperAudioSynthesizer value={assets.audioSynth} onChange={audioSynth=>onPatch({audioSynth,reel:null})} durations={cinemaSettings(assets.cinema).durations} reference={assets.cinemaRef} referenceAudio={assets.cinema?.referenceAudio!==false} disabled={disabled}/>
    <CinemaExportControls assets={assets} onReel={onReel} onBusy={onBusy}/>
  </section>;
}