import * as THREE from 'three';
import { instances, matrix } from '@/components/suite/expansion/sectorPrimitives';

export default function kineticDebris(root) {
  const count = 10;
  const bodies = instances(root, new THREE.OctahedronGeometry(3.5), new THREE.MeshBasicMaterial({ color: '#ffc064', toneMapped: false }), count);
  const wings = instances(root, new THREE.BoxGeometry(12, .7, 3), new THREE.MeshStandardMaterial({ color: '#b5cbd5', metalness: .6, roughness: .3 }), count);
  const rings = instances(root, new THREE.TorusGeometry(6.2, .22, 6, 32), new THREE.MeshBasicMaterial({ color: '#ffc064', toneMapped: false, transparent: true, opacity: .65 }), count);
  const targets = Array.from({ length: count }, () => ({ position: new THREE.Vector3(), hit: false, active: true, respawnAt: 0, radius: 5 }));
  const update = time => {
    targets.forEach((target, i) => {
      if (target.hit && performance.now() >= target.respawnAt) target.hit = false;
      target.position.set((i % 5 - 2) * 35 + Math.sin(time * .35 + i * 1.7) * 12, 56 + Math.floor(i / 5) * 34 + Math.sin(time * .45 + i) * 11, -145 - (i % 3) * 12);
      target.active = !target.hit; const scale = target.active ? [1, 1, 1] : [0, 0, 0];
      matrix(bodies, i, target.position.toArray(), scale, [time * .3, time * .4, 0]);
      matrix(wings, i, target.position.toArray(), scale);
      matrix(rings, i, target.position.toArray(), scale);
    }); bodies.instanceMatrix.needsUpdate = wings.instanceMatrix.needsUpdate = rings.instanceMatrix.needsUpdate = true;
  };
  return { targets, update };
}