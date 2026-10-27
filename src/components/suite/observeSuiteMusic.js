export default function observeSuiteMusic(audio, context, onChange) {
  let flowing = false;
  const emit = () => onChange?.(flowing && !audio.paused && !audio.ended && !audio.muted && audio.volume > 0 && (!context || context.state === 'running'));
  const playing = () => { flowing = true; emit(); };
  const stopped = () => { flowing = false; emit(); };
  const stopEvents = ['pause', 'waiting', 'stalled', 'ended', 'error'];
  audio.addEventListener('playing', playing);
  audio.addEventListener('volumechange', emit);
  stopEvents.forEach(event => audio.addEventListener(event, stopped));
  context?.addEventListener('statechange', emit);
  return () => {
    stopped();
    audio.removeEventListener('playing', playing);
    audio.removeEventListener('volumechange', emit);
    stopEvents.forEach(event => audio.removeEventListener(event, stopped));
    context?.removeEventListener('statechange', emit);
  };
}