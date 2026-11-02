export function waitForVideo(video,event,timeout=12000){
  return new Promise((resolve,reject)=>{const cleanup=()=>{clearTimeout(timer);video.removeEventListener(event,done);video.removeEventListener('error',fail);},done=()=>{cleanup();resolve();},fail=()=>{cleanup();reject(new Error('This clip cannot be decoded. Use a playable, CORS-enabled MP4 or WebM.'));},timer=setTimeout(()=>{cleanup();reject(new Error('Video loading timed out. Try the clip again.'));},timeout);video.addEventListener(event,done,{once:true});video.addEventListener('error',fail,{once:true});});
}
export async function seekReferenceFrame(video,time){
  const target=Math.max(0,Math.min(video.duration-.001,time));if(video.readyState>=2&&Math.abs(video.currentTime-target)<.0001)return;
  const ready=waitForVideo(video,'seeked');video.currentTime=target;await ready;
}
export function drawReferenceFrame(ctx,clip,w,h,framing='contain'){
  ctx.fillStyle='#000000';ctx.fillRect(0,0,w,h);if(!clip||clip.readyState<2)return;
  const scale=(framing==='cover'?Math.max:Math.min)(w/clip.videoWidth,h/clip.videoHeight),width=clip.videoWidth*scale,height=clip.videoHeight*scale;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(clip,(w-width)/2,(h-height)/2,width,height);
}
export function calibratedReferenceSettings(settings,metadata){
  return {...settings,preset:'reference',referenceCalibrated:true,referenceSourceDuration:metadata.duration,referenceFraming:'contain',referenceOverlays:false,durations:metadata.shotDurations,names:metadata.shotDurations.map((_,i)=>`Reference shot ${i+1}`),caption:'none',grade:'original',transition:'cut',copy:[],walkthrough:{...settings.walkthrough,enabled:false}};
}