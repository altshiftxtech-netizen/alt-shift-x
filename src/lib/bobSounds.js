// bobSounds — lightweight, asset-free audio cues for the BOB chat.
// Uses the Web Audio API to synthesize sounds (no files to host) and the
// SpeechSynthesis API for BOB's robotic unisex "hi".

let ctx = null;
function audioCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  // Browsers suspend the context until a user gesture — resume on demand.
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A single short "blip" tone — building block for the other cues.
function blip(freq, startAt, duration, { type = "sine", gain = 0.2, slideTo } = {}) {
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, startAt + duration);
  g.gain.setValueAtTime(0.0001, startAt);
  g.gain.exponentialRampToValueAtTime(gain, startAt + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

// Tile-drop — a quick cluster of descending "clacks" like tiles landing.
export function playTileDrop() {
  const ac = audioCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const freqs = [520, 430, 360, 300, 250];
  freqs.forEach((f, i) => {
    blip(f, t + i * 0.075, 0.1, { type: "triangle", gain: 0.18, slideTo: f * 0.7 });
  });
}

// Chime — a pleasant two-note "ding" for done / awaiting feedback.
export function playChime() {
  const ac = audioCtx();
  if (!ac) return;
  const t = ac.currentTime;
  blip(880, t, 0.5, { type: "sine", gain: 0.22 });        // A5
  blip(1320, t + 0.14, 0.6, { type: "sine", gain: 0.18 }); // E6
}

// Cash-in — a bright "cha-ching" register sound for a major/non-tile component
// submission. Two quick bell dings plus a sparkle for the money feel.
export function playCashIn() {
  const ac = audioCtx();
  if (!ac) return;
  const t = ac.currentTime;
  blip(1200, t, 0.12, { type: "square", gain: 0.16 });          // register "cha"
  blip(1600, t + 0.1, 0.45, { type: "triangle", gain: 0.2 });   // bright "ching"
  blip(2000, t + 0.18, 0.4, { type: "sine", gain: 0.14 });      // sparkle harmonic
}

// Computing beep — rapid electronic processing sound
export function playComputingBeep() {
  const ac = audioCtx();
  if (!ac) return;
  const t = ac.currentTime;
  blip(800, t, 0.08, { type: "square", gain: 0.15 });
  blip(1200, t + 0.1, 0.08, { type: "square", gain: 0.15 });
  blip(900, t + 0.2, 0.1, { type: "square", gain: 0.12 });
}

// ── User-adjustable voice settings ─────────────────────────────────────────
// Persisted in localStorage so the user can tell BOB what to sound like and it
// sticks across sessions. Defaults to the deep, gender-neutral robotic voice.
const VOICE_KEY = "bob_voice_settings";
// Higher pitch + faster rate reads as a lively, human-like-but-synthesized voice.
const DEFAULT_VOICE = { voiceName: "", pitch: 1.15, rate: 1.1 };

export function getVoiceSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_VOICE };
  try {
    const raw = localStorage.getItem(VOICE_KEY);
    return raw ? { ...DEFAULT_VOICE, ...JSON.parse(raw) } : { ...DEFAULT_VOICE };
  } catch {
    return { ...DEFAULT_VOICE };
  }
}

export function saveVoiceSettings(settings) {
  if (typeof window === "undefined") return;
  const merged = { ...getVoiceSettings(), ...settings };
  localStorage.setItem(VOICE_KEY, JSON.stringify(merged));
}

// List the speech voices available in this browser.
export function listVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

// Interpret a plain-English description (e.g. "deeper and slower", "robotic",
// "higher and faster", "more feminine") into pitch/rate/voice tweaks applied on
// top of the current settings. Returns the new settings object.
export function applyVoiceDescription(text) {
  const t = (text || "").toLowerCase();
  const cur = getVoiceSettings();
  let { pitch, rate, voiceName } = cur;
  const clampP = (v) => Math.max(0, Math.min(2, v));
  const clampR = (v) => Math.max(0.5, Math.min(2, v));

  // Pitch
  if (/(deep|deeper|low|lower|bass|masculine|manly|gruff)/.test(t)) pitch = clampP(pitch - 0.3);
  if (/(high|higher|bright|feminine|softer|soft)/.test(t)) pitch = clampP(pitch + 0.3);
  if (/(much|very|way) (deep|deeper|low|lower)/.test(t)) pitch = clampP(pitch - 0.3);
  if (/(much|very|way) (high|higher)/.test(t)) pitch = clampP(pitch + 0.3);

  // Rate
  if (/(slow|slower|calm|relaxed)/.test(t)) rate = clampR(rate - 0.15);
  if (/(fast|faster|quick|quicker|snappy|energetic)/.test(t)) rate = clampR(rate + 0.15);

  // Voice family hints — pick a matching available voice by name.
  const voices = listVoices();
  const findV = (re) => voices.find((v) => re.test(v.name));
  let match = null;
  if (/(robot|robotic|machine|synth)/.test(t)) match = findV(/robot|zarvox|cellos|trinoids|fred|albert|ralph/i);
  else if (/(british|uk|english accent)/.test(t)) match = findV(/uk english|daniel|google uk/i);
  else if (/(male|man|masculine|guy|deep voice)/.test(t)) match = findV(/\bmale\b|daniel|alex|fred|albert/i);
  else if (/(female|woman|feminine|lady)/.test(t)) match = findV(/\bfemale\b|samantha|victoria|karen|zira|fiona/i);
  if (match) voiceName = match.name;

  const next = { pitch, rate, voiceName };
  saveVoiceSettings(next);
  return next;
}

// Core robotic-voice speak helper. Reads the user's saved voice settings so the
// pitch, rate, and chosen voice reflect what they've configured / described.
// speak(text, { queue }) — when queue is true the utterance is appended behind
// anything currently speaking instead of cancelling it. This guarantees the
// "On it" thinking line (spoken on send, while BOB types) always finishes
// before a completion line like "Finished" plays.
export function speak(text, { queue = false } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  const say = () => {
    const settings = getVoiceSettings();
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = settings.pitch;
    u.rate = settings.rate;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    // Honor an explicitly chosen / described voice first.
    let chosen = settings.voiceName ? voices.find((v) => v.name === settings.voiceName) : null;
    if (!chosen) {
      // Fall back to deeper / robotic neutral voices; avoid feminine defaults.
      const robotic = voices.find((v) =>
        /robot|fred|albert|ralph|cellos|zarvox|trinoids|google uk english male|daniel|alex|rocko|grandpa/i.test(v.name)
      );
      const maleish = voices.find((v) =>
        /\bmale\b/i.test(v.name) && !/female/i.test(v.name)
      );
      const neutral = voices.find(
        (v) => !/samantha|victoria|karen|tessa|zira|susan|female|fiona|moira|veena|female/i.test(v.name)
      );
      chosen = robotic || maleish || neutral || voices[0];
    }
    u.voice = chosen;
    // Completion lines queue behind the in-progress "On it"; thinking/greeting
    // lines cancel stale speech so they play immediately on send.
    if (!queue) window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = say;
  } else {
    say();
  }
}

// Pick a random line from a pool so BOB doesn't sound repetitive.
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Spoken phrase pools for each moment. Short, natural, and fitting the context.
const PHRASES = {
  greeting: [
    "Hi. Builder Operated Bot online. What are we building?",
    "Hello. Builder Operated Bot online and ready.",
    "Hey. Builder Operated Bot online. Let's build something.",
  ],
  thinking: [
    "On it.",
    "Working on that now.",
    "Give me a moment.",
    "Let me handle that.",
  ],
  question: [
    "Quick question for you.",
    "I need your input on this.",
    "Tell me how you'd like to proceed.",
    "One thing before I continue.",
  ],
  ready: [
    "All set. Ready when you are.",
    "Done. What's next?",
    "Ready for your next move.",
    "Finished. Anything else?",
  ],
  tile: [
    "Tiles are in. Nice.",
    "Tiles dropped and published.",
    "Done. Your tiles are live.",
  ],
  submitted: [
    "Component submitted. Cha-ching.",
    "That's published. Money move.",
    "Submitted and ready to earn.",
  ],
};

// Robotic unisex greeting — spoken the moment the BOB chat opens.
export function sayHi() {
  speak(pick(PHRASES.greeting));
}

// Many browsers (Chrome especially) silently drop the FIRST speechSynthesis
// utterance unless the engine was unlocked inside a user gesture. The page-load
// greeting runs without a gesture, so the engine stays "cold" and the first real
// "On it" on send gets dropped. unlockSpeech() primes the engine once, inside a
// gesture, by speaking an empty/near-silent utterance — after this every later
// speak() is honored. Safe to call on every send; it only primes once.
let speechUnlocked = false;
export function unlockSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (speechUnlocked) return;
  speechUnlocked = true;
  try {
    window.speechSynthesis.resume();
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    window.speechSynthesis.speak(warm);
  } catch { /* no-op */ }
}

// Computing sound — electronic beep on send instead of spoken "On it"
export const sayThinking = () => {
  playComputingBeep();
};
// Completion lines QUEUE behind an in-progress "On it" so they never cut it off.
export const sayQuestion = () => speak(pick(PHRASES.question), { queue: true });
export const sayReady = () => speak(pick(PHRASES.ready), { queue: true });
export const sayTiles = () => speak(pick(PHRASES.tile), { queue: true });
export const saySubmitted = () => speak(pick(PHRASES.submitted), { queue: true });