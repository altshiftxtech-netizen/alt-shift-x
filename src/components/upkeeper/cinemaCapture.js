import synthMix from '@/components/upkeeper/audio/synthMix';
import resumeAudioContext from '@/components/upkeeper/audio/resumeAudioContext';
export function cinemaCodec(format='webm') {
  const candidates=format==='mp4'?['video/mp4;codecs=avc1.640033,mp4a.40.2','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1.42001f,mp4a.40.2','video/mp4']:['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  return candidates.find(type=>window.MediaRecorder?.isTypeSupported(type))||'';
}
export function createCinemaCapture(canvas) {
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)throw new Error('Synchronized audio capture is unavailable in this browser.');
  const manual=typeof window.CanvasCaptureMediaStreamTrack?.prototype.requestFrame==='function';
  const context=new AudioContext({sampleRate:48000}),destination=context.createMediaStreamDestination(),videoStream=canvas.captureStream(manual?0:30);
  const stream=new MediaStream([...videoStream.getVideoTracks(),...destination.stream.getAudioTracks()]);
  let source,synth;
  return {stream,context,requestFrame:()=>{if(manual)videoStream.getVideoTracks()[0]?.requestFrame();},
    resume:signal=>resumeAudioContext(context,signal),
    prepareSynth:async(settings,durations,clip)=>{synth=await synthMix(context,destination,settings,clip);return time=>synth.start(time,durations);},
    withoutAudio:()=>stream.getAudioTracks().forEach(track=>{stream.removeTrack(track);track.stop();}),
    attach:clip=>{source=context.createMediaElementSource(clip);source.connect(destination);clip.muted=false;clip.volume=1;},
    close:()=>{synth?.close();source?.disconnect();stream.getTracks().forEach(track=>track.stop());videoStream.getTracks().forEach(track=>track.stop());if(context.state!=='closed')void context.close();}
  };
}