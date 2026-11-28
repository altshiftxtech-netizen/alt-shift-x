import React from 'react';
import { shotTime, TONES } from '@/components/upkeeper/commercial/remixCuts';

export default function RemixAdjustments({ plan, voice, onVoice, onScore, onSwap, disabled }) {
  return <div className="dm-panel">
    <div className="dm-label">Remix adjustments</div>
    <div className="dm-row-between">
      <label className="dm-row">Voice Tone <select className="dm-input" value={voice} onChange={e => onVoice(e.target.value)} disabled={disabled}>{TONES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <button type="button" className="dm-ghost" onClick={onScore} disabled={disabled}>Re-Score Music</button>
    </div>
    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
      {plan.remix.shots.map((shot, i) => <label key={i} className="dm-beat grid gap-1 text-sm">
        {shotTime(shot.at)} · {plan.beats[shot.section].name} · Swap Footage
        <select className="dm-input min-w-0" value={shot.choice} onChange={e => onSwap(i, +e.target.value)} disabled={disabled}>
          {plan.remix.candidates.map(({ source, start }, j) => <option key={j} value={j}>{source.name} · {shotTime(start)}</option>)}
        </select>
      </label>)}
    </div>
  </div>;
}