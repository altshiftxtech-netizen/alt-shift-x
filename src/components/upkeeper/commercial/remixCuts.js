import { DEFAULT_SCORE, MOODS, KEYS } from '@/components/upkeeper/commercial/scoreSettings';

export const PACING = { hyper: ['Hyper-Cut (TikTok/Shorts)', 128, 4], trailer: ['Cinematic Trailer', 100, 6], deep: ['Product Deep-Dive', 90, 6] };
export const TONES = [['storm', 'Grit & Authority'], ['spark', 'High-Energy Hype'], ['river', 'Direct Technical']];
const stamp = /\b(\d{1,3}):([0-5]\d)(?:\.(\d+))?\b/;
export const shotTime = time => `${Math.floor(time / 60)}:${(time % 60).toFixed(1).padStart(4, '0')}`;

export function remixScore(prompt, pace) {
  const bpm = /\b(\d{2,3})\s*bpm\b/i.exec(prompt);
  const key = Object.keys(KEYS).find(name => new RegExp(name.replace(' ', '[ -]'), 'i').test(prompt));
  return { ...DEFAULT_SCORE, key: key || DEFAULT_SCORE.key, bpm: bpm ? Math.min(140, Math.max(85, +bpm[1])) : PACING[pace][1],
    mood: /synthwave/i.test(prompt) ? 'Retro Hardware Synthwave' : pace === 'trailer' ? 'Cinematic Orchestral Drone' : DEFAULT_SCORE.mood };
}

export function remixPlan(plan, sources, pace, score) {
  const grid = 60 / score.bpm;
  const phrase = PACING[pace][2] * grid;
  const end = plan.seconds;
  const times = Array.from({ length: Math.ceil(end / phrase) }, (_, i) => i * phrase).filter(t => t === 0 || t < end - .65);
  const section = [0, .23, .53, .81].map((ratio, i) => i === 0 ? 0 : times.slice(i, times.length - 3 + i).reduce((best, t) => Math.abs(t - end * ratio) < Math.abs(best - end * ratio) ? t : best, times[i]));
  // Snap the narration sections and music accents to picture cuts.
  for (let i = 1; i < section.length; i++) if (section[i] <= section[i - 1]) section[i] = times[times.indexOf(section[i - 1]) + 1];
  const durations = section.map((at, i) => (section[i + 1] ?? end) - at);
  const ranked = sources.flatMap(source => source.samples.map(s => ({ source, start: Math.min(s.start, Math.max(0, source.duration - 3)), rank: Math.min(s.motion, 44) * (pace === 'hyper' ? 1.7 : .65) + s.contrast })));
  ranked.sort((a, b) => b.rank - a.rank);
  const unique = [];
  for (const shot of ranked) {
    if (!unique.some(other => other.source === shot.source && Math.abs(other.start - shot.start) < .8)) unique.push(shot);
  }
  const candidates = unique.map(shot => ({ ...shot, span: Math.min(5, Math.max(3, phrase), shot.source.duration - shot.start) }));
  const m = stamp.exec(plan.prompt);
  const requested = m && Number(m[1]) * 60 + Number(`${m[2]}.${m[3] || 0}`);
  const pinned = m && sources.find(source => source.duration > requested + .05);
  if (m && !pinned) throw new Error(`The requested timestamp ${m[0]} is outside your reference footage.`);
  if (pinned) candidates.unshift({ source: pinned, start: requested, span: Math.min(5, Math.max(3, phrase), pinned.duration - requested) });
  let next = 0;
  const shots = times.map((at, i) => {
    const length = (times[i + 1] ?? end) - at;
    const choice = pinned && at === section[1] ? 0 : (next++ % Math.max(1, candidates.length - Number(Boolean(pinned)))) + Number(Boolean(pinned) && candidates.length > 1);
    return { at, length, choice, section: section.findLastIndex(t => at >= t) };
  });
  const beats = plan.beats.map(beat => ({ ...beat, headline: beat.name, subhead: '', command: '', voiceover: '', words: [] }));
  return { ...plan, command: '', wordmark: '', beats, durations, remix: { candidates, shots, pinned: Boolean(pinned), heavyDrop: /(?:heavy|bass)\s+(?:bass\s+)?drop/i.test(plan.prompt) } };
}

export function rerollRemixScore(score) {
  const moods = Object.keys(MOODS), keys = Object.keys(KEYS);
  return { ...score, mood: moods[(moods.indexOf(score.mood) + 1) % moods.length], key: keys[(keys.indexOf(score.key) + 1) % keys.length] };
}