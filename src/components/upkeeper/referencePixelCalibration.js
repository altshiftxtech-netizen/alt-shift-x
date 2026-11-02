export function frameSignature(ctx,video){
  ctx.drawImage(video,0,0,ctx.canvas.width,ctx.canvas.height);
  const {data}=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height),histogram=new Float32Array(48);let red=0,green=0,blue=0,low=255,high=0,edges=0;
  for(let i=0;i<data.length;i+=4){red+=data[i];green+=data[i+1];blue+=data[i+2];const luma=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];low=Math.min(low,luma);high=Math.max(high,luma);for(let c=0;c<3;c++)histogram[c*16+(data[i+c]>>4)]++;if(i>=4&&i/4%ctx.canvas.width)edges+=Math.abs(luma-(.2126*data[i-4]+.7152*data[i-3]+.0722*data[i-2]));}
  const pixels=data.length/4;return {data,histogram,red:red/pixels,green:green/pixels,blue:blue/pixels,contrast:(high-low)/255,detail:edges/pixels/255};
}
export function cutDifference(a,b){
  let pixels=0,histogram=0;for(let i=0;i<a.data.length;i+=4)for(let c=0;c<3;c++)pixels+=Math.abs(a.data[i+c]-b.data[i+c]);
  for(let i=0;i<48;i++)histogram+=Math.abs(a.histogram[i]-b.histogram[i]);
  return {pixels:pixels/(a.data.length/4*3*255),histogram:histogram/(a.data.length/4*6)};
}
export function referenceCalibration(frames,duration,width,height){
  const candidates=[];for(let i=1;i<frames.length;i++){const delta=cutDifference(frames[i-1],frames[i]);if(delta.pixels>.16&&delta.histogram>.16)candidates.push({time:frames[i].time,score:delta.pixels+delta.histogram});}
  const cuts=[];for(const item of candidates){const previous=cuts.at(-1);if(previous&&item.time-previous.time<.4){if(item.score>previous.score)cuts[cuts.length-1]=item;}else if(item.time>.4&&duration-item.time>.4)cuts.push(item);}
  const boundaries=[0,...cuts.map(c=>c.time),duration],shotDurations=boundaries.slice(1).map((end,i)=>end-boundaries[i]);
  const gcd=(a,b)=>b?gcd(b,a%b):a,divisor=gcd(width,height),mean=key=>frames.reduce((n,f)=>n+f[key],0)/frames.length;
  return {duration,width,height,aspectRatio:`${width/divisor}:${height/divisor}`,sampledCuts:cuts.length,cutTimes:cuts.map(c=>c.time),shotDurations,shotSeconds:duration/shotDurations.length,sampleInterval:frames.length>1?frames[1].time-frames[0].time:duration,sampleCount:frames.length,averageRGB:[mean('red'),mean('green'),mean('blue')].map(Math.round),contrast:mean('contrast'),detail:mean('detail'),caption:'none',grade:'original',calibrated:true};
}