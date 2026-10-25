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
    const state = t < 0 ? 'Ready' : t < 2 ? 'Ignition' : t < 8 ? 'Ascent' : t < 54 ? 'Away' : t < 60 ? 'Landing burn' : t < 62 ? 'Touchdown' : t < 69 ? 'Robotic servicing' : 'Ready';
    if (t >= 69) started = null;
    if (state !== previous) { previous = state; notify(state); }
    const altitude = t < 2 ? 0 : t < 8 ? 350 * ((t - 2) / 6) ** 2 : t < 54 ? 350 : t < 60 ? 350 * (1 - smooth((t - 54) / 6)) : 0;
    vehicle.rocket.visible = state !== 'Away';
    vehicle.rocket.position.set(0, 1.2 + altitude, 0);
    vehicle.rocket.rotation.z = state === 'Landing burn' ? -.06 * Math.sin((t - 54) / 6 * Math.PI * 2) : 0;
    const burn = ['Ignition', 'Ascent', 'Landing burn'].includes(state);
    vehicle.flame.visible = burn; vehicle.core.visible = burn;
    const throttle = state === 'Ignition' ? .2 + smooth(t / 2) * .3 : state === 'Landing burn' ? .25 + altitude / 35 : 1;
    vehicle.flame.scale.y = throttle * (1 + Math.sin(now * .012) * .04);
    vehicle.flame.position.y = -.4 - 1.9 * vehicle.flame.scale.y;
    vehicle.core.scale.y = throttle; vehicle.core.position.y = -.4 - 1.3 * throttle;
    const deployed = state === 'Ascent' ? 1 - smooth((t - 2) / 2) : state === 'Away' ? 0 : state === 'Landing burn' ? smooth((t - 57) / 2) : 1;
    vehicle.legs.forEach(leg => { leg.rotation.x = -.8 * deployed; });
    pad.arms.forEach(({ shoulder, elbow, side }) => {
      const service = state === 'Robotic servicing' ? Math.sin((t - 62) / 7 * Math.PI) ** 2 : 0;
      shoulder.rotation.z = -side * (.18 + service * .8); elbow.rotation.z = side * (.7 - service * 1.2);
    });
    return { altitude, state };
  };
  return { launch, update };
}