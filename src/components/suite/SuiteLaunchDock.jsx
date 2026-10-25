import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import createLaunchScene from '@/components/suite/createLaunchScene';
import '@/components/suite/provingGround.css';

export default function SuiteLaunchDock() {
  const host = useRef(null), controller = useRef(null);
  const [phase, setPhase] = useState('Ready'), [expanded, setExpanded] = useState(false), [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    try { controller.current = createLaunchScene(host.current, setPhase); }
    catch (error) { console.error('Launch scene:', error); setUnavailable(true); }
    return () => controller.current?.dispose();
  }, []);
  return <section className={`suite-launch-dock ${expanded ? 'is-expanded' : ''}`} aria-label="Reusable rocket launch pad">
    <button className="suite-launch-expand" onClick={() => setExpanded(value => !value)} aria-label={expanded ? 'Minimize launch view' : 'Expand launch view'} aria-expanded={expanded}>{expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
    <button className="suite-launch-viewport" onClick={() => controller.current?.launch()} disabled={unavailable || phase !== 'Ready'} aria-label={phase === 'Ready' ? 'Launch rocket' : `Rocket: ${phase}`}><div ref={host} /></button>
    <div className="suite-launch-caption"><span className="suite-launch-phase" role="status" aria-live="polite">{unavailable ? '3D unavailable' : phase === 'Ready' ? 'Tap to launch' : phase}</span><span className="suite-launch-clock" title="Automatic launch at 9:30 AM America/New_York on normal NYSE trading days, while this page is open. Extraordinary exchange closures are not included.">Market open · 9:30 ET</span>{expanded && <small>Automatic on trading days while open. Tap when ready.</small>}</div>
  </section>;
}