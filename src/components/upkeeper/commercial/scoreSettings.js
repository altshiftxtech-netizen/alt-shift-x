export const KEYS = {
  'D minor': { root: 38, scale: [0, 3, 5, 7, 10] },
  'F♯ minor': { root: 42, scale: [0, 3, 5, 7, 10] },
  'C major': { root: 36, scale: [0, 2, 4, 7, 9] },
};

export const MOODS = {
  'Cyberpunk Industrial': { wave: 'sawtooth', drive: .72, texture: .12, step: .5 },
  'Aggressive Workout Bass': { wave: 'square', drive: 1, texture: .08, step: .5 },
  'Cinematic Orchestral Drone': { wave: 'triangle', drive: .42, texture: .16, step: 1 },
  'Retro Hardware Synthwave': { wave: 'triangle', drive: .62, texture: .08, step: .25 },
};

export const DEFAULT_SCORE = { mood: 'Cyberpunk Industrial', key: 'D minor', bpm: 105 };
export const noteHz = (midi) => 440 * 2 ** ((midi - 69) / 12);