export default function timedPersonalAction(inspection, bridge) {
  let current = null, lastReport = 0;
  const report = (message, progress = 0, busy = false) => inspection.onPersonalActivity?.({ message, progress, busy });
  const cancel = () => { if (current) { current.cancelled = true; current = null; report('Action canceled. No success counted.'); } };
  return {
    get current() { return current; }, cancel,
    async start(kind, target, focus, valid, success) {
      if (current || bridge.current.loading || bridge.current.unlocked) return;
      const attempt = { kind, target, focus, valid, success, elapsed: 0, phase: 'starting' }; current = attempt;
      report('Preparing action…', 0, true);
      const result = await bridge.current.start(kind, target);
      if (attempt.cancelled) return;
      if (!result?.challenge) { current = null; report('Could not start. Check the message below and retry.'); return; }
      attempt.challenge = result.challenge; attempt.phase = 'running';
    },
    update(dt) {
      const action = current; if (!action) return;
      if (document.hidden || inspection.focus !== action.focus || !action.valid()) { cancel(); return; }
      if (action.phase !== 'running') return;
      // Slow frames pause progress instead of canceling a legitimate action.
      action.elapsed += Math.min(dt, .1);
      if (performance.now() - lastReport > 100) { lastReport = performance.now(); report(action.kind === 'tree' ? 'Robot planting…' : 'Laser locked…', Math.min(1, action.elapsed / 2.05), true); }
      if (action.elapsed < 2.05) return;
      action.phase = 'saving'; report('Saving success…', 1, true);
      const save = action.challenge === 'practice' ? Promise.resolve({ practice: true }) : bridge.current.finish(action.challenge);
      save.then(result => {
        if (result) action.success(result);
        if (current !== action) return;
        current = null;
        report(result ? result.practice ? 'Practice complete. Sign in to earn rewards.' : result.unlocked ? '50 successes! Your 20% discount is unlocked.' : `Success saved: ${result.successes} / 50` : 'Not saved. Please retry.');
      });
    },
  };
}