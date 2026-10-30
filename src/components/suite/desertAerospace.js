import * as THREE from 'three';
import { rounded, sphere } from '@/components/suite/sleekParts';
import stagedParticles from '@/components/suite/stagedParticles';

export default function desertAerospace(scene, materials, compact) {
  const satellites = [], craft = [], targets = [];
  let seed = 9321; const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const starfield = stagedParticles(scene, 950, new THREE.PointsMaterial({ color: '#c9dce9', size: .65, sizeAttenuation: true, transparent: true, opacity: .8, fog: false, depthWrite: false }), () => [(random() - .5) * 640, 35 + random() * 230, -250 - random() * 120]);
  const stars = starfield.points;
  for (let i = 0; i < (compact ? 2 : 3); i++) {
    const group = new THREE.Group(); group.userData = { kind: 'satellite', activation: -100 };
    rounded(group, [1.5, 1.8, 1.5], [0, 0, 0], materials.shell);
    for (const side of [-1, 1]) {
      rounded(group, [5, .08, 2.4], [side * 3.7, 0, 0], materials.glass);
      for (let n = 0; n < 5; n++) rounded(group, [.035, .1, 2.35], [side * 3.7 - 2 + n, 0, 0], materials.shell);
    }
    sphere(group, .65, [0, 1.2, 0], materials.dark); group.scale.setScalar(1.5); scene.add(group); satellites.push(group); targets.push(group);
  }
  for (let i = 0; i < (compact ? 1 : 2); i++) {
    const group = new THREE.Group(); group.userData = { kind: 'aircraft', activation: -100 };
    const hull = sphere(group, 1, [0, 0, 0], materials.shell); hull.scale.set(1.4, .7, 4.6);
    const cockpit = sphere(group, 1, [0, .5, 1.8], materials.glass); cockpit.scale.set(.85, .45, 1.6);
    for (const side of [-1, 1]) {
      const wing = rounded(group, [5.7, .16, 1.8], [side * 3.3, 0, -.8], materials.shell); wing.rotation.y = side * .34; wing.userData.hardwareProfile = 'wing';
      rounded(group, [.6, .4, 1.8], [side * 1.3, -.3, -3.5], materials.dark);
      rounded(group, [.4, .18, .12], [side * 1.3, -.3, -4.42], materials.light);
    }
    scene.add(group); craft.push(group); targets.push(group);
  }
  return { targets, update(time, daylight) {
    starfield.update(time);
    stars.material.opacity = .85 * (1 - daylight * .94);
    satellites.forEach((group, i) => { const a = time * .018 + i * 2.1; group.position.set(Math.sin(a) * 155, 55 + Math.cos(a) * 8, -210 + i * 25); group.rotation.set(.3, a + Math.max(0, 1 - (time - group.userData.activation) / 3) * .5, .2); });
    craft.forEach((group, i) => { const a = time * .045 + i * Math.PI, response = Math.max(0, 1 - (time - group.userData.activation) / 4); group.position.set(Math.cos(a) * 100, 32 + i * 12 + response * 5, -100 + Math.sin(a) * 36); group.rotation.set(0, Math.atan2(-100 * Math.sin(a), 36 * Math.cos(a)), -.16 - response * .25); });
  } };
}