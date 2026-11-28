// One-prompt director: turns a single natural-language concept into a four-beat
// cinematic plan. The local planner is instant and deterministic so the beat
// sheet appears the moment the operator types; the LLM refinement then rewrites
// the copy, camera and lighting without ever inventing proof or statistics.

import { base44 } from '@/api/base44Client';
import { wordsFromText } from '@/components/upkeeper/commercial/directorCaptions';

export const ASPECTS = [
  { key: '9:16', label: '9:16 Vertical', hint: 'Reels · Shorts' },
  { key: '16:9', label: '16:9 Landscape', hint: 'YouTube · Reddit · X' },
];

export const DURATIONS = [
  { key: 15, label: '15s Hook' },
  { key: 30, label: '30s Spotlight' },
  { key: 60, label: '60s Full Commercial' },
];

export const CAMERAS = ['Push-in', 'Orbit', 'FPV tracking', 'Macro rack', 'Crane rise', 'Lock-off'];
export const LIGHTING = ['Obsidian dark mode', 'Neon cyan', 'Warm amber', 'Cold steel'];
export const BROLL = ['heatsink', 'pi5', 'n100', 'breadboard', 'esp32'];
export const ACCENTS = ['#00e5ff', '#e6bd4d', '#7cf6c8', '#ff7a59'];
export const BEAT_NAMES = ['The Hook', 'The Action', 'The Proof', 'The Climax'];

// Hook / Action / Proof / Climax split of the selected duration.
const WEIGHTS = [0.22, 0.32, 0.3, 0.16];

const round1 = (n) => Math.round(n * 10) / 10;

export function beatDurations(seconds) {
  const parts = WEIGHTS.map((w) => round1(seconds * w));
  const drift = round1(seconds - parts.reduce((sum, n) => sum + n, 0));
  parts[parts.length - 1] = round1(parts[parts.length - 1] + drift);
  return parts;
}

export const totalSeconds = (plan) =>
  (plan?.durations || []).reduce((sum, n) => sum + Number(n), 0);

export function beatAt(plan, time) {
  const durations = plan?.durations || [];
  const total = durations.reduce((sum, n) => sum + Number(n), 0);
  const t = Math.max(0, Math.min(total - 0.001, time));
  let index = 0;
  let start = 0;
  while (index < durations.length - 1 && t >= start + Number(durations[index])) {
    start += Number(durations[index]);
    index += 1;
  }
  return { index, start, local: t - start, duration: Number(durations[index]) || 1, total };
}

const pick = (list, seed) => list[Math.abs(seed) % list.length];

export function extractCommand(prompt) {
  const match = String(prompt || '').match(
    /\b(make\s+[a-z0-9-]+|git\s+clone\s+[^\s,;]+|npm\s+[a-z]+(?:\s+[a-z0-9-]+)?|npx\s+[a-z0-9-]+|docker\s+[a-z]+(?:\s+[a-z0-9-]+)?)/i
  );
  return match ? match[1].replace(/\s+/g, ' ') : 'make edge-optimize';
}

function wordmarkFrom(prompt) {
  const stop = new Set(['a', 'an', 'the', 'for', 'our', 'with', 'and', 'of', 'to', 'showing', 'about', 'that', 'this', 'gritty', 'cinematic', 'ad', 'commercial', 'second', 'seconds']);
  const words = String(prompt || '')
    .replace(/[^A-Za-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w.toLowerCase()))
    .slice(0, 3);
  const mark = words.join(' ').toUpperCase();
  return (mark || 'THE PRODUCT').slice(0, 24);
}

function subjectFrom(prompt) {
  const clean = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'your product';
  const words = clean.split(' ').slice(0, 7).join(' ').replace(/[.,;:]$/, '');
  return words.length > 64 ? `${words.slice(0, 61)}…` : words;
}

// A neutral, honest fallback script. It never states a measurement, price or
// testimonial the operator did not supply.
function localBeats(prompt, durations) {
  const command = extractCommand(prompt);
  const mark = wordmarkFrom(prompt);
  const subject = subjectFrom(prompt);
  return [
    {
      name: BEAT_NAMES[0],
      headline: 'It starts to struggle',
      subhead: subject,
      voiceover: `Every board has a limit. This is where ${subject} reaches its own.`,
      camera: 'Macro rack',
      lighting: 'Obsidian dark mode',
      broll: 'heatsink',
    },
    {
      name: BEAT_NAMES[1],
      headline: command.toUpperCase(),
      subhead: 'One command, no ceremony',
      voiceover: `One command. ${command}.`,
      camera: 'FPV tracking',
      lighting: 'Neon cyan',
      broll: 'pi5',
      command,
    },
    {
      name: BEAT_NAMES[2],
      headline: 'Measured, not claimed',
      subhead: 'Bench data on real silicon',
      voiceover: 'The numbers come off the bench, not off a slide.',
      camera: 'Push-in',
      lighting: 'Cold steel',
      broll: 'n100',
    },
    {
      name: BEAT_NAMES[3],
      headline: mark,
      subhead: command,
      voiceover: `${mark}. Run the command.`,
      camera: 'Crane rise',
      lighting: 'Warm amber',
      broll: 'heatsink',
    },
  ];
}

export function localPlan(prompt, seconds, aspect) {
  const durations = beatDurations(seconds);
  const beats = localBeats(prompt, durations).map((beat, i) => ({
    ...beat,
    accent: ACCENTS[i % ACCENTS.length],
    words: wordsFromText(beat.voiceover, ACCENTS[i % ACCENTS.length]),
    seed: i + 1,
    voice_url: null,
  }));
  return {
    prompt,
    seconds,
    aspect,
    durations,
    wordmark: wordmarkFrom(prompt),
    command: extractCommand(prompt),
    grade: 'obsidian',
    beats,
    social: { title: wordmarkFrom(prompt), body: String(prompt || '').trim() },
    source: 'local',
  };
}

export function rerollBeat(plan, index) {
  const beats = plan.beats.map((beat, i) => {
    if (i !== index) return beat;
    const seed = (beat.seed || 0) + 1;
    return {
      ...beat,
      seed,
      camera: pick(CAMERAS, seed + i),
      broll: pick(BROLL, seed * 3 + i),
      lighting: pick(LIGHTING, seed + i * 2),
    };
  });
  return { ...plan, beats };
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    wordmark: { type: 'string' },
    grade: { type: 'string', enum: ['obsidian', 'teal', 'kodachrome', 'chrome'] },
    beats: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          subhead: { type: 'string' },
          voiceover: { type: 'string' },
          camera: { type: 'string', enum: CAMERAS },
          lighting: { type: 'string', enum: LIGHTING },
          broll: { type: 'string', enum: BROLL },
          command: { type: 'string' },
        },
        required: ['headline', 'subhead', 'voiceover', 'camera', 'lighting', 'broll', 'command'],
      },
    },
    social: {
      type: 'object',
      properties: { title: { type: 'string' }, body: { type: 'string' } },
      required: ['title', 'body'],
    },
  },
  required: ['wordmark', 'grade', 'beats', 'social'],
};

// Rewrite the four beats from the concept. Word budgets keep narration inside
// each beat's runtime at roughly 150 words per minute.
export async function refinePlan(plan) {
  const budgets = plan.durations.map((d) => Math.max(5, Math.round(d * 2.5)));
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a commercial director cutting a ${plan.seconds}-second ${plan.aspect} spot for a technical product.

CONCEPT: "${plan.prompt}"

Cut exactly FOUR beats, in this order, each fitting its own runtime:
1. The Hook — ${plan.durations[0]}s, ~${budgets[0]} words of voiceover. Name the problem the audience already feels.
2. The Action — ${plan.durations[1]}s, ~${budgets[1]} words. The product does its work. Give one real shell command (default "${plan.command}").
3. The Proof — ${plan.durations[2]}s, ~${budgets[2]} words. Bench evidence, stated honestly.
4. The Climax — ${plan.durations[3]}s, ~${budgets[3]} words. Wordmark and call to action.

Rules:
- Voiceover is spoken narration only: no stage directions, no brackets, no emoji, no markdown.
- Never invent statistics, temperatures, percentages, prices, testimonials or awards that the concept does not state. If the concept gives a number, use it exactly; if not, describe the measurement instead of quoting one.
- Headline is at most 6 words and is the burned-in caption headline; subhead is at most 10 words.
- Camera is one of: ${CAMERAS.join(', ')}.
- Lighting is one of: ${LIGHTING.join(', ')}.
- broll is one of: ${BROLL.join(', ')} (heatsink, pi5, n100, breadboard, esp32 hardware macro plates).
- "wordmark" is a 1-3 word product lockup in capitals, taken from the concept.
- "social" is a Reddit/X title (under 300 chars) and body (2-4 short paragraphs, no fabricated claims) promoting the same spot.`,
    response_json_schema: PLAN_SCHEMA,
  });

  if (!result?.beats?.length) return plan;

  const beats = result.beats.map((beat, i) => {
    const accent = ACCENTS[i % ACCENTS.length];
    const voiceover = String(beat.voiceover || '').replace(/\s+/g, ' ').trim();
    return {
      ...plan.beats[i],
      name: BEAT_NAMES[i],
      headline: String(beat.headline || plan.beats[i].headline).trim(),
      subhead: String(beat.subhead || plan.beats[i].subhead).trim(),
      voiceover,
      camera: CAMERAS.includes(beat.camera) ? beat.camera : plan.beats[i].camera,
      lighting: LIGHTING.includes(beat.lighting) ? beat.lighting : plan.beats[i].lighting,
      broll: BROLL.includes(beat.broll) ? beat.broll : plan.beats[i].broll,
      command: String(beat.command || plan.command || plan.beats[i].command || '').trim(),
      accent,
      words: wordsFromText(voiceover, accent),
    };
  });

  return {
    ...plan,
    wordmark: String(result.wordmark || plan.wordmark).trim().toUpperCase().slice(0, 24),
    grade: result.grade || plan.grade,
    command: beats[1]?.command || plan.command,
    beats,
    social: {
      title: String(result.social?.title || plan.social.title).trim(),
      body: String(result.social?.body || plan.social.body).trim(),
    },
    source: 'director',
  };
}

// Editing a single word in place keeps emphasis and colour on the rest.
export function updateWord(plan, beatIndex, wordIndex, patch) {
  const beats = plan.beats.map((beat, i) => {
    if (i !== beatIndex) return beat;
    const words = beat.words.map((word, j) => (j === wordIndex ? { ...word, ...patch } : word));
    return { ...beat, words };
  });
  return { ...plan, beats };
}

export function voiceScript(plan) {
  return (plan?.beats || []).map((b) => b.voiceover).filter(Boolean);
}