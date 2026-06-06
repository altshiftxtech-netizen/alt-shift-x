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

// Robotic unisex "hi" greeting via speech synthesis.
export function sayHi() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const speak = () => {
    const u = new SpeechSynthesisUtterance("Hi. BOB online.");
    // Lower-than-default pitch + slowed rate reads as flat/robotic and unisex.
    u.pitch = 0.4;
    u.rate = 0.85;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    // Prefer a neutral/robotic-sounding voice when available.
    const preferred = voices.find((v) => /google|zira|daniel|fred|albert/i.test(v.name));
    if (preferred) u.voice = preferred;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  // Voices may load async on first call.
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speak;
  } else {
    speak();
  }
}