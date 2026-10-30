import React, { lazy, Suspense, useEffect, useState } from 'react';

const CinematicDesert = lazy(() => import('@/components/suite/CinematicDesert'));

export default function DeferredProvingGround(props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const fallback = <div className="suite-world animate-pulse" role="status" aria-label="Loading Proving Ground" />;
  return ready ? <Suspense fallback={fallback}><CinematicDesert {...props} /></Suspense> : fallback;
}