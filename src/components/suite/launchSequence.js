import * as THREE from 'three';
import launchClock from '@/components/suite/launchClock';

export default function launchSequence(vehicle, pad, notify) {
  let started = null, previous = '', scheduledDay = '', lastClock = 0;
  const smooth = x => { const p = THREE.MathUtils.clamp(x, 0, 1); return p * p * (3 - 2 * p); };
  const launch = () => { if (started !== null) return false; started = performance.now(); notify('Ignition'); return true; };
  const update = now => {
    if (now - lastClock > 500) {
      const clock = launchClock(); lastClock = now;
      if (clock.due && scheduledDay !== clock.key) { scheduledDay = clock.key; launch(); }
    }
    const t = started === null ? -1 : (now - started) / 1000;
    const state = t < 0 ? 'Ready' : t < 2 ? 'Ignition' : t < 7 ? 'Ascent' : t < 9 ? 'Coasting' : t < 15 ? 'Landing burn' : t < 17 ? 'Touchdown' : t < 24 ? 'Robotic servicing' : 'Ready';
    if (t >= 24) started = null;
    if (state !== previous) { previous = state; notify(state); }
    const altitude = t < 2 ? 0 : t < 7 ? 24 * ((t - 2) / 5) ** 2 : t < 9 ? 24 : t < 15 ? 24 * (1 - smooth((t - 9) / 6)) : 0;
    vehicle.rocket.position.set(t >= 7 && t < 15 ? 3 * Math.sin(smooth((t - 7) / 8) * Math.PI) : 0, 1.2 + altitude, 0);
    vehicle.rocket.rotation.z = t >= 7 && t < 15 ? -.13 * Math.sin((t - 7) / 8 * Math.PI * 2) : 0;
    const burn = ['Ignition', 'Ascent', 'Landing burn'].includes(state);
    vehicle.flame.visible = burn; vehicle.core.visible = burn;
    const throttle = state === 'Ignition' ? .2 + smooth(t / 2) * .3 : state === 'Landing burn' ? .25 + altitude / 35 : 1;
    vehicle.flame.scale.y = throttle * (1 + Math.sin(now * .012) * .04);
    vehicle.flame.position.y = -.4 - 1.9 * vehicle.flame.scale.y;
    vehicle.core.scale.y = throttle; vehicle.core.position.y = -.4 - 1.3 * throttle;
    const deployed = state === 'Ascent' ? 1 - smooth((t - 2) / 2) : t >= 7 && t < 12 ? 0 : state === 'Landing burn' ? smooth((t - 12) / 2) : 1;
    vehicle.legs.forEach(leg => { leg.rotation.x = -.8 * deployed; });
    pad.arms.forEach(({ shoulder, elbow, side }) => {
      const service = state === 'Robotic servicing' ? Math.sin((t - 17) / 7 * Math.PI) ** 2 : 0;
      shoulder.rotation.z = -side * (.18 + service * .8); elbow.rotation.z = side * (.7 - service * 1.2);
    });
    return { altitude, state };
  };
  return { launch, update };
}