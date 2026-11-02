import { logoImage } from '@/components/upkeeper/creativeAssets';
import { paintReel, REEL_SECONDS } from '@/components/upkeeper/reelPainter';
export async function recordCampaignReel({campaign,logo,url,width,onProgress,signal}) {
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser cannot record canvas video. Try a current desktop Chrome or Edge.');
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));
  if(!mime)throw new Error('No supported WebM or MP4 encoder is available.');
  const image=await logoImage(logo); if(signal.aborted)throw new Error('Reel recording cancelled.');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width*16/9;
  paintReel(canvas,0,campaign,image,url);
  const stream=canvas.captureStream(24); let recorder,frame; const chunks=[];
  try {
    recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:width>=4320?48000000:width>=2160?24000000:8000000});
    const blob=await new Promise((resolve,reject)=>{
      const abort=()=>{if(recorder.state!=='inactive')recorder.stop();reject(new Error('Reel recording cancelled.'));};
      signal.addEventListener('abort',abort,{once:true});
      recorder.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error('Video encoding failed. Choose a smaller export resolution.'));};
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onstop=()=>{signal.removeEventListener('abort',abort);resolve(new Blob(chunks,{type:mime.split(';')[0]}));};
      recorder.start(250); const start=performance.now();
      const draw=()=>{if(signal.aborted)return;const t=Math.min(REEL_SECONDS,(performance.now()-start)/1000);paintReel(canvas,t,campaign,image,url);onProgress(Math.round(t/REEL_SECONDS*100));if(t>=REEL_SECONDS){if(recorder.state!=='inactive')recorder.stop();}else frame=requestAnimationFrame(draw);}; draw();
    });
    if(signal.aborted)throw new Error('Reel recording cancelled.');
    if(!blob.size)throw new Error('The encoder returned an empty recording.');
    const objectUrl=URL.createObjectURL(blob), video=document.createElement('video');
    try { await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('The recorded video could not be decoded.'));video.src=objectUrl;});
      if(video.videoWidth!==width || video.videoHeight!==canvas.height)throw new Error('This encoder cannot produce the selected resolution. Choose a smaller size.');
      return {blob,width,height:canvas.height,extension:mime.startsWith('video/mp4')?'mp4':'webm',seconds:REEL_SECONDS};
    } finally {video.removeAttribute('src');video.load();URL.revokeObjectURL(objectUrl);}
  } finally {cancelAnimationFrame(frame);if(recorder?.state==='recording')recorder.stop();stream.getTracks().forEach(track=>track.stop());canvas.width=canvas.height=1;}
}