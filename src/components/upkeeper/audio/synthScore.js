import {synthSettings,synthPresets,synthDuration} from '@/components/upkeeper/audio/synthSettings';
import {whiteNoise,tone,noise,kick} from '@/components/upkeeper/audio/synthVoices';
export default function synthScore(context,output,value,durations,start=context.currentTime+.03){
  const settings=synthSettings(value),preset=synthPresets[settings.preset],seconds=synthDuration(durations),nodes=[],buffer=whiteNoise(context),ambient=context.createGain(),music=context.createGain(),fade=context.createGain();
  ambient.gain.value=Math.max(0,Math.min(1,Number(settings.ambientLevel)||0));music.gain.value=Math.max(0,Math.min(1,Number(settings.musicLevel)||0));
  const levels=s=>{ambient.gain.setTargetAtTime(Math.max(0,Math.min(1,Number(s.ambientLevel)||0)),context.currentTime,.01);music.gain.setTargetAtTime(Math.max(0,Math.min(1,Number(s.musicLevel)||0)),context.currentTime,.01);};
  ambient.connect(fade);music.connect(fade);fade.connect(output);levels(settings);fade.gain.setValueAtTime(0,start);fade.gain.linearRampToValueAtTime(.8,start+.025);fade.gain.setValueAtTime(.8,start+Math.max(.03,seconds-.25));fade.gain.linearRampToValueAtTime(0,start+seconds);
  for(const pan of [-.65,.65])tone(context,ambient,nodes,{time:start,duration:seconds,frequency:preset.root+(pan>0?.7:0),level:.16,pan,sustain:true});
  tone(context,ambient,nodes,{time:start,duration:seconds,frequency:preset.root*.998,type:'sawtooth',level:.025,sustain:true});
  noise(context,ambient,nodes,buffer,{time:start,duration:seconds,level:.045,frequency:600,endFrequency:1300,pan:.4});
  const beat=60/settings.bpm;
  for(let i=0;i*beat<seconds;i++){
    const time=start+i*beat,remaining=seconds-i*beat;
    if(preset.mode!=='space'||i%4===0)kick(context,music,nodes,time,preset.root,preset.mode==='fitness'?.65:.4,Math.min(.6,remaining));
    if(i%2===1){noise(context,music,nodes,buffer,{time,duration:Math.min(.16,remaining),level:.18,frequency:1900});tone(context,music,nodes,{time,duration:Math.min(.1,remaining),frequency:170,level:.055,type:'triangle'});}
    if(preset.mode==='fitness')noise(context,music,nodes,buffer,{time:time+Math.min(beat/2,remaining/2),duration:Math.min(.055,remaining/2),level:.07,frequency:6500,pan:i%2?.4:-.4});
    if(preset.mode==='space'&&i%2===0)tone(context,music,nodes,{time,duration:Math.min(.65,remaining),frequency:[880,1320,1760,1100][i%4],level:.035,pan:i%4<2?-.6:.6});
    if(preset.mode==='arp')for(let j=0;j<2;j++){const offset=j*beat/2;if(offset<remaining)tone(context,music,nodes,{time:time+offset,duration:Math.min(beat*.8,remaining-offset),frequency:preset.root*[2,2.3784,3,3.5636][(i*2+j)%4],type:'sawtooth',filterSweep:true,level:.12,pan:j?-.4:.4});}
    if(preset.mode==='orchestral'&&i%8===0)for(const frequency of [220,261.63,329.63])tone(context,music,nodes,{time,duration:Math.min(beat*7,remaining),frequency,type:'triangle',level:.045,sustain:true,pan:frequency===220?-.5:.5});
  }
  let cut=0;for(const duration of durations.slice(0,-1)){cut+=Number(duration);const lead=Math.min(.7,cut),time=start+cut;
    noise(context,music,nodes,buffer,{time:time-lead,duration:lead,level:.16,frequency:160,endFrequency:5500,fadeIn:true});
    tone(context,music,nodes,{time:time-lead,duration:lead,frequency:65,endFrequency:1400,type:'sawtooth',level:.055});
    kick(context,music,nodes,time,preset.root,.7,Math.min(.8,seconds-cut));
    if(preset.mode==='orchestral')for(const frequency of [preset.root*2,preset.root*3])tone(context,music,nodes,{time,duration:Math.min(1.5,seconds-cut),frequency,type:'sawtooth',filterSweep:true,level:.16});
  }
  return {setLevels:levels,stop:()=>{nodes.forEach(node=>node.stop());ambient.disconnect();music.disconnect();fade.disconnect();}};
}