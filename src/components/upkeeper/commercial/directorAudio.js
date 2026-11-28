// Sound design for the director pipeline.
//
// Three independently mixed buses — voiceover, ambient SFX, score — feeding one
// compressor. The score is a pentatonic drone bed with industrial sub-bass drops
// and risers on every beat cut; the SFX bus carries terminal keystrokes,
// transitions and a closing chime. Nothing is sampled: it is all synthesised, so
// a commercial needs no audio uploads.

import { base44 } from '@/api/base44Client';
import { whiteNoise, tone, noise, kick } from '@/components/upkeeper/audio/synthVoices';

export const DEFAULT_LEVELS = { voice: 0.95, sfx: 0.55, score: 0.6 };

export const VOICES = [
  { key: 'storm', label: 'Grounded · authoritative' },
  { key: 'river', label: 'Calm · neutral' },
  { key: 'honey', label: 'Warm · conversational' },
];

// A minor pentatonic ratios.
const PENTA = [1, 1.2, 4 / 3, 3 / 2, 9 / 5];

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

/**
 * Build the mix graph.
 * `start(time, offset)` schedules everything from timeline position `offset`
 * at context time `time`, so preview playback can resume mid-commercial.
 */
export function buildDirectorAudio(context, destination, { plan, voiceBuffers, levels } = {}) {
  const master = context.createGain();
  master.gain.value = 0.92;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -12;
  compressor.knee.value = 14;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.24;
  master.connect(compressor);
  compressor.connect(destination);

  const bus = (level) => {
    const gain = context.createGain();
    gain.gain.value = level;
    gain.connect(master);
    return gain;
  };

  const mix = { ...DEFAULT_LEVELS, ...(levels || {}) };
  const voiceBus = bus(mix.voice);
  const sfxBus = bus(mix.sfx);
  const scoreBus = bus(mix.score);

  const nodes = [];
  const buffer = whiteNoise(context);
  const durations = (plan?.durations || []).map(Number);
  const total = durations.reduce((sum, n) => sum + n, 0);
  let voiceSources = [];

  const setLevels = (next) => {
    const now = context.currentTime;
    if (next.voice != null) voiceBus.gain.setTargetAtTime(next.voice, now, 0.03);
    if (next.sfx != null) sfxBus.gain.setTargetAtTime(next.sfx, now, 0.03);
    if (next.score != null) scoreBus.gain.setTargetAtTime(next.score, now, 0.03);
  };

  const start = (time, offset = 0) => {
    const origin = time - offset;
    const root = 55;

    // Schedule a timeline event, trimming whatever already played.
    const play = (at, duration, fn) => {
      const startAt = Math.max(origin + at, time);
      const left = duration - (startAt - (origin + at));
      if (left > 0.02) fn(startAt, left);
    };

    // Pentatonic drone bed.
    PENTA.slice(0, 3).forEach((ratio, i) => {
      play(0, total, (at, duration) => {
        tone(context, scoreBus, nodes, {
          time: at,
          duration,
          frequency: root * ratio,
          type: i === 0 ? 'triangle' : 'sine',
          level: i === 0 ? 0.14 : 0.075,
          pan: (i - 1) * 0.5,
          sustain: true,
        });
      });
    });

    let beatStart = 0;
    durations.forEach((duration, i) => {
      const accent = i === 3;

      play(beatStart, duration, (at, left) => {
        tone(context, scoreBus, nodes, {
          time: at,
          duration: left,
          frequency: root * PENTA[(i + 2) % PENTA.length] * 2,
          type: 'sine',
          level: 0.05,
          sustain: true,
          pan: 0.35,
        });
      });

      // Industrial sub-bass drop on every cut.
      play(beatStart, accent ? 1.5 : 0.95, (at, left) => {
        tone(context, scoreBus, nodes, {
          time: at,
          duration: left,
          frequency: accent ? 88 : 70,
          endFrequency: accent ? 32 : 38,
          type: 'sine',
          level: accent ? 0.55 : 0.42,
        });
      });
      play(beatStart, 0.5, (at, left) => {
        kick(context, scoreBus, nodes, at, root, accent ? 0.6 : 0.34, left);
      });

      if (i < durations.length - 1) {
        const lead = Math.min(1.1, duration * 0.4);
        play(beatStart + duration - lead, lead, (at, left) => {
          noise(context, sfxBus, nodes, buffer, {
            time: at,
            duration: left,
            level: 0.2,
            frequency: 220,
            endFrequency: 6800,
            fadeIn: true,
          });
          tone(context, sfxBus, nodes, {
            time: at,
            duration: left,
            frequency: 60,
            endFrequency: 1400,
            type: 'sawtooth',
            level: 0.07,
          });
        });
        play(beatStart + duration, 0.4, (at, left) => {
          noise(context, sfxBus, nodes, buffer, {
            time: at,
            duration: left,
            level: 0.16,
            frequency: 2400,
            endFrequency: 260,
          });
        });
      }

      // Terminal keystrokes across the Action beat.
      if (i === 1) {
        const clicks = Math.min(26, Math.floor(duration / 0.11));
        for (let c = 0; c < clicks; c += 1) {
          play(beatStart + 0.2 + c * 0.11, 0.032, (at, left) => {
            noise(context, sfxBus, nodes, buffer, {
              time: at,
              duration: left,
              level: 0.13,
              frequency: 3400,
              pan: c % 2 ? 0.35 : -0.35,
            });
          });
        }
      }

      // Proof readout blips.
      if (i === 2) {
        [0, 1, 2].forEach((b) => {
          play(beatStart + 0.35 + b * duration * 0.22, 0.12, (at, left) => {
            tone(context, sfxBus, nodes, {
              time: at,
              duration: left,
              frequency: 1180 + b * 240,
              type: 'square',
              level: 0.05,
              pan: b % 2 ? 0.3 : -0.3,
            });
          });
        });
      }

      // Closing chime.
      if (i === 3) {
        [880, 1320, 1760].forEach((frequency, n) => {
          play(beatStart + 0.1 + n * 0.09, 1.4, (at, left) => {
            tone(context, sfxBus, nodes, {
              time: at,
              duration: left,
              frequency,
              type: 'sine',
              level: 0.09 - n * 0.02,
              pan: (n - 1) * 0.4,
            });
          });
        });
      }

      beatStart += duration;
    });

    // Voiceover: one buffer per beat, entered on its own cut.
    (voiceBuffers || []).forEach((voiceBuffer, i) => {
      if (!voiceBuffer) return;
      const at = origin + durations.slice(0, i).reduce((sum, n) => sum + n, 0) + 0.14;
      if (at + voiceBuffer.duration <= time) return;
      const skip = Math.max(0, time - at);
      const source = context.createBufferSource();
      source.buffer = voiceBuffer;
      source.connect(voiceBus);
      source.start(Math.max(at, time), skip);
      voiceSources.push(source);
    });
  };

  const stop = () => {
    nodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    });
    voiceSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    });
    voiceSources = [];
    [voiceBus, sfxBus, scoreBus, master, compressor].forEach((node) => {
      try {
        node.disconnect();
      } catch {
        /* already disconnected */
      }
    });
  };

  return { start, setLevels, stop, total };
}