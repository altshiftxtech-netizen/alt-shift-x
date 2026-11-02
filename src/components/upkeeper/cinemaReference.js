import {frameSignature,referenceCalibration} from '@/components/upkeeper/referencePixelCalibration';
import {waitForVideo,seekReferenceFrame} from '@/components/upkeeper/referencePlayback';
const calibrationCache=new Map();
export async function inspectCinemaReference(url,onProgress=()=>{}){
  if(calibrationCache.has(url)){onProgress(100);return calibrationCache.get(url);}
  const video=document.createElement('video');if(!url.startsWith('blob:'))video.crossOrigin='anonymous';video.muted=true;video.playsInline=true;video.preload='auto';
  try{const ready=waitForVideo(video,'loadeddata');video.src=url;await ready;if(!Number.isFinite(video.duration)||video.duration<=0)throw new Error('Use a finite, playable reference clip.');
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=Math.max(1,Math.round(96*video.videoHeight/video.videoWidth));const ctx=canvas.getContext('2d',{willReadFrequently:true}),count=Math.min(180,Math.max(2,Math.ceil(video.duration*2))),frames=[];
    for(let i=0;i<count;i++){const time=i*video.duration/count;await seekReferenceFrame(video,time);frames.push({...frameSignature(ctx,video),time});onProgress(Math.round((i+1)/count*100));}
    const metadata={...referenceCalibration(frames,video.duration,video.videoWidth,video.videoHeight),audioTrack:video.audioTracks?(video.audioTracks.length?'present':'none'):typeof video.mozHasAudio==='boolean'?(video.mozHasAudio?'present':'none'):'not reported by browser'};
    if(!url.startsWith('blob:')){if(calibrationCache.size>=8)calibrationCache.delete(calibrationCache.keys().next().value);calibrationCache.set(url,metadata);}return metadata;
  }finally{video.pause();video.removeAttribute('src');video.load();}
}
export async function loadCinemaMedia(campaign,reference){
  const image=async url=>{if(!url)return null;const img=new Image();img.crossOrigin='anonymous';img.src=url;await img.decode();return img;};
  const [hero,broll]=await Promise.all([image(campaign?.hero_url),image(campaign?.broll_url)]);
  let clip=null;if(reference?.url){clip=document.createElement('video');clip.crossOrigin='anonymous';clip.muted=true;clip.loop=true;clip.playsInline=true;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Reference playback timed out. Remove it or choose a different clip.')),12000);clip.onloadeddata=()=>{clearTimeout(timer);resolve();};clip.onerror=()=>{clearTimeout(timer);reject(new Error('The reference clip is no longer playable. Reattach it.'));};clip.src=reference.url;});}
  return {hero,broll,clip};
}
export function releaseCinemaMedia(media){if(media?.clip){media.clip.pause();media.clip.removeAttribute('src');media.clip.load();}}