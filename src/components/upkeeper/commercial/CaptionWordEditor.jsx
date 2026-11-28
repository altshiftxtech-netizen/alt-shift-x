import React from 'react';
import { Bold, Type } from 'lucide-react';

const COLOURS = ['#00e5ff', '#e6bd4d', '#7cf6c8', '#ff7a59', '#ffffff'];

export default function CaptionWordEditor({ plan, beatIndex, selected, onSelect, onPatch }) {
  if (!plan) return null;
  const beat = plan.beats[beatIndex];
  if (!beat) return null;
  const word = selected == null ? null : beat.words[selected];

  return (
    <div className="dm-panel">
      <div className="dm-row-between" style={{ marginBottom: 10 }}>
        <span className="dm-label" style={{ margin: 0 }}>
          <Type className="w-3 h-3" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
          Captions · {beat.name}
        </span>
        <span className="dm-note">Click a word on the picture, or here</span>
      </div>

      <div className="dm-words">
        {beat.words.map((item, index) => (
          <button
            key={index}
            type="button"
            className="dm-word"
            data-selected={selected === index}
            data-emph={item.e}
            style={item.e ? { background: item.c, borderColor: item.c } : undefined}
            onClick={() => onSelect(selected === index ? null : index)}
          >
            {item.w}
          </button>
        ))}
        {beat.words.length === 0 && <p className="dm-note">This beat has no narration, so it carries no captions.</p>}
      </div>

      {word && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="dm-input"
            value={word.w}
            onChange={(e) => onPatch({ w: e.target.value })}
            aria-label="Caption word"
            maxLength={40}
          />
          <div className="dm-row-between">
            <div className="dm-row">
              <button
                type="button"
                className="dm-chip"
                data-on={word.e}
                onClick={() => onPatch({ e: !word.e })}
              >
                <Bold className="w-3.5 h-3.5" /> Emphasis
              </button>
              <div className="dm-row" style={{ gap: 6 }}>
                {COLOURS.map((colour) => (
                  <button
                    key={colour}
                    type="button"
                    className="dm-swatch"
                    data-on={word.c === colour}
                    style={{ background: colour }}
                    aria-label={`Highlight ${colour}`}
                    onClick={() => onPatch({ c: colour, e: true })}
                  />
                ))}
              </div>
            </div>
            <span className="dm-note">Edits the burned-in caption, not the narration.</span>
          </div>
        </div>
      )}
    </div>
  );
}