import canonicalMusicScore from '@/components/upkeeper/audio/canonicalMusicScore';
import {mixCompressor} from '@/components/upkeeper/audio/synthMix';
import {synthDuration} from '@/components/upkeeper/audio/synthSettings';
import encodeMasterWav from '@/components/upkeeper/audio/encodeMasterWav';
export default async function renderSynthMaster(settings,durations){
  const seconds=synthDuration(durations),OfflineContext=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  if(!OfflineContext)throw new Error('Offline audio rendering is unavailable in this browser.');
  const context=new OfflineContext(2,Math.ceil(seconds*48000),48000),compressor=mixCompressor(context,context.destination);
  const start=await canonicalMusicScore(context,compressor,settings);start(0,durations);const buffer=await context.startRendering();return {blob:encodeMasterWav(buffer),seconds,sampleRate:48000,bits:24,channels:2};
}