import * as THREE from 'three';
import { palette, rounded, sphere } from '@/components/suite/sleekParts';
import { part, instances, matrix } from '@/components/suite/expansion/sectorPrimitives';

export default function repositoryTruck(materials = palette(), loaded = true) {
  const truck = new THREE.Group(), sensors = new THREE.Group(), cargo = new THREE.Group();
  cargo.name = 'Repository cargo'; cargo.visible = loaded; truck.add(cargo);
  truck.name = 'Autonomous six-wheel barrel truck';
  truck.userData = { kind: 'repository', inspectionDistance: 22, inspectionAimHeight: 5, inspectionDirection: [.35, .42, 1.2] };
  rounded(truck, [8.4, 1.2, 19], [0, 2.8, 0], materials.shell);
  rounded(truck, [7.2, 1.2, 13], [0, 1.8, -1], materials.dark);
  rounded(truck, [7.6, 2.9, 5.3], [0, 4.7, 6.4], materials.shell);
  rounded(truck, [7.1, .75, .22], [0, 5.3, 9.08], materials.glass);
  rounded(truck, [7.7, .16, .2], [0, 3.9, 9.55], materials.light);
  rounded(truck, [7.7, .16, .2], [0, 3.5, -9.55], materials.light);
  rounded(truck, [8, .6, 10.5], [0, 3.6, -3.2], materials.dark);
  const tires = instances(truck, new THREE.CylinderGeometry(1.45, 1.45, .9, 24), materials.dark, 6);
  const hubs = instances(truck, new THREE.CylinderGeometry(.7, .7, .96, 16), materials.shell, 6);
  let wheelIndex = 0;
  for (const x of [-4.5, 4.5]) for (const z of [-6.5, -.5, 6.4]) { matrix(tires, wheelIndex, [x, 1.45, z], [1, 1, 1], [0, 0, Math.PI / 2]); matrix(hubs, wheelIndex++, [x, 1.45, z], [1, 1, 1], [0, 0, Math.PI / 2]); }
  tires.instanceMatrix.needsUpdate = hubs.instanceMatrix.needsUpdate = true;
  const drum = new THREE.MeshStandardMaterial({ color: '#a67c43', metalness: .6, roughness: .38 });
  const barrels = instances(cargo, new THREE.CylinderGeometry(1.3, 1.3, 4.8, 20), drum, 6);
  const hoops = instances(cargo, new THREE.TorusGeometry(1.32, .09, 5, 20), materials.shell, 12);
  const lids = instances(cargo, new THREE.CylinderGeometry(1.22, 1.22, .12, 20), materials.dark, 6);
  barrels.name = 'Secured cargo barrels'; let barrelIndex = 0;
  for (const x of [-1.9, 1.9]) for (const z of [-6.6, -3.3, 0]) {
    matrix(barrels, barrelIndex, [x, 6.3, z]); matrix(lids, barrelIndex, [x, 8.73, z]);
    for (const [j, y] of [-1.65, 1.65].entries()) matrix(hoops, barrelIndex * 2 + j, [x, 6.3 + y, z], [1, 1, 1], [Math.PI / 2, 0, 0]); barrelIndex++;
  }
  barrels.instanceMatrix.needsUpdate = hoops.instanceMatrix.needsUpdate = lids.instanceMatrix.needsUpdate = true;
  for (const x of [-3.9, 3.9]) rounded(truck, [.2, 1.1, 10.6], [x, 4.4, -3.2], materials.shell);
  sensors.name = 'Roof lidar and stereo navigation cameras'; truck.add(sensors);
  part(sensors, new THREE.CylinderGeometry(.22, .22, 1.2, 12), materials.dark, [0, 6.7, 6.4]);
  const lidar = part(sensors, new THREE.CylinderGeometry(.82, .82, .48, 20), materials.glass, [0, 7.5, 6.4]);
  part(lidar, new THREE.CylinderGeometry(.84, .84, .08, 20), materials.light, [0, .18, 0]);
  for (const x of [-2.5, 2.5]) sphere(sensors, .28, [x, 5.75, 9.25], materials.light);
  truck.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  return { truck, update(distance) { lidar.rotation.y += distance * .15; } };
}