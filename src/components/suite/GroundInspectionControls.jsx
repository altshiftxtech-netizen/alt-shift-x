import React, { useEffect, useState } from 'react';
import { Scan, X, RotateCcw, Hand, Minus, Maximize2 } from 'lucide-react';
import LaserRangeControls from '@/components/suite/expansion/LaserRangeControls';
import PersonalGameControls from '@/components/suite/game/PersonalGameControls';

export default function GroundInspectionControls({ focus, zoom, onFocus, onZoom, onNext, onReact, onRestartRange, scope, onScope, range, personalGame, activity, onPlant, onCancelAction }) {
  const personal = ['planting', 'rovergame'].includes(focus);
  const [minimized, setMinimized] = useState(false);
  useEffect(() => { setMinimized(false); }, [focus]);
  return <div className={`suite-ground-controls ${focus && !minimized ? 'is-open' : ''} ${focus === 'kinetic' ? 'is-laser' : ''} ${personal ? 'is-personal' : ''}`}>
    {!focus ? <button onClick={() => onFocus('rover')}><Scan size={16} />Inspect ground</button> : minimized ? <>
      <button onClick={() => setMinimized(false)} aria-label="Restore ground inspection" aria-expanded={false}><Maximize2 size={16} />Inspect controls</button>
      {focus === 'kinetic' && scope && <span className="suite-laser-crosshair" aria-hidden="true" />}
    </> : <>
      <div className="suite-ground-control-row"><label htmlFor="ground-device">Inspect</label><select id="ground-device" value={focus} onChange={event => onFocus(event.target.value)}><option value="rocket">Rocket</option><option value="rover">Rover</option><option value="quadruped">Four-legged robot</option><option value="drone">Drone</option><option value="aircraft">Aircraft</option><option value="satellite">Satellite</option><option value="surveyor">Survey robot</option><option value="forestry">Ecological forestry</option><option value="repository">Mountain repository</option><option value="kinetic">Laser spaceport range</option><option value="planting">Plant trees · earn 20%</option><option value="rovergame">Drone rover game · earn 20%</option></select><button onClick={() => setMinimized(true)} aria-label="Minimize ground inspection" aria-expanded={true}><Minus size={16} /></button><button onClick={() => onFocus(null)} aria-label="Close ground inspection"><X size={16} /></button></div>
      {!personal && !(focus === 'kinetic' && scope) && <label className="suite-ground-control-row" htmlFor="ground-zoom">Zoom<input id="ground-zoom" type="range" min="1" max="2.4" step=".1" value={zoom} onChange={event => onZoom(Number(event.target.value))} /></label>}
      {focus === 'drone' && <p className="suite-ground-control-row">Move cursor to fly · React fires laser</p>}
      {focus === 'forestry' && <button onClick={() => onFocus('planting')}>Plant trees · earn 20%</button>}
      {focus === 'drone' && <button onClick={() => onFocus('rovergame')}>Play drone rover game</button>}
      {personal ? <PersonalGameControls focus={focus} game={personalGame} activity={activity} onPlant={onPlant} onCancel={onCancelAction} /> : focus === 'kinetic' ? <LaserRangeControls scope={scope} onScope={onScope} onNext={onNext} onFire={onReact} onRestart={onRestartRange} stats={range} /> : <div className="suite-ground-control-row"><button onClick={onNext}><RotateCcw size={14} />Next device</button><button onClick={onReact}><Hand size={14} />{focus === 'surveyor' ? 'Wave' : focus === 'forestry' ? 'Follow machine' : focus === 'repository' ? 'Open blast doors' : 'React'}</button></div>}
    </>}
  </div>;
}