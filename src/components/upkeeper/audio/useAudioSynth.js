import {useCallback,useEffect,useRef,useState} from 'react';
import synthMix from '@/components/upkeeper/audio/synthMix';
import resumeAudioContext from '@/components/upkeeper/audio/resumeAudioContext';
import renderSynthMaster from '@/components/upkeeper/audio/renderSynthMaster';
import {synthDuration} from '@/components/upkeeper/audio/synthSettings';
import {loadCinemaMedia,releaseCinemaMedia} from '@/components/upkeeper/cinemaReference';
import {downloadAsset} from '@/components/upkeeper/creativeAssets';
export default function useAudioSynth(settings,durations,reference,referenceAudio,disabled){
  const session=useRef(null),mounted=useRef(true),[playing,setPlaying]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[master,setMaster]=useState('');
  const stop=useCallback(()=>{const current=session.current;session.current=null;if(current){clearTimeout(current.timer);current.controller.abort();current.mix?.close();releaseCinemaMedia(current.media);if(current.context.state!=='closed')void current.context.close();}setPlaying(false);},[]);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;stop();};},[stop]);
  useEffect(()=>{stop();},[settings.preset,settings.bpm,settings.enabled,durations.join(','),reference?.url,referenceAudio,stop]);
  useEffect(()=>{if(disabled)stop();},[disabled,stop]);
  useEffect(()=>{session.current?.mix?.setLevels(settings);},[settings.ambientLevel,settings.musicLevel]);
  useEffect(()=>{setMaster('');setNotice('');},[settings.preset,settings.bpm,settings.ambientLevel,settings.musicLevel,durations.join(',')]);
  useEffect(()=>()=>{if(master)URL.revokeObjectURL(master);},[master]);
  const preview=async()=>{if(playing){stop();return;}setMaster('');setBusy(true);setError('');
    try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw new Error('Web Audio is unavailable in this browser.');const current={context:new Context({sampleRate:48000}),controller:new AbortController()};session.current=current;
      await resumeAudioContext(current.context,current.controller.signal);current.media=await loadCinemaMedia(null,referenceAudio?reference:null);if(current.controller.signal.aborted)throw new Error('Audio preview cancelled.');
      current.mix=await synthMix(current.context,current.context.destination,settings,current.media.clip);if(current.controller.signal.aborted)throw new Error('Audio preview cancelled.');if(current.media.clip)await current.media.clip.play();
      current.mix.start(current.context.currentTime+.03,durations);setPlaying(true);current.timer=setTimeout(stop,synthDuration(durations)*1000+100);
    }catch(e){stop();setError(e.message);}finally{setBusy(false);}
  };
  const download=async()=>{stop();setBusy(true);setError('');setNotice('Rendering 48 kHz stereo locally…');
    try{const result=await renderSynthMaster(settings,durations);if(!mounted.current)return;setMaster(URL.createObjectURL(result.blob));downloadAsset(result.blob,`upkeeper-${settings.preset}-master-24bit-48khz.wav`);setNotice(`Master WAV ready · 24-bit · 48 kHz · stereo · ${result.seconds}s`);}
    catch(e){setError(e.message);setNotice('');}finally{setBusy(false);}
  };
  return {playing,busy,error,notice,master,preview,download};
}