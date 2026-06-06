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

// Core robotic-voice speak helper — flat pitch + slowed rate reads as a neutral,
// unisex robotic voice. Used for the greeting and every spoken status line so
// BOB feels like it's actually talking to the user.
// speak(text, { queue }) — when queue is true the utterance is appended behind
// anything currently speaking instead of cancelling it. This guarantees the
// "On it" thinking line (spoken on send, while BOB types) always finishes
// before a completion line like "Finished" plays.
export function speak(text, { queue = false } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  const say = () => {
    const u = new SpeechSynthesisUtterance(text);
    // Very low pitch + slightly slow rate reads as a deep, gender-neutral
    // machine voice rather than anything feminine.
    u.pitch = 0.1;
    u.rate = 0.82;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    // Prefer deeper / robotic neutral voices; explicitly avoid the common
    // feminine defaults (Samantha, Victoria, Karen, Tessa, Zira, Susan).
    const robotic = voices.find((v) =>
      /robot|fred|albert|ralph|cellos|zarvox|trinoids|google uk english male|daniel|alex|rocko|grandpa/i.test(v.name)
    );
    const maleish = voices.find((v) =>
      /\bmale\b/i.test(v.name) && !/female/i.test(v.name)
    );
    const neutral = voices.find(
      (v) => !/samantha|victoria|karen|tessa|zira|susan|female|fiona|moira|veena|female/i.test(v.name)
    );
    u.voice = robotic || maleish || neutral || voices[0];
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

// Thinking line plays immediately on send (cancels stale speech) so it lands
// before / while BOB types. Completion lines queue so they wait for "On it" to
// finish first instead of cutting it off.
export const sayThinking = () => speak(pick(PHRASES.thinking));
export const sayQuestion = () => speak(pick(PHRASES.question), { queue: true });
export const sayReady = () => speak(pick(PHRASES.ready), { queue: true });
export const sayTiles = () => speak(pick(PHRASES.tile), { queue: true });
export const saySubmitted = () => speak(pick(PHRASES.submitted), { queue: true });