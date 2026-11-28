import { buildDirectorAudio, decodeVoices, STEM_FILES } from '@/components/upkeeper/commercial/directorAudio';
import { totalSeconds } from '@/components/upkeeper/commercial/directorPlan';
import encodeMasterWav from '@/components/upkeeper/audio/encodeMasterWav';

export default async function bounceDirectorStems({ plan, voiceUrls, levels, score, signal }) {
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Offline) throw new Error('This browser cannot export WAV stems.');
  const sampleRate = 48000;
  const frames = Math.ceil(totalSeconds(plan) * sampleRate);
  const files = {};
  let voiceBuffers;
  for (const [solo, name] of [['', 'full-mix'], ...Object.entries(STEM_FILES)]) {
    if (signal?.aborted) throw new Error('Export cancelled.');
    const context = new Offline(2, frames, sampleRate);
    voiceBuffers ||= await decodeVoices(context, voiceUrls);
    const mix = buildDirectorAudio(context, context.destination, { plan, voiceBuffers, levels, score, solo });
    mix.start(0);
    try { files[`${name}.wav`] = encodeMasterWav(await context.startRendering()); }
    finally { mix.stop(); }
  }
  if (signal?.aborted) throw new Error('Export cancelled.');
  return files;
}