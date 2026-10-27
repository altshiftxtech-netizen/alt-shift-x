import React from 'react';
import { Scan, X, RotateCcw, Hand } from 'lucide-react';
import LaserRangeControls from '@/components/suite/expansion/LaserRangeControls';

export default function GroundInspectionControls({ focus, zoom, onFocus, onZoom, onNext, onReact, scope, onScope, range }) {
  return <div className={`suite-ground-controls ${focus ? 'is-open' : ''} ${focus === 'kinetic' ? 'is-laser' : ''}`}>
    {!focus ? <button onClick={() => onFocus('rover')}><Scan size={16} />Inspect ground</button> : <>
      <div className="suite-ground-control-row"><label htmlFor="ground-device">Inspect</label><select id="ground-device" value={focus} onChange={event => onFocus(event.target.value)}><option value="rocket">Rocket</option><option value="rover">Rover</option><option value="quadruped">Four-legged robot</option><option value="drone">Drone</option><option value="aircraft">Aircraft</option><option value="satellite">Satellite</option><option value="surveyor">Survey robot</option><option value="forestry">Ecological forestry</option><option value="repository">Mountain repository</option><option value="kinetic">Laser spaceport range</option></select><button onClick={() => onFocus(null)} aria-label="Close ground inspection"><X size={16} /></button></div>
      {!(focus === 'kinetic' && scope) && <label className="suite-ground-control-row" htmlFor="ground-zoom">Zoom<input id="ground-zoom" type="range" min="1" max="2.4" step=".1" value={zoom} onChange={event => onZoom(Number(event.target.value))} /></label>}
      {focus === 'drone' && <p className="suite-ground-control-row">Move cursor to fly · React fires laser</p>}
      {focus === 'kinetic' ? <LaserRangeControls scope={scope} onScope={onScope} onNext={onNext} onFire={onReact} stats={range} /> : <div className="suite-ground-control-row"><button onClick={onNext}><RotateCcw size={14} />Next device</button><button onClick={onReact}><Hand size={14} />{focus === 'surveyor' ? 'Wave' : focus === 'forestry' ? 'Follow machine' : focus === 'repository' ? 'Open blast doors' : 'React'}</button></div>}
    </>}
  </div>;
}