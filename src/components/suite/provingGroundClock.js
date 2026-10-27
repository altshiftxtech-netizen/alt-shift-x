export default function provingGroundClock() {
  let last = performance.now(), lastInteraction = -Infinity, visible = !document.hidden, music = false, stopped = false;
  const totals = { open_seconds: 0, visible_seconds: 0, active_seconds: 0, music_seconds: 0 };
  const tick = () => {
    if (stopped) return { ...totals };
    const now = performance.now(), seconds = Math.max(0, now - last) / 1000;
    totals.open_seconds += seconds;
    if (visible) {
      totals.visible_seconds += seconds;
      totals.active_seconds += Math.max(0, Math.min(now, lastInteraction + 30000) - last) / 1000;
    }
    if (music) totals.music_seconds += seconds;
    last = now;
    return { ...totals };
  };
  return { tick, stop: () => { tick(); stopped = true; }, interact: () => { tick(); lastInteraction = performance.now(); }, visibility: () => { tick(); visible = !document.hidden; }, music: value => { tick(); music = value; } };
}