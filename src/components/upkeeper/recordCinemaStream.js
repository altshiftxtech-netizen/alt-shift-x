import {seekReferenceFrame} from '@/components/upkeeper/referencePlayback';
export default function recordCinemaStream({capture,mime,width,seconds,clip,withAudio,startAudio,paint,onProgress=()=>{},signal}){
  const recorder=new MediaRecorder(capture.stream,{mimeType:mime,audioBitsPerSecond:192000,videoBitsPerSecond:width>=4320?48000000:width>=2160?24000000:8000000}),chunks=[];let frame,timer;
  return new Promise((resolve,reject)=>{
    const clean=()=>{clearTimeout(timer);cancelAnimationFrame(frame);signal.removeEventListener('abort',abort);clip?.pause();};
    const fail=message=>{clean();if(recorder.state!=='inactive')recorder.stop();reject(new Error(message));};
    const abort=()=>fail('Reel recording cancelled.');signal.addEventListener('abort',abort,{once:true});
    recorder.onerror=()=>fail('Video encoding failed. Choose a smaller export resolution.');recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onstop=()=>{clean();resolve({blob:new Blob(chunks,{type:recorder.mimeType.split(';')[0]}),mimeType:recorder.mimeType});};
    recorder.onstart=()=>{const begin=()=>{if(signal.aborted)return;const clock=withAudio?()=>capture.context.currentTime:()=>performance.now()/1000,start=clock();try{startAudio?.(start);}catch(error){fail(error.message);return;}
      const draw=async()=>{if(signal.aborted||recorder.state==='inactive')return;const time=Math.max(0,Math.min(seconds,clock()-start));try{if(clip){const target=time>=seconds?Math.min(clip.duration-.001,time):time%clip.duration;if(Math.abs(clip.currentTime-target)>.12)await seekReferenceFrame(clip,target);}await paint(time);capture.requestFrame?.();}catch(error){fail(error.message);return;}onProgress(Math.round(time/seconds*100));if(time>=seconds){if(recorder.state!=='inactive')recorder.stop();}else frame=requestAnimationFrame(draw);};draw();};
      if(clip)clip.play().then(begin,()=>fail('Source playback was blocked. Allow playback and try again.'));else begin();};
    timer=setTimeout(()=>fail('Recording stopped because playback stalled. Keep this tab visible and retry.'),(seconds+12)*1000);
    if(signal.aborted){abort();return;}recorder.start(250);capture.requestFrame?.();
  }).finally(()=>{clearTimeout(timer);cancelAnimationFrame(frame);if(recorder.state!=='inactive')recorder.stop();});
}