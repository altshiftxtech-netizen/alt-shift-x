import React, { useEffect, useRef, useState } from 'react';
import createDesertScene from '@/components/suite/createDesertScene';
import GroundInspectionControls from '@/components/suite/GroundInspectionControls';
import '@/components/suite/provingGround.css';

export default function CinematicDesert({ onInspectionChange }) {
  const host = useRef(null), inspection = useRef({ focus: null, zoom: 1, index: 0, react: false });
  const [focus, setFocus] = useState(null), [zoom, setZoom] = useState(1);
  const changeFocus = value => { inspection.current.focus = value; inspection.current.index = 0; setFocus(value); onInspectionChange?.(Boolean(value)); };
  const [, setStatus] = useState('INITIALIZING RECONNAISSANCE');
  useEffect(() => {
    let dispose;
    try { dispose = createDesertScene(host.current, setStatus, inspection.current); }
    catch (error) { console.error('Desert renderer:', error); setStatus('3D REQUIRES WEBGL / SUITE NAVIGATION REMAINS AVAILABLE'); }
    return () => dispose?.();
  }, []);
  return <><div ref={host} className="suite-world" /><GroundInspectionControls focus={focus} zoom={zoom} onFocus={changeFocus} onZoom={value => { inspection.current.zoom = value; setZoom(value); }} onNext={() => { inspection.current.index++; }} onReact={() => { inspection.current.react = true; }} /></>;
}