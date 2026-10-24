import { useEffect, useRef, useState } from 'react';

export default function useSuiteOrbit() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const motion = useRef({ angle: 0, velocity: 0, down: false, moved: false, lastX: 0, time: 0, target: null });
  useEffect(() => {
    let frame, previous = performance.now();
    const tick = now => {
      const m = motion.current, dt = Math.min((now - previous) / 1000, .05); previous = now;
      if (!m.down) {
        if (m.target !== null) { const diff = m.target - m.angle; m.angle += diff * (1 - Math.exp(-dt * 7)); if (Math.abs(diff) < .05) m.target = null; }
        else { m.angle += (m.velocity + 1.6) * dt; m.velocity *= Math.exp(-dt * 2.8); }
      }
      setRotationAngle(m.angle); frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, []);
  const select = angle => { const m = motion.current; m.velocity = 0; m.target = m.angle + (((angle - m.angle + 180) % 360 + 360) % 360) - 180; };
  const handlers = {
    onPointerDown: e => { if (e.target.closest('button,a,input,textarea')) return; const m = motion.current; Object.assign(m, { down: true, moved: false, lastX: e.clientX, time: performance.now(), target: null, velocity: 0 });  },
    onPointerMove: e => { const m = motion.current; if (!m.down) return; const now = performance.now(), dx = e.clientX - m.lastX; m.angle += dx * .28; m.velocity = Math.max(-110, Math.min(110, dx * .28 / Math.max(.016, (now - m.time) / 1000))); m.moved ||= Math.abs(dx) > 2; if (m.moved && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId); m.lastX = e.clientX; m.time = now; },
    onPointerUp: () => { motion.current.down = false; },
    onPointerCancel: () => { motion.current.down = false; },
  };
  return { rotationAngle, select, handlers, motion };
}