import synthScore from '@/components/upkeeper/audio/synthScore';
import {synthSettings} from '@/components/upkeeper/audio/synthSettings';
export const canonicalMusicUrl='https://base44.app/api/apps/6a19363c90f06323c4cfff73/files/mp/public/6a19363c90f06323c4cfff73/3fdb5a673_AltShiftXCommercialMusic-3.mp3';
let bytes;
export default async function canonicalMusicScore(context,output,settings){
  settings=synthSettings(settings);
  if(settings.preset!=='canonical')return (time,durations)=>synthScore(context,output,settings,durations,time);
  if(!bytes){const response=await fetch(canonicalMusicUrl);if(!response.ok)throw new Error('Canonical music could not be loaded.');bytes=await response.arrayBuffer();}
  const buffer=await context.decodeAudioData(bytes.slice(0)),data=buffer.getChannelData(0);let end=data.length-1;while(end>0&&Math.abs(data[end])<.0005)end--;const tailEnd=Math.min(buffer.duration,(end+1)/buffer.sampleRate+.08),tail=Math.min(1.2,tailEnd);
  return (time,durations)=>{const seconds=durations.reduce((sum,n)=>sum+Number(n),0),level=Math.max(0,Math.min(1,Number(settings.musicLevel)||0)),main=context.createBufferSource(),outro=context.createBufferSource(),gain=context.createGain(),tailGain=context.createGain(),volume=context.createGain(),split=Math.max(0,seconds-tail),nodes=[main,outro,gain,tailGain,volume];main.buffer=buffer;main.loop=true;outro.buffer=buffer;main.connect(gain);outro.connect(tailGain);gain.connect(volume);tailGain.connect(volume);volume.connect(output);volume.gain.value=level;
    gain.gain.setValueAtTime(.8,time);let cut=0;durations.slice(0,-1).forEach(n=>{cut+=Number(n);if(cut<split-.3){gain.gain.setValueAtTime(1,time+cut);gain.gain.linearRampToValueAtTime(.8,time+cut+.3);}});gain.gain.setValueAtTime(.8,time+split);gain.gain.linearRampToValueAtTime(0,time+Math.min(seconds,split+.12));tailGain.gain.setValueAtTime(0,time+split);tailGain.gain.linearRampToValueAtTime(1,time+split+Math.min(.12,tail/3));tailGain.gain.setValueAtTime(1,time+seconds-Math.min(.2,tail/3));tailGain.gain.linearRampToValueAtTime(0,time+seconds);main.start(time);main.stop(time+Math.min(seconds,split+.15));outro.start(time+split,Math.max(0,tailEnd-tail),tail);
    return {setLevels:value=>volume.gain.setTargetAtTime(Math.max(0,Math.min(1,Number(value.musicLevel)||0)),context.currentTime,.03),stop:()=>{for(const node of nodes){if(node.stop){try{node.stop();}catch{/* A scheduled source may already have ended. */}}node.disconnect();}}};
  };
}