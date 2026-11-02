import React,{useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import UpkeeperAudioSynthesizer from '@/components/upkeeper/UpkeeperAudioSynthesizer';
import {synthAttached} from '@/components/upkeeper/audio/synthSettings';
import {cinemaCodec} from '@/components/upkeeper/cinemaCapture';
import recordSynthCommercial from '@/components/upkeeper/recordSynthCommercial';
import {downloadAsset} from '@/components/upkeeper/creativeAssets';
import CinemaRenderedReel from '@/components/upkeeper/CinemaRenderedReel';
import UpkeeperCinemaSequencer from '@/components/upkeeper/UpkeeperCinemaSequencer';
import UpkeeperCommercialPreview from '@/components/upkeeper/UpkeeperCommercialPreview';
import {cinemaSettings,cinemaDuration,pacingPresets} from '@/components/upkeeper/cinemaSpec';
export default function CommercialAudioSynth({mediaUrl,scenePlan=[],disabled,title=''}){
  const [settings,setSettings]=useState({}),[cinema,setCinema]=useState(()=>cinemaSettings({...pacingPresets.bob,preset:'bob',aspect:'16:9'})),[sourceAudio,setSourceAudio]=useState(true),[format,setFormat]=useState('webm'),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[reel,setReel]=useState(null),[error,setError]=useState('');const controller=useRef(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  useEffect(()=>{setReel(null);},[mediaUrl]);
  const durations=cinema.durations,seconds=cinemaDuration(cinema),campaign={product:title,scenes:scenePlan.map(scene=>({title:scene.title||scene.scene||scene.label,body:scene.body||scene.description||''}))};
  const update=value=>{setCinema(value);setReel(null);};
  const render=async aspect=>{setBusy(true);setProgress(0);setError('');controller.current=new AbortController();try{const result=await recordSynthCommercial({url:mediaUrl,audioSynth:settings,durations,cinema:{...cinema,aspect},campaign,sourceAudio,format,onProgress:setProgress,signal:controller.current.signal});setReel(result);downloadAsset(result.blob,`upkeeper-commercial-with-audio.${result.extension}`);}catch(e){if(!controller.current.signal.aborted)setError(e.message);}finally{setBusy(false);}};
  return <section className="rounded-xl bg-background text-foreground border border-border p-3 space-y-3" aria-label="Commercial cinematic audio">
    <label className="block text-sm">Master duration (seconds)<input aria-label="Commercial master duration" type="number" min="1" max="180" step="0.1" className="creative-select" value={seconds} disabled={disabled||busy} onChange={e=>{const value=Number(e.target.value);if(value>=1&&value<=180)update({...cinema,durations:durations.map(n=>n/seconds*value)});}}/></label>
    <UpkeeperCinemaSequencer settings={cinema} onChange={update} campaign={campaign} disabled={disabled||busy}/>
    {mediaUrl&&<UpkeeperCommercialPreview url={mediaUrl} campaign={campaign} settings={cinema}/>}
    <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={sourceAudio} disabled={disabled||busy} onChange={e=>{setSourceAudio(e.target.checked);setReel(null);}}/>Treat source audio as narration</label>
    <UpkeeperAudioSynthesizer value={settings} onChange={value=>{setSettings(value);setReel(null);}} durations={durations} reference={mediaUrl?{url:mediaUrl}:null} referenceAudio={sourceAudio} disabled={disabled||busy} attachmentTarget="Commercial"/>
    <p className="text-xs text-muted-foreground">Canonical pacing controls the finished duration and cut-driven framing. Short source videos loop to fill the timeline. Overlay wording is editable above. Downloads are 4K mixed copies; the saved source production is unchanged.</p>
    <label className="block text-sm">Export format<select aria-label="Commercial audio export format" className="creative-select" disabled={disabled||busy} value={format} onChange={e=>setFormat(e.target.value)}><option value="webm" disabled={!cinemaCodec('webm')}>WebM</option><option value="mp4" disabled={!cinemaCodec('mp4')}>MP4</option></select></label>
    <div className="flex gap-2 flex-wrap">{[['9:16','Download Vertical Commercial'],['16:9','Download Widescreen Commercial']].map(([aspect,label])=><Button key={aspect} type="button" className="h-auto whitespace-normal" disabled={disabled||busy||!mediaUrl||!synthAttached(settings)||!cinemaCodec(format)} onClick={()=>render(aspect)}>{label}</Button>)}{busy&&<Button type="button" variant="outline" onClick={()=>controller.current?.abort()}>Cancel audio export</Button>}</div>
    {!mediaUrl&&<p className="text-xs text-muted-foreground">Render or reopen a commercial video to export it with synthesized audio.</p>}{busy&&<p role="status">Mixing commercial locally… {progress}%</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{reel&&<div className="space-y-2"><p role="status">Commercial with synchronized audio ready.</p><CinemaRenderedReel blob={reel.blob}/></div>}
  </section>;
}