import React from 'react';
import { Scan, X, RotateCcw, Hand } from 'lucide-react';

export default function GroundInspectionControls({ focus, zoom, onFocus, onZoom, onNext, onReact }) {
  return <div className={`suite-ground-controls ${focus ? 'is-open' : ''}`}>
    {!focus ? <button onClick={() => onFocus('rover')}><Scan size={16} />Inspect ground</button> : <>
      <div className="suite-ground-control-row"><label htmlFor="ground-device">Inspect</label><select id="ground-device" value={focus} onChange={event => onFocus(event.target.value)}><option value="rover">Rover</option><option value="quadruped">Four-legged robot</option><option value="drone">Drone</option><option value="aircraft">Aircraft</option><option value="satellite">Satellite</option><option value="surveyor">Survey robot</option></select><button onClick={() => onFocus(null)} aria-label="Close ground inspection"><X size={16} /></button></div>
      <label className="suite-ground-control-row" htmlFor="ground-zoom">Zoom<input id="ground-zoom" type="range" min="1" max="2.4" step=".1" value={zoom} onChange={event => onZoom(Number(event.target.value))} /></label>
      <div className="suite-ground-control-row"><button onClick={onNext}><RotateCcw size={14} />Next device</button><button onClick={onReact}><Hand size={14} />React</button></div>
    </>}
  </div>;
}