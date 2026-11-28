import {seekReferenceFrame} from '@/components/upkeeper/referencePlayback';
export default async function recordCinemaStream({capture,mime,width,seconds,clip,withAudio,startAudio,paint,onProgress=()=>{},videoBitsPerSecond,signal}){
  // Warm the decoder before opening the recording timeline, not after it.
  if(clip){await clip.play();clip.pause();await seekReferenceFrame(clip,0);await paint(0);}
  if(signal.aborted)throw new Error('Reel recording cancelled.');
  const recorder=new MediaRecorder(capture.stream,{mimeType:mime,audioBitsPerSecond:192000,videoBitsPerSecond:videoBitsPerSecond??(width>=4320?48000000:width>=2160?24000000:8000000)}),chunks=[];let frame,timer;
  return new Promise((resolve,reject)=>{
    const clean=()=>{clearTimeout(timer);cancelAnimationFrame(frame);signal.removeEventListener('abort',abort);clip?.pause();};
    const fail=message=>{clean();if(recorder.state!=='inactive')recorder.stop();reject(new Error(message));};
    const abort=()=>fail('Reel recording cancelled.');signal.addEventListener('abort',abort,{once:true});
    recorder.onerror=()=>fail('Video encoding failed. Choose a smaller export resolution.');
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onstop=()=>{clean();resolve({blob:new Blob(chunks,{type:recorder.mimeType.split(';')[0]}),mimeType:recorder.mimeType});};
    const clock=withAudio?()=>capture.context.currentTime:()=>performance.now()/1000;
    const begin=()=>{
      if(signal.aborted){abort();return;}
      const start=clock();
      // Recorder, music and source now start together; onstart can arrive late.
      recorder.start(250);startAudio?.(start);
      timer=setTimeout(()=>{onProgress(100);if(recorder.state!=='inactive')recorder.stop();},seconds*1000);
      const draw=async()=>{
        if(signal.aborted||recorder.state==='inactive')return;
        const time=Math.max(0,Math.min(seconds,clock()-start));
        try{await paint(time);}catch(error){fail(error.message);return;}
        if(recorder.state==='inactive')return;
        onProgress(Math.min(99,Math.round(time/seconds*100)));frame=requestAnimationFrame(draw);
      };void draw();
    };
    if(clip)clip.play().then(begin).catch(error=>fail(error.message||'Source playback was blocked. Allow playback and try again.'));
    else {try{begin();}catch(error){fail(error.message);}}
  }).finally(()=>{clearTimeout(timer);cancelAnimationFrame(frame);clip?.pause();if(recorder.state!=='inactive')recorder.stop();});
}