import * as THREE from 'three';
import { random } from '@/components/suite/expansion/sectorPrimitives';
import { palette } from '@/components/suite/sleekParts';
import repositoryTruck from '@/components/suite/expansion/repositoryTruck';
import provingGroundEvents from '@/components/suite/expansion/provingGroundEvents';

export default function repositoryConvoys(scene, floor, reduced, road) {
  const count = 6, materials = palette(), fleet = Array.from({ length: count }, (_, i) => repositoryTruck(materials, i % 2 === 1));
  fleet.forEach(({ truck }) => scene.add(truck));
  const red = new THREE.MeshStandardMaterial({ color: '#ff0033', emissive: '#ff0033', emissiveIntensity: 2.8, roughness: .3 });
  const sentinelVehicle = repositoryTruck({ ...materials, shell: red, light: red }, false), sentinel = sentinelVehicle.truck;
  sentinel.name = 'mesh_crimson_sentinel'; sentinel.visible = false; sentinel.userData = { kind: 'crimson', activation: -100 }; scene.add(sentinel);
  let emergence = '', claimed = '', lastTimestamp = 0, nearDoor = false;
  sentinel.userData.onActivate = () => { if (!sentinel.visible || claimed === emergence) return; claimed = emergence; provingGroundEvents('PROVING_GROUND_CRIMSON_TRIGGER', {}); };
  const rarity = (cycle, index) => {
    const rng = random((Math.imul(cycle, 2654435761) ^ Math.imul(index + 1, 2246822519)) >>> 0);
    // Rejection sampling avoids modulo bias for a one-in-one-million roll.
    let value; do { value = Math.floor(rng() * 4294967296); } while (value >= 4294000000);
    return value % 1000000 === 0;
  };
  return { target: sentinel, targets: fleet.map(({ truck }) => truck), get nearDoor() { return nearDoor; }, update(timestamp) {
    const travel = timestamp / 1000 * 4, length = road.length, distance = lastTimestamp ? (timestamp - lastTimestamp) / 1000 * 4 : 0;
    lastTimestamp = timestamp; sentinel.visible = false; nearDoor = false;
    for (let i = 0; i < count; i++) {
      const offset = travel + i * length / count, cycle = Math.floor(offset / length), progress = (offset % length) / length;
      const inbound = i % 2 === 1, t = inbound ? 1 - progress : progress;
      const position = road.sample(t, inbound ? -9 : 9), tangent = road.tangent(t);
      const heading = Math.atan2(tangent.x, tangent.z) + (inbound ? Math.PI : 0);
      const rare = !inbound && position.z >= -380 && rarity(cycle, i);
      const vehicle = fleet[i]; vehicle.truck.position.copy(position); vehicle.truck.rotation.y = heading;
      vehicle.truck.visible = !rare; vehicle.update(inbound ? -distance : distance);
      nearDoor ||= Math.abs(position.z + 404) < 48 && Math.abs(position.x + 429) < 30;
      if (rare) { sentinel.visible = true; sentinel.position.copy(position); sentinel.rotation.y = heading; sentinelVehicle.update(distance); emergence = `${cycle}:${i}`; }
    }
    // A low-contrast 4Hz heartbeat, never an on/off strobe.
    red.emissiveIntensity = reduced ? 2.8 : 2.8 + .08 * Math.sin(timestamp / 1000 * Math.PI * 8);
    return sentinel.visible;
  } };
}