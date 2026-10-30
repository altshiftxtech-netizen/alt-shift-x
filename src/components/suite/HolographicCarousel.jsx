import React, { useEffect, useRef } from 'react';


export default function HolographicCarousel({ nodes, angle, selected }) {
  const host = useRef(null), state = useRef({ nodes, angle, selected });
  state.current = { nodes, angle, selected };
  useEffect(() => {
    let dispose, cancelled = false;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(async () => {
        try {
          const { default: createHolograms } = await import('@/components/suite/createHolograms');
          if (!cancelled) dispose = createHolograms(host.current, state);
        } catch (error) { console.error('Hologram renderer:', error); }
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); dispose?.(); };
  }, []);
  return <div ref={host} className="suite-holograms" aria-hidden="true" />;
}