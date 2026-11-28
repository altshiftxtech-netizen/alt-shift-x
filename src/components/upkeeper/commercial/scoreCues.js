import { tone, noise, kick } from '@/components/upkeeper/audio/synthVoices';
import { DEFAULT_SCORE, KEYS, MOODS, noteHz } from '@/components/upkeeper/commercial/scoreSettings';
import { PROOF_STAMP, terminalClicks } from '@/components/upkeeper/commercial/directorCueTiming';

export function scheduleScore({ context, plan, score, play, nodes, buffer, sub, melody, ambience, sfx }) {
  const setting = { ...DEFAULT_SCORE, ...score };
  const { root, scale } = KEYS[setting.key] || KEYS[DEFAULT_SCORE.key];
  const mood = MOODS[setting.mood] || MOODS[DEFAULT_SCORE.mood];
  const unit = 60 / Math.max(85, Math.min(140, setting.bpm));
  const hz = (index, octave = 0) => noteHz(root + scale[index % scale.length] + octave * 12);
  const hit = (bus, at, seconds, options) => play(at, seconds, (time, duration) => tone(context, bus, nodes, { time, duration, ...options }));
  const sweep = (bus, at, seconds, options) => play(at, seconds, (time, duration) => noise(context, bus, nodes, buffer, { time, duration, ...options }));
  let cut = 0;
  plan.durations.forEach((seconds, beat) => {
    const tail = beat === 3 ? Math.min(1.3, seconds * .35) : .09;
    const chord = [0, 3, setting.key === 'C major' ? 2 : 1];
    chord.slice(0, beat === 0 ? 2 : 3).forEach((n, i) => hit(melody, cut, seconds, {
      frequency: hz(n, i === 0 ? 0 : 1), type: beat === 0 ? 'sine' : 'triangle', level: .045, pan: (i - 1) * .42,
      sustain: beat !== 3,
    }));
    if (beat === 0) hit(sub, cut, seconds, { frequency: hz(0, -1), level: .20, sustain: true });
    else play(cut, .42, (at, left) => kick(context, sub, nodes, at, hz(0), mood.drive * .48, left));
    if (beat === 2 || beat === 3) {
      const step = unit * mood.step;
      const pattern = beat === 2 ? [0, 2, 3, 4, 3, 2, 1, 3] : [0, 1, 3, 4, 0, 4, 3, 1];
      for (let t = 0, i = 0; t < seconds - tail; t += step, i++) {
        hit(melody, cut + t, Math.min(step * .9, seconds - t - tail), { frequency: hz(pattern[i % 8], 2), type: mood.wave, level: .055, pan: i % 2 ? .26 : -.26, filterSweep: true });
        if (i > 0 && i % Math.round(1 / mood.step) === 0) play(cut + t, Math.min(.22, seconds - t), (at, left) => kick(context, sub, nodes, at, hz(0), .26 * mood.drive, left));
        if (beat === 2) sweep(ambience, cut + t, .045, { level: .05, frequency: 6500, pan: i % 2 ? .35 : -.35 });
      }
    }
    if (beat < 3) {
      const lead = Math.min(1.15, seconds * .45);
      sweep(ambience, cut + seconds - lead, lead, { level: mood.texture, frequency: 240, endFrequency: 6500, fadeIn: true });
      sweep(sfx, cut + seconds, .19, { level: .085, frequency: 4300, endFrequency: 350 });
    }
    if (beat === 1) terminalClicks(plan, seconds).forEach((t, i) => sweep(sfx, cut + t, .026, { frequency: 4100, endFrequency: 2000, level: .13, pan: i % 2 ? .3 : -.3 }));
    if (beat === 2) hit(sub, cut + seconds * PROOF_STAMP, .72, { frequency: 95, endFrequency: 40, level: .43 });
    if (beat === 3) chord.forEach((n, i) => {
      const start = i * .045;
      hit(melody, cut + start, Math.min(seconds - start, 2.6), { frequency: hz(n, 3), level: .12, pan: (i - 1) * .4 });
      for (let tap = 1; tap <= 4; tap++) {
        const delay = start + tap * .11;
        hit(ambience, cut + delay, Math.min(seconds - delay, 1.7 + tap * .15), { frequency: hz(n, 3), level: .05 * .64 ** tap, pan: tap % 2 ? -.7 : .7 });
      }
    });
    cut += seconds;
  });
}