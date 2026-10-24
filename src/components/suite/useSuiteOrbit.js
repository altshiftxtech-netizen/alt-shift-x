import { useEffect, useRef, useState } from 'react';

export default function useSuiteOrbit() {
  const [rotationAngle, setRotationAngle] = useState(90), [paused, setPaused] = useState(false);
  const motion = useRef({ angle: 90, velocity: 0, down: false, moved: false, lastX: 0, startX: 0, time: 0, target: null, paused: false });
  const pause = () => { motion.current.paused = true; setPaused(true); };
  useEffect(() => {
    let frame, previous = performance.now();
    const release = () => { motion.current.down = false; };
    const tick = now => {
      const m = motion.current, dt = Math.min((now - previous) / 1000, .05); previous = now;
      if (!m.down) {
        if (m.target !== null) {
          const diff = m.target - m.angle;
          m.angle += diff * (1 - Math.exp(-dt * 10));
          if (Math.abs(diff) < .03) { m.angle = m.target; m.target = null; }
        } else {
          m.angle += (m.velocity + (m.paused ? 0 : 1.6)) * dt;
          m.velocity *= Math.exp(-dt * 5);
          if (Math.abs(m.velocity) < .05) m.velocity = 0;
        }
      }
      setRotationAngle(m.angle); frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); };
  }, []);
  const select = angle => {
    const m = motion.current; pause(); m.down = false; m.velocity = 0;
    m.target = m.angle + (((angle - m.angle + 180) % 360 + 360) % 360) - 180;
  };
  const togglePaused = () => { const m = motion.current; m.paused = !m.paused; m.velocity = 0; setPaused(m.paused); };
  const handlers = {
    onPointerDown: e => {
      if (e.target.closest('a,input,textarea,[data-orbit-control]')) return;
      pause(); Object.assign(motion.current, { down: true, moved: false, startX: e.clientX, lastX: e.clientX, time: performance.now(), target: null, velocity: 0 });
    },
    onPointerMove: e => {
      const m = motion.current; if (!m.down) return;
      const now = performance.now(), dx = e.clientX - m.lastX;
      m.moved ||= Math.abs(e.clientX - m.startX) > 5;
      if (m.moved) { m.angle += dx * .28; m.velocity = Math.max(-85, Math.min(85, dx * .28 / Math.max(.016, (now - m.time) / 1000))); if (!e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId); }
      m.lastX = e.clientX; m.time = now;
    },
    onPointerUp: () => { motion.current.down = false; },
    onPointerCancel: () => { motion.current.down = false; motion.current.velocity = 0; },
  };
  return { rotationAngle, select, handlers, motion, paused, togglePaused };
}