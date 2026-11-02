export function cinemaCodec(format='webm') {
  const candidates=format==='mp4'?['video/mp4;codecs=avc1.640033,mp4a.40.2','video/mp4;codecs=avc1.42001f,mp4a.40.2','video/mp4']:['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  return candidates.find(type=>window.MediaRecorder?.isTypeSupported(type))||'';
}
export function createCinemaCapture(canvas) {
  const AudioContext=window.AudioContext||window.webkitAudioContext;
  if(!AudioContext)throw new Error('Synchronized audio capture is unavailable in this browser.');
  const context=new AudioContext(),destination=context.createMediaStreamDestination(),videoStream=canvas.captureStream(24);
  const stream=new MediaStream([...videoStream.getVideoTracks(),...destination.stream.getAudioTracks()]);
  let source;
  return {stream,context,
    resume:signal=>new Promise((resolve,reject)=>{const finish=error=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve();},abort=()=>finish(new Error('Reel recording cancelled.')),timer=setTimeout(()=>finish(new Error('Audio did not start. Allow audio playback and retry, or uncheck Include reference audio for a silent export.')),3000);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}context.resume().then(()=>context.state==='running'?finish():finish(new Error('Audio playback is blocked. Allow playback or turn off reference audio.')),finish);}),
    withoutAudio:()=>stream.getAudioTracks().forEach(track=>{stream.removeTrack(track);track.stop();}),
    attach:clip=>{source=context.createMediaElementSource(clip);source.connect(destination);clip.muted=false;clip.volume=1;},
    close:()=>{source?.disconnect();stream.getTracks().forEach(track=>track.stop());videoStream.getTracks().forEach(track=>track.stop());if(context.state!=='closed')void context.close();}
  };
}