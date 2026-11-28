import React from 'react';

const ROWS = [
  { key: 'voice', label: 'Voiceover' },
  { key: 'sfx', label: 'Ambient SFX' },
  { key: 'score', label: 'Score' },
];

export default function AudioBalance({ levels, onChange, disabled }) {
  return (
    <div className="dm-panel">
      <span className="dm-label">Mix balance</span>
      <div className="dm-mix">
        {ROWS.map((row) => (
          <label key={row.key} className="dm-mix-row">
            <span>{row.label}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={levels[row.key]}
              disabled={disabled}
              aria-label={`${row.label} level`}
              onChange={(e) => onChange({ ...levels, [row.key]: Number(e.target.value) })}
            />
            <output>{Math.round(levels[row.key] * 100)}</output>
          </label>
        ))}
      </div>
      <p className="dm-note" style={{ marginTop: 10 }}>
        Applied live in the preview and baked into the next render.
      </p>
    </div>
  );
}