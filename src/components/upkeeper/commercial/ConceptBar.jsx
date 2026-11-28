import React from 'react';
import { Sparkles, Loader2, Square } from 'lucide-react';
import { ASPECTS, DURATIONS } from '@/components/upkeeper/commercial/directorPlan';
import { VOICES } from '@/components/upkeeper/commercial/directorAudio';

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
}) {
  const working = Boolean(busy);
  const label =
    busy === 'plan'
      ? 'Cutting the beat sheet'
      : busy === 'voice'
        ? 'Recording narration'
        : busy === 'render'
          ? `Rendering master ${progress ? `${progress}%` : ''}`
          : 'Generate Master Commercial';

  return (
    <div className="dm-panel">
      <label className="dm-label" htmlFor="dm-concept">
        Director&rsquo;s concept
      </label>
      <textarea
        id="dm-concept"
        className="dm-concept"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A 30-second gritty cinematic ad for our Edge Device Optimizer — an ageing Raspberry Pi running cool at 42°C, high-viz terminal B-roll and a hard-hitting voiceover."
        disabled={working}
        rows={4}
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
            {VOICES.map((v) => (
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
        One pass renders the picture, burned-in captions, narration, score and SFX together. The render runs in real time,
        so a 30-second cut takes roughly 30 seconds on a current desktop browser. Keep this tab in front while it records.
      </p>
    </div>
  );
}