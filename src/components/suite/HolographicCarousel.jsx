import React, { useEffect, useRef } from 'react';
import createHolograms from '@/components/suite/createHolograms';

export default function HolographicCarousel({ nodes, angle, selected }) {
  const host = useRef(null), state = useRef({ nodes, angle, selected });
  state.current = { nodes, angle, selected };
  useEffect(() => {
    let dispose;
    try { dispose = createHolograms(host.current, state); }
    catch (error) { console.error('Hologram renderer:', error); }
    return () => dispose?.();
  }, []);
  return <div ref={host} className="suite-holograms" aria-hidden="true" />;
}