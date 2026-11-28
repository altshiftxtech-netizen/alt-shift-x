import React from 'react';
import { Sparkles, Loader2, Square } from 'lucide-react';
import { ASPECTS, DURATIONS } from '@/components/upkeeper/commercial/directorPlan';
import { VOICES } from '@/components/upkeeper/commercial/directorAudio';
import { PACING, TONES } from '@/components/upkeeper/commercial/remixCuts';

export default function ConceptBar({
  prompt,
  setPrompt,
  aspect,
  setAspect,
  duration,
  setDuration,
  voice,
  setVoice,
  onGenerate,
  onCancel,
  busy,
  progress,
  pace,
  setPace,
  hasFootage,
  scanning,
}) {
  const working = Boolean(busy || scanning);
  const label =
    busy === 'plan'
      ? 'Cutting the beat sheet'
      : busy === 'voice'
        ? 'Recording narration'
        : busy === 'render'
          ? `Rendering master ${progress ? `${progress}%` : ''}`
          : 'Generate Commercial';

  return (
    <div className="dm-panel">
      <label className="dm-label" htmlFor="dm-concept">
        Director&rsquo;s Intent
      </label>
      <input
        type="text"
        id="dm-concept"
        className="dm-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Remix this into a 30s high-velocity YouTube Short for our Edge Optimizer. Keep the typing clip from 0:12, add a gritty synthwave beat in D-minor, and hit a heavy bass drop on the logo."
        disabled={working}
      />

      <div className="dm-row-between" style={{ marginTop: 14 }}>
        <div className="dm-row">
          {ASPECTS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="dm-chip"
              data-on={aspect === option.key}
              onClick={() => setAspect(option.key)}
              disabled={working}
            >
              {option.label}
              <small>{option.hint}</small>
            </button>
          ))}
        </div>
        <div className="dm-row">
          {DURATIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="dm-chip"
              data-on={duration === option.key}
              onClick={() => setDuration(option.key)}
              disabled={working}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {hasFootage && <div className="dm-row mt-3" aria-label="Quick pacing">
        {Object.entries(PACING).map(([id, [label]]) => <button key={id} type="button" className="dm-chip" aria-pressed={pace === id} data-on={pace === id} onClick={() => setPace(id)} disabled={working}>{label}</button>)}
      </div>}
      <div className="dm-row-between" style={{ marginTop: 16, gap: 14 }}>
        <label className="dm-row" style={{ gap: 8, fontSize: 12, color: 'var(--dm-dim)' }}>
          <span className="dm-label" style={{ margin: 0 }}>
            Narration
          </span>
          <select
            className="dm-input"
            style={{ width: 'auto', padding: '8px 10px', fontSize: 12 }}
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            disabled={working}
            aria-label="Narration voice"
          >
            {(hasFootage ? TONES.map(([key, label]) => ({ key, label })) : VOICES).map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <div className="dm-row">
          {(busy === 'render' || busy === 'gif') && (
            <button type="button" className="dm-ghost" onClick={onCancel}>
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          )}
          <button type="button" className="dm-primary" onClick={onGenerate} disabled={working || !prompt.trim()}>
            {working ? <Loader2 className="w-4 h-4 dm-spin" /> : <Sparkles className="w-4 h-4" />}
            {label}
          </button>
        </div>
      </div>

      {busy === 'render' && (
        <div className="dm-progress" style={{ marginTop: 12 }}>
          <i style={{ width: `${Math.max(3, progress)}%` }} />
        </div>
      )}
      <p className="dm-note" style={{ marginTop: 10 }}>
        {hasFootage ? 'Generate a playable remix, then export it when ready. Video exports record in real time; keep this tab in front.' : 'The render runs in real time. Keep this tab in front while it records.'}
      </p>
    </div>
  );
}