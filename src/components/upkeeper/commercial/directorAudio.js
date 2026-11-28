import { base44 } from '@/api/base44Client';
import { whiteNoise } from '@/components/upkeeper/audio/synthVoices';
import { scheduleScore } from '@/components/upkeeper/commercial/scoreCues';
import voicePocket, { scheduleVoicePocket } from '@/components/upkeeper/commercial/voicePocket';

export const DEFAULT_LEVELS = { voice: .95, sfx: .55, score: .6, sub: .85, melody: .85, ambience: .75 };
export const STEM_FILES = { voice: 'voiceover', sub: 'sub-bass-kick', melody: 'melody-chords', ambience: 'ambience-foley' };

export const VOICES = [
  { key: 'storm', label: 'Grounded · authoritative' },
  { key: 'river', label: 'Calm · neutral' },
  { key: 'honey', label: 'Warm · conversational' },
];

export async function generateVoice(plan, voice = 'storm') {
  const urls = await Promise.all(
    (plan.beats || []).map(async (beat) => {
      const text = String(beat.voiceover || '').trim();
      if (!text) return null;
      try {
        const res = await base44.integrations.Core.GenerateSpeech({
          text: text.slice(0, 1200),
          voice,
          language_code: 'en',
        });
        return res?.url || null;
      } catch {
        return null;
      }
    })
  );
  return urls;
}

export async function decodeVoices(context, urls) {
  return Promise.all(
    (urls || []).map(async (url) => {
      if (!url) return null;
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const bytes = await res.arrayBuffer();
        return await context.decodeAudioData(bytes.slice(0));
      } catch {
        return null;
      }
    })
  );
}

// Preview, video recording, and WAV stem bounces all use the same cut clock.
export function buildDirectorAudio(context, destination, { plan, voiceBuffers, levels, score, solo } = {}) {
  const master = context.createGain();
  master.gain.value = .8;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 5;
  limiter.ratio.value = 16;
  limiter.attack.value = .003;
  limiter.release.value = .17;
  const ceiling = context.createWaveShaper();
  ceiling.curve = Float32Array.from({ length: 513 }, (_, i) => Math.max(-.97, Math.min(.97, i / 256 - 1)));
  master.connect(limiter).connect(ceiling).connect(destination);

  const pocket = voicePocket(context);
  const music = context.createGain();
  music.connect(pocket.filter).connect(master);
  const routes = { voice: master, sfx: master, sub: music, melody: music, ambience: music };
  const gains = { score: music };
  for (const [key, target] of Object.entries(routes)) {
    gains[key] = context.createGain();
    gains[key].connect(target);
  }
  const allowed = (key) => !solo || key === 'score' || key === solo || (solo === 'ambience' && key === 'sfx');
  const setLevels = (next, initial = false) => {
    const time = context.currentTime;
    for (const [key, value] of Object.entries(next)) if (gains[key]) {
      const level = allowed(key) ? Math.max(0, Math.min(1, value)) : 0;
      if (initial) gains[key].gain.value = level;
      else gains[key].gain.setTargetAtTime(level, time, .025);
    }
    if (next.voice != null) {
      const amount = next.voice > .001 ? 1 : 0;
      if (initial) pocket.amount.gain.value = amount;
      else pocket.amount.gain.setTargetAtTime(amount, time, .025);
    }
  };
  setLevels({ ...DEFAULT_LEVELS, ...levels }, true);
  const nodes = [pocket.envelope];
  const buffer = whiteNoise(context);
  const durations = plan.durations.map(Number);
  const snap = (s) => Math.round(s * context.sampleRate) / context.sampleRate;

  function start(time, offset = 0) {
    const origin = time - offset;
    const play = (at, duration, fn) => {
      const when = snap(Math.max(origin + at, time));
      const left = duration - Math.max(0, offset - at);
      if (left > .012) fn(when, left);
    };
    scheduleScore({ context, plan, score, play, nodes, buffer, sub: gains.sub, melody: gains.melody, ambience: gains.ambience, sfx: gains.sfx });
    pocket.envelope.start(time);
    let cut = 0;
    durations.forEach((duration, i) => {
      const audio = voiceBuffers?.[i];
      const entry = cut + .14;
      cut += duration;
      if (!audio) return;
      const skip = Math.max(0, offset - entry);
      const length = Math.min(audio.duration, duration - .18) - skip;
      if (length <= .02) return;
      const at = snap(Math.max(time, origin + entry));
      const source = context.createBufferSource();
      const fade = context.createGain();
      fade.gain.setValueAtTime(1, at + Math.max(0, length - .04));
      fade.gain.linearRampToValueAtTime(0, at + length);
      source.buffer = audio;
      source.connect(fade).connect(gains.voice);
      source.start(at, skip, length);
      nodes.push(source);
      scheduleVoicePocket(pocket.envelope.offset, audio, at, skip, length);
    });
  }

  function stop() {
    for (const node of nodes) { try { node.stop(); } catch { /* Source already stopped. */ } }
    for (const node of [...Object.values(gains), pocket.filter, pocket.amount, master, limiter, ceiling]) node.disconnect();
  }
  return { start, setLevels, stop };
}