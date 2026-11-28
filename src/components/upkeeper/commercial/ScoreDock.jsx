import React from 'react';
import { KEYS, MOODS } from '@/components/upkeeper/commercial/scoreSettings';

export default function ScoreDock({ value, onChange, disabled }) {
  const patch = (fields) => onChange({ ...value, ...fields });
  return (
    <fieldset className="dm-panel space-y-3" disabled={disabled}>
      <legend className="dm-label">Director’s Score</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Score mood">
        {Object.keys(MOODS).map((mood) => <button key={mood} type="button" className="dm-chip" aria-pressed={value.mood === mood} data-on={value.mood === mood} onClick={() => patch({ mood })}>{mood}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">Musical key
          <select className="rounded border bg-background p-2 text-foreground" value={value.key} onChange={(e) => patch({ key: e.target.value })}>{Object.keys(KEYS).map((key) => <option key={key}>{key}</option>)}</select>
        </label>
        <label className="flex items-center gap-2 text-sm">Tempo <input type="range" min={85} max={140} value={value.bpm} onChange={(e) => patch({ bpm: Number(e.target.value) })} /><output className="tabular-nums">{value.bpm} BPM</output></label>
      </div>
      <p className="dm-note">The score is synthesized locally and follows the four scene cuts. Press Play after changing the mood, key, or tempo.</p>
    </fieldset>
  );
}