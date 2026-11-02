import { logoImage } from '@/components/upkeeper/creativeAssets';
import {paintReel} from '@/components/upkeeper/reelPainter';
import {cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {loadCinemaMedia,releaseCinemaMedia} from '@/components/upkeeper/cinemaReference';
import {cinemaCodec,createCinemaCapture} from '@/components/upkeeper/cinemaCapture';
export async function recordCampaignReel({campaign,logo,url,width,onProgress,signal,cinema,cinemaRef,format='webm'}) {
  const seconds=cinemaDuration(cinema);let media;
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser cannot record canvas video. Try a current desktop Chrome or Edge.');
  const mime=cinemaCodec(format);
  if(!mime)throw new Error(format==='mp4'?'This browser has no native MP4 encoder. Download WebM or use a browser with H.264/AAC recording support.':'This browser has no WebM encoder. Choose MP4 if available.');
  if(signal.aborted)throw new Error('Reel recording cancelled.');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width*16/9;
  let capture,recorder,frame;const chunks=[];
  try {
    capture=createCinemaCapture(canvas);const resumed=capture.resume(signal).then(()=>null,error=>error);
    const image=await logoImage(logo);media=await loadCinemaMedia(campaign,cinemaRef);if(signal.aborted)throw new Error('Reel recording cancelled.');
    const withAudio=Boolean(media.clip)&&cinema?.referenceAudio!==false;
    if(withAudio){const error=await resumed;if(error)throw error;capture.attach(media.clip);}else capture.withoutAudio();
    paintReel(canvas,0,campaign,image,url,cinema,media);
    recorder=new MediaRecorder(capture.stream,{mimeType:mime,audioBitsPerSecond:192000,videoBitsPerSecond:width>=4320?48000000:width>=2160?24000000:8000000});
    const blob=await new Promise((resolve,reject)=>{
      const abort=()=>{if(recorder.state!=='inactive')recorder.stop();reject(new Error('Reel recording cancelled.'));};
      signal.addEventListener('abort',abort,{once:true});
      recorder.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error('Video encoding failed. Choose a smaller export resolution.'));};
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onstop=()=>{signal.removeEventListener('abort',abort);resolve(new Blob(chunks,{type:recorder.mimeType.split(';')[0]}));};
      recorder.onstart=()=>{const begin=()=>{const clock=withAudio?()=>capture.context.currentTime:()=>performance.now()/1000,start=clock();
        const draw=()=>{if(signal.aborted)return;const t=Math.min(seconds,clock()-start);paintReel(canvas,t,campaign,image,url,cinema,media);onProgress(Math.round(t/seconds*100));if(t>=seconds){media.clip?.pause();if(recorder.state!=='inactive')recorder.stop();}else frame=requestAnimationFrame(draw);};draw();};
        if(media.clip)media.clip.play().then(begin,()=>{if(recorder.state!=='inactive')recorder.stop();reject(new Error('Reference playback was blocked. Try again or remove the clip.'));});else begin();};
      recorder.start(250);
    });
    if(signal.aborted)throw new Error('Reel recording cancelled.');
    if(!blob.size)throw new Error('The encoder returned an empty recording.');
    const objectUrl=URL.createObjectURL(blob), video=document.createElement('video');
    try { await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('The recorded video could not be decoded.'));video.src=objectUrl;});
      if(video.videoWidth!==width || video.videoHeight!==canvas.height)throw new Error('This encoder cannot produce the selected resolution. Choose a smaller size.');
      return {blob,width,height:canvas.height,extension:format,seconds,audio:cinema?.referenceAudio!==false&&Boolean(media.clip),mimeType:recorder.mimeType};
    } finally {video.removeAttribute('src');video.load();URL.revokeObjectURL(objectUrl);}
  } finally {releaseCinemaMedia(media);cancelAnimationFrame(frame);if(recorder?.state==='recording')recorder.stop();capture?.close();canvas.width=canvas.height=1;}
}