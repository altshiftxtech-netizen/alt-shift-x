import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { rounded, sphere } from '@/components/suite/sleekParts';

export default function desertDrones(scene, materials, compact) {
  const fleet = [], targets = [];
  const stations = [[-53, -62], [46, -113], [-32, 6], [70, -35], [-86, 26], [18, 48]];
  stations.slice(0, compact ? 3 : 6).forEach(([sx, sz], i) => {
    const group = new THREE.Group(), rotors = []; group.userData = { kind: 'drone', activation: -100 };
    rounded(group, [1.4, .65, 2.3], [0, 0, 0], materials.shell);
    sphere(group, .35, [0, -.35, .8], materials.glass);
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      const arm = rounded(group, [2.3, .16, .23], [x * 1.05, 0, z], materials.dark); arm.rotation.y = -x * z * .3;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.85, .085, 10, 32), materials.shell);
      ring.rotation.x = Math.PI / 2; ring.position.set(x * 1.9, .1, z * 1.35); group.add(ring);
      const rotor = new THREE.Group(); rotor.position.copy(ring.position); group.add(rotor);
      rounded(rotor, [1.55, .04, .12], [0, 0, 0], materials.dark); rotors.push(rotor);
      sphere(group, .08, [x * 1.9, -.1, z * 1.35], materials.light);
    }
    Object.assign(group.userData, { stationX: sx, stationZ: sz });
    scene.add(group); targets.push(group); fleet.push({ group, rotors, sx, sz, phase: i * 1.6 });
  });
  return { targets, update(time, dt) { fleet.forEach(({ group, rotors, sx, sz, phase }) => {
    const angle = time * .07 + phase, age = time - group.userData.activation;
    const response = age >= 0 && age < 4 ? Math.sin(age / 4 * Math.PI) ** 2 : 0;
    const x = sx + Math.cos(angle) * 9, z = sz + Math.sin(angle) * 7;
    const goal = group.userData.flightGoal;
    const destination = goal || new THREE.Vector3(x, heightAt(x, z) + 15 + response * 4 + Math.sin(time * .5 + phase) * .3, z);
    const dx = destination.x - group.position.x, dz = destination.z - group.position.z;
    if (!group.userData.positioned) { group.position.copy(destination); group.userData.positioned = true; }
    else group.position.lerp(destination, 1 - Math.exp(-dt * 2.5));
    group.rotation.set(goal ? THREE.MathUtils.clamp(dz * .025, -.3, .3) : .04 + response * .16, -angle, goal ? THREE.MathUtils.clamp(-dx * .025, -.35, .35) : -.07 + response * .2);
    rotors.forEach(rotor => { rotor.rotation.y += dt * 32; });
  }); } };
}