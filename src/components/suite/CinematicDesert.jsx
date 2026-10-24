import React, { useEffect, useRef, useState } from 'react';
import createDesertScene from '@/components/suite/createDesertScene';

export default function CinematicDesert() {
  const host = useRef(null);
  const [status, setStatus] = useState('INITIALIZING RECONNAISSANCE');
  useEffect(() => {
    let dispose;
    try { dispose = createDesertScene(host.current, setStatus); }
    catch (error) { console.error('Desert renderer:', error); setStatus('3D REQUIRES WEBGL / SUITE NAVIGATION REMAINS AVAILABLE'); }
    return () => dispose?.();
  }, []);
  return <><div ref={host} className="suite-world" /><div className="suite-world-status" aria-live="off">{status}</div></>;
}