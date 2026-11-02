export const cinemaPalettes={obsidian:['#090b10','#c5a77b'],teal:['#082b36','#ffb67b'],kodachrome:['#302029','#ffcf82'],chrome:['#17222d','#c2e8f5']};
function cover(ctx,image,x,y,w,h,zoom=1,pan=0){if(!image)return;const iw=image.videoWidth||image.naturalWidth||image.width,ih=image.videoHeight||image.naturalHeight||image.height;if(!iw||!ih)return;const scale=Math.max(w/iw,h/ih)*zoom;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(image,x+(w-iw*scale)/2+pan,y+(h-ih*scale)/2,iw*scale,ih*scale);ctx.restore();}
export function drawCinemaScene(ctx,index,local,duration,campaign,logo,media,s,source){
  const wide=s.aspect==='16:9',w=wide?1920:1080,h=wide?1080:1920,[base,accent]=cinemaPalettes[s.grade]||cinemaPalettes.obsidian,progress=Math.max(0,Math.min(1,local/duration));
  ctx.fillStyle=base;ctx.fillRect(0,0,w,h);ctx.save();ctx.filter=s.grade==='kodachrome'?'sepia(.3) saturate(1.3)':s.grade==='teal'?'contrast(1.12) saturate(1.18)':s.grade==='chrome'?'saturate(.5) contrast(1.15)':'contrast(1.2)';
  if(index<3)cover(ctx,index===0?media?.hero||media?.clip:(media?.clip?.readyState>=2?media.clip:media?.broll)||media?.hero,0,0,w,h,1.02+progress*.1,Math.sin(progress*Math.PI)*14);ctx.restore();
  const scrim=ctx.createLinearGradient(0,0,0,h);scrim.addColorStop(0,'rgba(0,0,0,.4)');scrim.addColorStop(.4,'rgba(0,0,0,.35)');scrim.addColorStop(1,'rgba(0,0,0,.95)');ctx.fillStyle=scrim;ctx.fillRect(0,0,w,h);
  if(logo&&index!==3)ctx.drawImage(logo,w-205,35,165,165);
  if(index===3&&logo){const size=(wide?250:520)+progress*25;ctx.drawImage(logo,(w-size)/2,wide?95:260,size,size);}
  if(index===2){ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.strokeRect(70,wide?110:320,w-140,wide?190:480);}
}