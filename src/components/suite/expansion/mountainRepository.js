import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, part, instances, matrix, steel, teal, random } from '@/components/suite/expansion/sectorPrimitives';
import repositoryConvoys from '@/components/suite/expansion/repositoryConvoys';

export default function mountainRepository(scene, reduced) {
  const root = new THREE.Group(); root.name = 'Northwest geological repository'; scene.add(root);
  const floor = heightAt(-420, -380) + 9, dark = steel(), light = teal(), rng = random(81826);
  const cliffs = instances(root, new THREE.CylinderGeometry(15, 32, 1, 6, 1), new THREE.MeshStandardMaterial({ color: '#121922', roughness: .95 }), 38);
  for (let i = 0; i < 38; i++) { const x = -365 - rng() * 325, z = -435 - rng() * 200, h = 45 + rng() * 100; matrix(cliffs, i, [x, heightAt(x, z) + h / 2, z], [1 + rng(), h, 1 + rng()]); } cliffs.instanceMatrix.needsUpdate = true;
  box(root, [96, 4, 320], [-429, floor - 2, -470], new THREE.MeshStandardMaterial({ color: '#3c4448', roughness: .92 }));
  const portal = new THREE.Group(); portal.position.set(-429, floor + 28, -380); root.add(portal);
  const frame = part(portal, new THREE.TorusGeometry(30, 4, 5, 6), dark); frame.rotation.z = Math.PI / 6;
  part(portal, new THREE.CircleGeometry(28, 6), new THREE.MeshBasicMaterial({ color: '#010407' }), [0, 0, -3]);
  const amber = new THREE.MeshStandardMaterial({ color: '#e0a754', emissive: '#e0a754', emissiveIntensity: 1.5 });
  for (let i = 0; i < 5; i++) { const ring = part(portal, new THREE.TorusGeometry(26 - i * 1.2, .3, 4, 6), amber, [0, 0, -1 - i * .3]); ring.rotation.z = Math.PI / 6; }
  const doors = []; let openUntil = 0;
  for (const side of [-1, 1]) { const door = box(portal, [12, 44, 4], [side * 23, -2, 2], dark); door.rotation.y = side * .15; doors.push({ door, side }); box(portal, [.25, 35, .3], [side * 17, -1, 4.1], amber); }
  for (const x of [-444, -432, -426, -414]) box(root, [.3, .25, 340], [x, floor + .2, -480], light);
  const target = new THREE.Group(); target.position.set(-429, floor, -380); target.userData = { kind: 'repository', inspectionDistance: 110, inspectionAimHeight: 26 }; scene.add(target);
  target.userData.onActivate = () => { openUntil = Date.now() + 6000; };
  const convoys = repositoryConvoys(scene, floor, reduced);
  return { targets: [target, convoys.target], update(timestamp) { doors.forEach(({ door, side }) => { const goal = side * (timestamp < openUntil ? 32 : 23); door.position.x += (goal - door.position.x) * .04; }); return { crimson: convoys.update(timestamp), doorsOpen: timestamp < openUntil }; } };
}