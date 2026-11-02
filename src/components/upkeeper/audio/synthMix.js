import canonicalMusicScore from '@/components/upkeeper/audio/canonicalMusicScore';
import voiceDucker from '@/components/upkeeper/audio/voiceDucker';
export function mixCompressor(context,output){const compressor=context.createDynamicsCompressor();compressor.threshold.value=-10;compressor.knee.value=12;compressor.ratio.value=6;compressor.attack.value=.003;compressor.release.value=.22;compressor.connect(output);return compressor;}
export default async function synthMix(context,output,settings,clip){
  const compressor=mixCompressor(context,output),music=context.createGain();let voice,disconnectDucker,score;
  if(clip){voice=context.createMediaElementSource(clip);voice.connect(compressor);disconnectDucker=await voiceDucker(context,music,voice,compressor);clip.muted=false;clip.volume=1;}else music.connect(compressor);
  const startScore=await canonicalMusicScore(context,music,settings);
  return {start:(time,durations)=>{score=startScore(time,durations);},setLevels:value=>score?.setLevels(value),close:()=>{score?.stop();disconnectDucker?.();voice?.disconnect();music.disconnect();compressor.disconnect();}};
}