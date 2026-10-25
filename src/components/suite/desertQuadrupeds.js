import * as THREE from 'three';
import { rounded, sphere } from '@/components/suite/sleekParts';
import { groundPose, laneX } from '@/components/suite/desertTraffic';

export default function desertQuadrupeds(scene, materials, compact) {
  const pack = [], targets = [];
  for (let i = 0; i < (compact ? 2 : 4); i++) {
    const group = new THREE.Group(), legs = [];
    group.userData = { kind: 'quadruped', activation: -100 };
    rounded(group, [1.35, .65, 2.45], [0, 1.85, 0], materials.shell);
    rounded(group, [1.1, .38, .4], [0, 1.96, 1.3], materials.glass);
    rounded(group, [.7, .06, .08], [0, 2.05, 1.52], materials.light);
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(x * .72, 1.72, z * .85); group.add(hip);
      sphere(hip, .23, [0, 0, 0], materials.dark);
      rounded(hip, [.22, .8, .3], [0, -.36, 0], materials.shell);
      const knee = new THREE.Group(); knee.position.y = -.72; hip.add(knee);
      sphere(knee, .18, [0, 0, 0], materials.dark);
      rounded(knee, [.17, .85, .2], [0, -.42, 0], materials.dark);
      sphere(knee, .18, [0, -.85, 0], materials.dark);
      legs.push({ hip, knee, phase: x * z > 0 ? 0 : Math.PI });
    }
    group.scale.setScalar(1.4); scene.add(group); targets.push(group); pack.push({ group, legs, lane: i * 2, z: 40 - i * 48, phase: i });
  }
  return { targets, update(time) { pack.forEach(({ group, legs, lane, z: station, phase }) => {
    const age = time - group.userData.activation, greeting = age >= 0 && age < 3;
    const angle = time * .09 + phase, z = station + Math.sin(angle) * 6;
    const x = laneX(z, lane) + 10 + Math.cos(angle) * 2;
    groundPose(group, x, z, Math.atan2(-2 * Math.sin(angle), 6 * Math.cos(angle)), .12);
    legs.forEach(({ hip, knee, phase: gait }) => {
      const stride = greeting ? 0 : Math.sin(time * 3 + gait + phase) * .26;
      hip.rotation.x = stride; knee.rotation.x = -.15 - Math.max(0, stride) * .9;
    });
    if (greeting) { group.rotateX(-Math.sin(age / 3 * Math.PI) * .16); legs[0].hip.rotation.x = -.55 * Math.sin(age / 3 * Math.PI); }
  }); } };
}