export const MATCH_COLORS = [
  { name: 'red', hex: '#ff566b' }, { name: 'cyan', hex: '#44ddff' },
  { name: 'gold', hex: '#ffd45a' }, { name: 'green', hex: '#5ef09b' },
  { name: 'violet', hex: '#c08aff' },
];
export default function kineticMatchSession(targets) {
  let pairs = 0, first = null, message = 'Shoot two different drones of the same color.';
  const deal = () => {
    const colors = MATCH_COLORS.flatMap((_, i) => [i, i]);
    for (let i = colors.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [colors[i], colors[j]] = [colors[j], colors[i]]; }
    targets.forEach((target, i) => Object.assign(target, { colorIndex: colors[i], selected: false, matched: false, active: true }));
  };
  deal();
  return {
    get complete() { return pairs === 50; },
    hit(target) {
      if (pairs === 50 || !target.active) return 'ignored';
      if (!first) {
        first = target; target.selected = true; target.active = false;
        message = `${MATCH_COLORS[target.colorIndex].name} selected. Shoot its matching color.`;
        return 'selected';
      }
      if (first.colorIndex !== target.colorIndex) {
        first.selected = false; first.active = true; first = null;
        message = 'Different colors. Both targets remain; try another pair.';
        return 'mismatch';
      }
      first.selected = false; first.matched = target.matched = true; target.active = false;
      first = null; pairs++;
      message = pairs === 50 ? 'Session complete! All 50 pairs matched.' : 'Color matched! Find the next pair.';
      if (pairs < 50 && targets.every(item => item.matched)) deal();
      return 'matched';
    },
    reset() { pairs = 0; first = null; message = 'Shoot two different drones of the same color.'; deal(); },
    stats() { return { pairs, goal: 50, complete: pairs === 50, selectedColor: first ? MATCH_COLORS[first.colorIndex].name : null, message }; },
  };
}