export default function encodeMasterWav(buffer){
  const channels=buffer.numberOfChannels,frames=buffer.length,size=frames*channels*3,bytes=new ArrayBuffer(44+size),view=new DataView(bytes),text=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  text(0,'RIFF');view.setUint32(4,36+size,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,48000,true);view.setUint32(28,48000*channels*3,true);view.setUint16(32,channels*3,true);view.setUint16(34,24,true);text(36,'data');view.setUint32(40,size,true);
  const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));let offset=44;
  for(let frame=0;frame<frames;frame++)for(let channel=0;channel<channels;channel++){const sample=Math.max(-1,Math.min(1,data[channel][frame])),pcm=Math.round(sample*(sample<0?8388608:8388607));view.setUint8(offset++,pcm&255);view.setUint8(offset++,(pcm>>8)&255);view.setUint8(offset++,(pcm>>16)&255);}
  return new Blob([bytes],{type:'audio/wav'});
}