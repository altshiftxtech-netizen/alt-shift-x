import * as THREE from 'three';
import { instances, matrix } from '@/components/suite/expansion/sectorPrimitives';
import kineticCollision from '@/components/suite/expansion/kineticCollision';

export default function kineticShots(root, onHit, onMiss, reduced) {
  const bullets = instances(root, new THREE.SphereGeometry(.18, 6, 4), new THREE.MeshBasicMaterial({ color: '#b4faff' }), 12);
  const rings = instances(root, new THREE.RingGeometry(.9, 1, 32), new THREE.MeshBasicMaterial({ color: '#5ed9ed', transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false }), 12);
  const shots = Array.from({ length: 12 }, () => ({ active: false, age: 0, position: new THREE.Vector3(), velocity: new THREE.Vector3() }));
  const puffs = Array.from({ length: 12 }, () => ({ age: 9, position: new THREE.Vector3() })); let puffIndex = 0;
  shots.forEach((_, i) => { matrix(bullets, i, [0, 0, 0], [0, 0, 0]); matrix(rings, i, [0, 0, 0], [0, 0, 0]); });
  return {
    fire(point) {
      const shot = shots.find(s => !s.active); if (!shot) return false;
      shot.position.set(0, 6, -18); shot.velocity.copy(point).sub(shot.position).normalize().multiplyScalar(230); shot.age = 0; shot.active = true; return true;
    },
    update(dt, targets) {
      shots.forEach((shot, i) => {
        if (shot.active) {
          const previous = shot.position.clone(); shot.position.addScaledVector(shot.velocity, dt); shot.age += dt;
          const hit = targets.find(t => t.active && kineticCollision(previous, shot.position, t.previous, t.position, .2));
          if (hit) { hit.hit = true; hit.active = false; shot.active = false; const puff = puffs[puffIndex++ % puffs.length]; puff.position.copy(hit.position); puff.age = 0; onHit(); }
          else if (shot.age > 2 || shot.position.y < 0) { shot.active = false; onMiss(); }
        }
        matrix(bullets, i, shot.position.toArray(), shot.active ? [1, 1, 1] : [0, 0, 0]);
      });
      puffs.forEach((puff, i) => { puff.age += dt; const active = puff.age < 1.4, size = reduced ? 3 : 1 + puff.age * 7; matrix(rings, i, puff.position.toArray(), active ? [size, size, size] : [0, 0, 0]); });
      bullets.instanceMatrix.needsUpdate = rings.instanceMatrix.needsUpdate = true;
    },
  };
}