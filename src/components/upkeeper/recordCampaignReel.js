import { logoImage } from '@/components/upkeeper/creativeAssets';
import {paintReel} from '@/components/upkeeper/reelPainter';
import {cinemaDuration,cinemaSettings} from '@/components/upkeeper/cinemaSpec';
import {synthAttached} from '@/components/upkeeper/audio/synthSettings';
import recordCinemaStream from '@/components/upkeeper/recordCinemaStream';
import validateCinemaRecording from '@/components/upkeeper/validateCinemaRecording';
import {loadCinemaMedia,releaseCinemaMedia} from '@/components/upkeeper/cinemaReference';
import {cinemaCodec,createCinemaCapture} from '@/components/upkeeper/cinemaCapture';
export async function recordCampaignReel({campaign,logo,url,width,onProgress,signal,cinema,cinemaRef,audioSynth,format='webm'}) {
  const seconds=cinemaDuration(cinema);let media;
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser cannot record canvas video. Try a current desktop Chrome or Edge.');
  const mime=cinemaCodec(format);
  if(!mime)throw new Error(format==='mp4'?'This browser has no native MP4 encoder. Download WebM or use a browser with H.264/AAC recording support.':'This browser has no WebM encoder. Choose MP4 if available.');
  if(signal.aborted)throw new Error('Reel recording cancelled.');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width*16/9;
  let capture;
  try {
    capture=createCinemaCapture(canvas);const resumed=capture.resume(signal).then(()=>null,error=>error);
    const image=await logoImage(logo);media=await loadCinemaMedia(campaign,cinemaRef);if(signal.aborted)throw new Error('Reel recording cancelled.');
    const referenceAudio=Boolean(media.clip)&&cinema?.referenceAudio!==false,music=synthAttached(audioSynth),withAudio=referenceAudio||music;let startAudio;
    if(withAudio){const error=await resumed;if(error)throw error;if(music)startAudio=await capture.prepareSynth(audioSynth,cinemaSettings(cinema).durations,referenceAudio?media.clip:null);else capture.attach(media.clip);}else capture.withoutAudio();
    const paint=time=>paintReel(canvas,time,campaign,image,url,cinema,media);paint(0);
    const {blob,mimeType}=await recordCinemaStream({capture,mime,width,seconds,clip:media.clip,withAudio,startAudio,paint,onProgress,signal});
    if(signal.aborted)throw new Error('Reel recording cancelled.');await validateCinemaRecording(blob,width,canvas.height);
    return {blob,width,height:canvas.height,extension:format,seconds,audio:withAudio,mimeType};
  } finally {releaseCinemaMedia(media);capture?.close();canvas.width=canvas.height=1;}
}