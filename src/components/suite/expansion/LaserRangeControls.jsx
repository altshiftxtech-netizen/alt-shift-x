import React from 'react';
import { Crosshair, RotateCcw, Zap } from 'lucide-react';

export default function LaserRangeControls({ scope, onScope, onNext, onFire, stats }) {
  return <>
    <p className="suite-laser-help">{scope ? 'Orange drones are targets · Move/drag to aim · Hold/Space fires · Esc exits' : 'Orange drones are targets · Move/drag to aim · Click/tap or hold to fire'}</p>
    <div className="suite-ground-control-row suite-laser-actions"><button onClick={onNext}><RotateCcw size={14} />Next turret</button><button onClick={() => onScope(!scope)} aria-pressed={scope}><Crosshair size={14} />{scope ? 'Leave sights' : 'Take aim'}</button><button onClick={onFire}><Zap size={14} />Fire laser</button></div>
    <output className="suite-laser-score" aria-live="polite">{stats.hits} intercepted · {stats.fired} bursts · Streak {stats.streak}</output>
    {scope && <span className="suite-laser-crosshair" aria-hidden="true" />}
  </>;
}