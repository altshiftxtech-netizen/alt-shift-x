export function terminalLines(plan) {
  return [plan.beats[1]?.command || plan.command || 'make edge-optimize', '✓ thermal envelope nominal', '✓ clock held at target', '→ run the bench, not the slide'];
}

export const TERMINAL_REVEAL_RATE = 1.25;
export const TERMINAL_BUDGET = 1.15;
export const PROOF_STAMP = 0.10;

export function terminalClicks(plan, duration) {
  const lines = terminalLines(plan);
  const allChars = lines.reduce((sum, line) => sum + line.length, 0);
  return Array.from({ length: lines[0].length }, (_, index) =>
    (duration * (index + 1)) / (TERMINAL_REVEAL_RATE * TERMINAL_BUDGET * allChars)
  );
}