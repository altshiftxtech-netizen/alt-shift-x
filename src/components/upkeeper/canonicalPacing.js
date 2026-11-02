export const canonicalPresets={
  speedrun:{label:'18-Component Speed Run (15s)',durations:Array(10).fill(1.5),caption:'punch',grade:'teal',transition:'whip',names:[...Array.from({length:9},(_,i)=>`Components ${i*2+1}–${i*2+2}`),'Logo bumper & CTA']},
  bob:{label:'Legend of BOB Cinematic (20s)',durations:[4,4,9,3],caption:'stinger',grade:'obsidian',transition:'fade',names:['Atmospheric dark intro','Character reveal','High-energy middle','Logo bumper']},
  verity:{label:'Verity Enterprise Showcase (30s)',durations:[4,12,9,5],caption:'lower-third',grade:'chrome',transition:'match',names:['Problem hook','Feature deep dive','Proof of work','Call to action']}
};
export function sceneAt(time,s){const total=s.durations.reduce((sum,n)=>sum+Number(n),0),t=Math.max(0,Math.min(total-.001,time));let index=0,start=0;while(index<s.durations.length-1&&t>=start+Number(s.durations[index]))start+=Number(s.durations[index++]);return {index,local:t-start,duration:Number(s.durations[index]),total,phase:index===s.durations.length-1?3:s.preset==='speedrun'?Math.min(2,Math.floor(index/3)):Math.min(3,index)};}
export const cinemaSize=(edge=2160,aspect='9:16')=>aspect==='16:9'?{width:Math.round(edge*16/9),height:edge}:{width:edge,height:Math.round(edge*16/9)};
export const outroOpacity=(time,total)=>Math.max(0,Math.min(1,(total-time)/1.2));