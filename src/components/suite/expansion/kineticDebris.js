import * as THREE from 'three';
import { instances, matrix } from '@/components/suite/expansion/sectorPrimitives';

export default function kineticDebris(root) {
  const glow = new THREE.MeshBasicMaterial({ color: '#66efff', toneMapped: false });
  const bodies = instances(root, new THREE.IcosahedronGeometry(.8, 0), glow, 4);
  const trails = instances(root, new THREE.CylinderGeometry(.12, .45, 1, 5), new THREE.MeshBasicMaterial({ color: '#3ebde5', transparent: true, opacity: .22, depthWrite: false }), 32);
  const targets = Array.from({ length: 4 }, (_, i) => ({ position: new THREE.Vector3(), previous: new THREE.Vector3(), velocity: new THREE.Vector3(i % 2 ? -12 : 12, -12, 0), hit: false, cycle: -1, active: true }));
  const update = time => {
    targets.forEach((t, i) => {
      const clock = time + i * 3.3, cycle = Math.floor(clock / 14), age = clock % 14;
      if (cycle !== t.cycle) { t.hit = false; t.cycle = cycle; }
      t.previous.copy(t.position); t.position.set((i % 2 ? 1 : -1) * 84 + t.velocity.x * age, 178 - 12 * age, -70);
      if (t.previous.lengthSq() === 0 || age < .1) t.previous.copy(t.position);
      t.active = !t.hit && t.position.y > 8;
      matrix(bodies, i, t.position.toArray(), t.active ? [1, 1, 1] : [0, 0, 0]);
      for (let j = 0; j < 8; j++) { const point = t.position.clone().addScaledVector(t.velocity, -.08 * (j + 1)); matrix(trails, i * 8 + j, point.toArray(), t.active ? [1, 1.6, 1] : [0, 0, 0], [0, 0, i % 2 ? -.7854 : .7854]); }
    }); bodies.instanceMatrix.needsUpdate = trails.instanceMatrix.needsUpdate = true;
  };
  return { targets, update };
}