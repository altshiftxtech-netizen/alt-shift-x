import {cinemaCodec,createCinemaCapture} from '@/components/upkeeper/cinemaCapture';
import {synthAttached} from '@/components/upkeeper/audio/synthSettings';
import {cinemaSettings,cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {cinemaSize,sceneAt,outroOpacity} from '@/components/upkeeper/canonicalPacing';
import cinemaMultiplexer from '@/components/upkeeper/cinemaMultiplexer';
import recordCinemaStream from '@/components/upkeeper/recordCinemaStream';
import validateCinemaRecording from '@/components/upkeeper/validateCinemaRecording';
export default async function recordSynthCommercial({url,audioSynth,durations,cinema,campaign,sourceAudio,format,onProgress,signal,width=2160}){
  if(!synthAttached(audioSynth))throw new Error('Attach the audio track before exporting.');const mime=cinemaCodec(format);if(!mime)throw new Error('This browser cannot encode that video format.');
  const s=cinemaSettings(cinema||{durations,aspect:'16:9'}),seconds=cinemaDuration(s),canvas=document.createElement('canvas'),video=document.createElement('video');Object.assign(canvas,cinemaSize(width,s.aspect));video.crossOrigin='anonymous';video.muted=true;video.playsInline=true;video.loop=true;let capture,multiplexer;
  try{multiplexer=cinemaMultiplexer(canvas,campaign,'',s);capture=createCinemaCapture(multiplexer.canvas);const resumed=capture.resume(signal).then(()=>null,error=>error);
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Commercial video timed out. Use a playable, CORS-enabled source.')),12000);video.onloadeddata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(new Error('This commercial cannot be read for local mixing. Use a CORS-enabled video.'));};video.src=url;});
    if(!Number.isFinite(video.duration)||video.duration<1||video.duration>180)throw new Error('Local mixing supports source clips from 1 to 180 seconds.');if(signal.aborted)throw new Error('Render cancelled.');const error=await resumed;if(error)throw error;
    const startAudio=await capture.prepareSynth(audioSynth,s.durations,sourceAudio?video:null),ctx=canvas.getContext('2d'),paint=async time=>{const {index,local,duration}=sceneAt(time,s),zoom=1+(index%2)*.08+local/duration*.04,scale=Math.max(canvas.width/video.videoWidth,canvas.height/video.videoHeight)*zoom;ctx.fillStyle='#090b10';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(video,(canvas.width-video.videoWidth*scale)/2,(canvas.height-video.videoHeight*scale)/2,video.videoWidth*scale,video.videoHeight*scale);ctx.fillStyle=`rgba(0,0,0,${.4+.6*(1-outroOpacity(time,seconds))})`;ctx.fillRect(0,0,canvas.width,canvas.height);await multiplexer.paint(time);};await paint(0);
    const result=await recordCinemaStream({capture,mime,width:Math.max(canvas.width,canvas.height),seconds,clip:video,withAudio:true,startAudio,paint,onProgress,signal});if(signal.aborted)throw new Error('Render cancelled.');await validateCinemaRecording(result.blob,canvas.width,canvas.height);
    return {...result,width:canvas.width,height:canvas.height,seconds,extension:format,audio:true};
  }finally{video.pause();video.removeAttribute('src');video.load();capture?.close();multiplexer?.close();canvas.width=canvas.height=1;}
}