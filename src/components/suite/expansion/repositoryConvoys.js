import * as THREE from 'three';
import { instances, matrix, steel, teal, random } from '@/components/suite/expansion/sectorPrimitives';
import provingGroundEvents from '@/components/suite/expansion/provingGroundEvents';

export default function repositoryConvoys(scene, floor, reduced) {
  const count = 6, bodies = instances(scene, new THREE.BoxGeometry(10, 7, 19), steel(), count);
  const lights = instances(scene, new THREE.BoxGeometry(10.2, .25, 17), teal(), count);
  const canisters = instances(scene, new THREE.CylinderGeometry(1.2, 1.2, 5, 8), steel(), count * 4);
  const red = new THREE.MeshStandardMaterial({ color: '#ff0033', emissive: '#ff0033', emissiveIntensity: 2.8, roughness: .3 });
  const sentinel = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 22), red);
  sentinel.name = 'mesh_crimson_sentinel'; sentinel.visible = false; sentinel.userData = { kind: 'crimson', activation: -100 }; scene.add(sentinel);
  let emergence = '', claimed = '';
  sentinel.userData.onActivate = () => { if (!sentinel.visible || claimed === emergence) return; claimed = emergence; provingGroundEvents('PROVING_GROUND_CRIMSON_TRIGGER', {}); };
  const rarity = (cycle, index) => {
    const rng = random((Math.imul(cycle, 2654435761) ^ Math.imul(index + 1, 2246822519)) >>> 0);
    // Rejection sampling avoids modulo bias for a one-in-one-million roll.
    let value; do { value = Math.floor(rng() * 4294967296); } while (value >= 4294000000);
    return value % 1000000 === 0;
  };
  return { target: sentinel, update(timestamp) {
    const travel = timestamp / 1000 * 4, length = 340; sentinel.visible = false;
    for (let i = 0; i < count; i++) {
      const offset = travel + i * length / count, cycle = Math.floor(offset / length), z = -650 + offset % length;
      const inbound = i % 2 === 1, actualZ = inbound ? -960 - z : z, x = inbound ? -438 : -420;
      const rare = !inbound && actualZ >= -380 && rarity(cycle, i);
      matrix(bodies, i, [x, floor + 5, actualZ], rare ? [0, 0, 0] : [1, 1, 1]);
      matrix(lights, i, [x, floor + 6, actualZ], rare ? [0, 0, 0] : [1, 1, 1]);
      for (let j = 0; j < 4; j++) matrix(canisters, i * 4 + j, [x + (j % 2 ? 2 : -2), floor + 11, actualZ + (j < 2 ? -4 : 4)], rare ? [0, 0, 0] : [1, 1, 1]);
      if (rare) { sentinel.visible = true; sentinel.position.set(x, floor + 5, actualZ); emergence = `${cycle}:${i}`; }
    }
    bodies.instanceMatrix.needsUpdate = lights.instanceMatrix.needsUpdate = canisters.instanceMatrix.needsUpdate = true;
    // A low-contrast 4Hz heartbeat, never an on/off strobe.
    red.emissiveIntensity = reduced ? 2.8 : 2.8 + .08 * Math.sin(timestamp / 1000 * Math.PI * 8);
    return sentinel.visible;
  } };
}