import React from 'react';
import { Dices } from 'lucide-react';

export default function BeatSheet({ plan, activeIndex, onReroll, disabled }) {
  if (!plan) return null;
  return (
    <div className="dm-beats">
      {plan.beats.map((beat, index) => (
        <article key={index} className="dm-beat" data-active={activeIndex === index}>
          <div className="dm-beat-top">
            <span className="dm-beat-index">
              {String(index + 1).padStart(2, '0')} · {beat.name.toUpperCase()}
            </span>
            <span className="dm-beat-time">{plan.durations[index]}s</span>
          </div>
          <h4>{beat.headline}</h4>
          <p className="dm-beat-vo">{beat.voiceover}</p>
          <div className="dm-meta">
            <span className="dm-tag">{beat.camera}</span>
            <span className="dm-tag">{beat.lighting}</span>
            <span className="dm-tag">{beat.broll}</span>
          </div>
          <button type="button" className="dm-reroll" onClick={() => onReroll(index)} disabled={disabled}>
            <Dices className="w-3 h-3" style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
            Re-roll scene
          </button>
        </article>
      ))}
    </div>
  );
}