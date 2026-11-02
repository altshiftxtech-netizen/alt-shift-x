import {cinemaCodec,createCinemaCapture} from '@/components/upkeeper/cinemaCapture';
import {synthAttached} from '@/components/upkeeper/audio/synthSettings';
import recordCinemaStream from '@/components/upkeeper/recordCinemaStream';
import validateCinemaRecording from '@/components/upkeeper/validateCinemaRecording';
export default async function recordSynthCommercial({url,audioSynth,durations,sourceAudio,format,onProgress,signal}){
  if(!synthAttached(audioSynth))throw new Error('Attach the audio track before exporting.');const mime=cinemaCodec(format);if(!mime)throw new Error('This browser cannot encode that video format.');
  const canvas=document.createElement('canvas'),video=document.createElement('video');video.crossOrigin='anonymous';video.muted=true;video.playsInline=true;let capture;
  try{capture=createCinemaCapture(canvas);const resumed=capture.resume(signal).then(()=>null,error=>error);
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Commercial video timed out. Use a playable, CORS-enabled source.')),12000);video.onloadeddata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(new Error('This commercial cannot be read for local audio mixing. Use a CORS-enabled video.'));};video.src=url;});
    if(!Number.isFinite(video.duration)||video.duration<1||video.duration>180)throw new Error('Local audio mixing supports clips from 1 to 180 seconds.');if(signal.aborted)throw new Error('Render cancelled.');
    const error=await resumed;if(error)throw error;canvas.width=video.videoWidth;canvas.height=video.videoHeight;const total=durations.reduce((sum,value)=>sum+value,0),cuts=durations.map(value=>value/total*video.duration);
    const startAudio=await capture.prepareSynth(audioSynth,cuts,sourceAudio?video:null),paint=()=>canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);paint();
    const result=await recordCinemaStream({capture,mime,width:canvas.width,seconds:video.duration,clip:video,withAudio:true,startAudio,paint,onProgress,signal});if(signal.aborted)throw new Error('Render cancelled.');await validateCinemaRecording(result.blob,canvas.width,canvas.height);
    return {...result,width:canvas.width,height:canvas.height,seconds:video.duration,extension:format,audio:true};
  }finally{video.pause();video.removeAttribute('src');video.load();capture?.close();canvas.width=canvas.height=1;}
}