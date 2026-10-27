import * as THREE from 'three';
import { instances, matrix } from '@/components/suite/expansion/sectorPrimitives';
import { MATCH_COLORS } from '@/components/suite/expansion/kineticMatchSession';

export default function kineticDebris(root) {
  const count = 10;
  const bodies = instances(root, new THREE.OctahedronGeometry(3.5), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, fog: false }), count);
  const wings = instances(root, new THREE.BoxGeometry(12, .7, 3), new THREE.MeshStandardMaterial({ color: '#b5cbd5', metalness: .6, roughness: .3 }), count);
  const rings = instances(root, new THREE.TorusGeometry(6.2, .35, 6, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, fog: false }), count);
  const color = new THREE.Color();
  const targets = Array.from({ length: count }, () => ({ position: new THREE.Vector3(), active: true, matched: false, selected: false, colorIndex: 0, radius: 6 }));
  const update = time => {
    targets.forEach((target, i) => {
      target.position.set((i % 5 - 2) * 35 + Math.sin(time * .35 + i * 1.7) * 12, 56 + Math.floor(i / 5) * 34 + Math.sin(time * .45 + i) * 11, -145 - (i % 3) * 12);
      const size = target.matched ? 0 : target.selected ? 1.2 : 1, scale = [size, size, size];
      color.set(MATCH_COLORS[target.colorIndex].hex); bodies.setColorAt(i, color);
      rings.setColorAt(i, target.selected ? color.set('#ffffff') : color);
      matrix(bodies, i, target.position.toArray(), scale, [time * .3, time * .4, 0]);
      matrix(wings, i, target.position.toArray(), scale);
      matrix(rings, i, target.position.toArray(), scale);
    }); bodies.instanceMatrix.needsUpdate = wings.instanceMatrix.needsUpdate = rings.instanceMatrix.needsUpdate = true;
    bodies.instanceColor.needsUpdate = rings.instanceColor.needsUpdate = true;
  };
  return { targets, update };
}