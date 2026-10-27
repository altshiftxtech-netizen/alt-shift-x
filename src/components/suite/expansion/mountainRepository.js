import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, part, instances, matrix, teal, random } from '@/components/suite/expansion/sectorPrimitives';
import repositoryConvoys from '@/components/suite/expansion/repositoryConvoys';
import repositoryTunnel from '@/components/suite/expansion/repositoryTunnel';
import repositoryRoad from '@/components/suite/expansion/repositoryRoad';

export default function mountainRepository(scene, reduced) {
  const root = new THREE.Group(); root.name = 'Northwest geological repository'; scene.add(root);
  const floor = heightAt(-420, -380) + 9, light = teal(), rng = random(81826);
  const rock = new THREE.MeshStandardMaterial({ color: '#202a34', roughness: .95 });
  const cliffs = instances(root, new THREE.CylinderGeometry(15, 32, 1, 6, 1), rock, 38);
  for (let i = 0; i < 38; i++) {
    let x = -365 - rng() * 325;
    const z = -435 - rng() * 200, h = 45 + rng() * 100;
    if (Math.abs(x + 429) < 120) x = -429 + (x < -429 ? -1 : 1) * (125 + rng() * 80);
    matrix(cliffs, i, [x, heightAt(x, z) + h / 2, z], [1 + rng(), h, 1 + rng()]);
  }
  cliffs.instanceMatrix.needsUpdate = true;
  const mass = new THREE.DodecahedronGeometry(1, 1);
  for (const side of [-1, 1]) { const flank = part(root, mass, rock, [-429 + side * 99, floor + 55, -525]); flank.scale.set(65, 75, 155); flank.castShadow = true; flank.receiveShadow = true; }
  const crown = part(root, mass, rock, [-429, floor + 105, -535]); crown.scale.set(105, 55, 150); crown.castShadow = true;
  const road = repositoryRoad(root, floor, light);
  const tunnel = repositoryTunnel(root, floor);
  const target = new THREE.Group(); target.position.set(-429, floor, -380);
  target.userData = { kind: 'repository', inspectionDistance: 100, inspectionAimHeight: 22, inspectionDirection: [.32, .26, 1.35] }; scene.add(target);
  let openUntil = 0; target.userData.onActivate = () => { openUntil = Date.now() + 6000; };
  const convoys = repositoryConvoys(scene, floor, reduced, road);
  convoys.targets.forEach(truck => { truck.userData.onActivate = target.userData.onActivate; });
  return { targets: [target, ...convoys.targets, convoys.target], update(timestamp) {
    const crimson = convoys.update(timestamp), doorsOpen = timestamp < openUntil || convoys.nearDoor;
    tunnel.update(doorsOpen, timestamp); return { crimson, doorsOpen, roadLength: road.length, outboundLoaded: convoys.targets.filter((truck, i) => i % 2 === 0 && truck.getObjectByName('Repository cargo').visible).length };
  } };
}