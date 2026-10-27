import React from 'react';
import { Crosshair, RotateCcw, Zap } from 'lucide-react';

export default function LaserRangeControls({ scope, onScope, onNext, onFire, onRestart, stats }) {
  return <>
    <p className="suite-laser-help">Shoot two different drones of the same color. Clear 50 pairs per session, five pairs at a time. {scope ? 'Move/drag to aim · Space fires · Esc exits' : 'Move/drag to aim · Click/tap to fire'}</p>
    <div className="suite-ground-control-row suite-laser-actions"><button onClick={onNext}><RotateCcw size={14} />Next turret</button><button onClick={() => onScope(!scope)} aria-pressed={scope}><Crosshair size={14} />{scope ? 'Leave sights' : 'Take aim'}</button><button onClick={onFire} disabled={stats.complete}><Zap size={14} />Fire laser</button><button onClick={onRestart}><RotateCcw size={14} />New session</button></div>
    <output className="suite-laser-score" aria-live="polite">{stats.pairs} / {stats.goal} pairs matched · {stats.fired} shots<br />{stats.message}</output>
    {scope && <span className="suite-laser-crosshair" aria-hidden="true" />}
  </>;
}