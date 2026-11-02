const processor=`class SovereignVoiceDucker extends AudioWorkletProcessor {
 constructor(){super();this.level=1;this.hold=0;}
 process(inputs,outputs){const music=inputs[0],voice=inputs[1],output=outputs[0];let energy=0,count=0;for(const channel of voice)for(const sample of channel){energy+=sample*sample;count++;}if(count&&Math.sqrt(energy/count)>.008)this.hold=Math.ceil(sampleRate*.05);const duck=Math.pow(10,-12/20),attack=(1-duck)/(sampleRate*.008),release=(1-duck)/(sampleRate*.22);for(let i=0;i<output[0].length;i++){const active=this.hold-->0;this.level=active?Math.max(duck,this.level-attack):Math.min(1,this.level+release);for(let channel=0;channel<output.length;channel++)output[channel][i]=(music[channel]?.[i]||0)*this.level;}return true;}
}registerProcessor('sovereign-voice-ducker',SovereignVoiceDucker);`;
export default async function voiceDucker(context,music,voice,output){
  if(!context.audioWorklet||!window.AudioWorkletNode)throw new Error('Voice ducking needs AudioWorklet support. Use a current Chrome, Edge, Firefox or Safari.');
  const url=URL.createObjectURL(new Blob([processor],{type:'application/javascript'}));
  try{await context.audioWorklet.addModule(url);}finally{URL.revokeObjectURL(url);}
  const node=new AudioWorkletNode(context,'sovereign-voice-ducker',{numberOfInputs:2,numberOfOutputs:1,outputChannelCount:[2]}),detector=context.createBiquadFilter();detector.type='bandpass';detector.frequency.value=1400;detector.Q.value=.65;
  music.connect(node,0,0);voice.connect(detector);detector.connect(node,0,1);node.connect(output);
  return ()=>{music.disconnect();voice.disconnect(detector);detector.disconnect();node.disconnect();};
}