export const FORESTRY_CYCLE_MS = 5 * 60 * 60 * 1000;

export default function forestryClock(timestamp = Date.now()) {
  // UTC epoch modulo, never local timezone or time since the page opened.
  const seconds = ((timestamp % FORESTRY_CYCLE_MS) + FORESTRY_CYCLE_MS) % FORESTRY_CYCLE_MS / 1000;
  const phase = seconds < 7200 ? 1 : seconds < 12600 ? 2 : 3;
  const start = phase === 1 ? 0 : phase === 2 ? 7200 : 12600;
  const duration = phase === 1 ? 7200 : 5400;
  return { phase, progress: (seconds - start) / duration, secondsIntoPhase: seconds - start, humans: phase !== 1, name: ['REFORESTATION', 'BRUSH MANAGEMENT', 'SELECTIVE HARVEST'][phase - 1] };
}