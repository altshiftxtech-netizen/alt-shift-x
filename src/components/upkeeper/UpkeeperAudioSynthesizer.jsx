// @refresh reset
import React from 'react';
import {Button} from '@/components/ui/button';
import {synthPresets,synthSettings} from '@/components/upkeeper/audio/synthSettings';
import useAudioSynth from '@/components/upkeeper/audio/useAudioSynth';
export default function UpkeeperAudioSynthesizer({value,onChange,durations=[3,5,4,3],reference,referenceAudio=true,disabled=false,attachmentTarget='Reel'}){
  const settings=synthSettings(value),audio=useAudioSynth(settings,durations,reference,referenceAudio,disabled),locked=disabled||audio.busy,patch=update=>onChange({...settings,...update});
  return <section className="rounded-xl border border-border bg-background text-foreground p-4 space-y-4 min-w-0" aria-label="Cinematic Sound Dock">
    <div><h3 className="text-lg font-semibold">Cinematic Sound Dock</h3><p className="text-xs text-muted-foreground">Procedural browser synthesis · $0.00 tokens · original tones, no third-party recordings.</p></div>
    <div className="grid sm:grid-cols-2 gap-4 items-end">
      <label className="flex items-center gap-2 text-sm font-medium"><input aria-label="Audio Track" type="checkbox" checked={settings.enabled} disabled={locked} onChange={e=>patch({enabled:e.target.checked})}/>🎵 Audio Track</label>
      <label className="block text-sm min-w-0">Preset Selector<select aria-label="Sound profile preset" className="creative-select max-w-full min-w-0" value={settings.preset} disabled={locked} onChange={e=>patch({preset:e.target.value,bpm:synthPresets[e.target.value].bpm})}>{Object.entries(synthPresets).map(([key,preset])=><option key={key} value={key}>{preset.label}</option>)}</select></label>
      <label className="block text-sm">🎚️ Ambient Drone Level · {Math.round(settings.ambientLevel*100)}%<input aria-label="Ambient Drone Level" type="range" min="0" max="1" step="0.01" value={settings.ambientLevel} disabled={locked} className="block w-full mt-2 accent-current" onChange={e=>patch({ambientLevel:Number(e.target.value)})}/></label>
      <label className="block text-sm">🔊 Music Bed Level · {Math.round(settings.musicLevel*100)}%<input aria-label="Music Bed Level" type="range" min="0" max="1" step="0.01" value={settings.musicLevel} disabled={locked} className="block w-full mt-2 accent-current" onChange={e=>patch({musicLevel:Number(e.target.value)})}/></label>
    </div>
    <label className="block text-sm">Rhythm tempo<select aria-label="Synth tempo" className="creative-select" value={settings.bpm} disabled={locked} onChange={e=>patch({bpm:Number(e.target.value)})}>{[120,130,140].map(bpm=><option key={bpm} value={bpm}>{bpm} BPM</option>)}</select></label>
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={locked||!settings.enabled} onClick={audio.preview}>{audio.playing?'Stop audio preview':'Play audio preview'}</Button><Button type="button" aria-pressed={!!settings.attached} disabled={locked||!settings.enabled} onClick={()=>patch({attached:!settings.attached})}>{settings.attached?`Detach Audio from ${attachmentTarget}`:`Attach Audio to ${attachmentTarget}`}</Button><Button type="button" variant="outline" disabled={locked||!settings.enabled} className="h-auto whitespace-normal py-2" onClick={audio.download}>Download Master WAV (Royalty-Free)</Button></div>
    <p className="text-xs text-muted-foreground">{settings.attached&&settings.enabled?'Audio will be baked into the next video export.':'Audio is not attached to video exports.'} Risers and impact drops follow scene timing. WAV is lossless 24-bit/48 kHz stereo; video uses AAC or Opus compression.</p>
    <p className="text-xs text-muted-foreground">{reference&&referenceAudio?'Source audio is treated as the narration track. Voice-band activity ducks music by 12 dB with an 8 ms attack and 220 ms release, then both pass through a dynamics compressor.':'For narration ducking, attach a reference clip with voiceover and enable its audio. No microphone or audio starts automatically.'}</p>
    {audio.busy&&<p role="status" className="text-sm">Preparing audio locally…</p>}{audio.notice&&<p role="status" data-testid="synth-master-status" className="text-sm">{audio.notice}</p>}{audio.error&&<p role="alert" className="text-sm text-destructive">{audio.error}</p>}
    {audio.master&&<audio aria-label="Synth master preview" controls src={audio.master} className="w-full"/>}
  </section>;
}