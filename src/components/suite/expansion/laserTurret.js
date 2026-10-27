import * as THREE from 'three';
import { rounded, sphere } from '@/components/suite/sleekParts';
import { part } from '@/components/suite/expansion/sectorPrimitives';

export default function laserTurret(root, position, materials) {
  const base = new THREE.Group(); base.position.set(...position); root.add(base);
  part(base, new THREE.CylinderGeometry(8, 11, 3, 32), materials.dark, [0, 1.5, 0]);
  const swivel = new THREE.Group(); base.add(swivel);
  rounded(swivel, [12, 7, 12], [0, 5, 0], materials.shell);
  for (const side of [-1, 1]) rounded(swivel, [2, 10, 7], [side * 6, 9, 0], materials.dark);
  const head = new THREE.Group(); head.position.y = 12; head.userData.hardwareProfile = 'turret'; swivel.add(head);
  rounded(head, [10, 8, 12], [0, 0, 0], materials.shell);
  rounded(head, [7, 5, 13], [0, 0, -8], materials.shell);
  const lens = new THREE.MeshBasicMaterial({ color: '#73f5ff', toneMapped: false });
  const aperture = part(head, new THREE.CylinderGeometry(2.3, 2.3, .7, 32), materials.dark, [0, 0, -15]); aperture.rotation.x = Math.PI / 2;
  part(head, new THREE.CircleGeometry(1.7, 32), lens, [0, 0, -15.4]).rotation.y = Math.PI;
  part(head, new THREE.TorusGeometry(2.1, .18, 8, 40), lens, [0, 0, -15.5]);
  sphere(head, 3.5, [0, 6, 1], materials.shell);
  rounded(head, [4, 2, 1], [0, 6, -2.3], materials.glass);
  for (const side of [-1, 1]) rounded(head, [2, 3, 4], [side * 6, 1, -2], materials.dark);
  return { base, center: new THREE.Vector3(...position).add(new THREE.Vector3(0, 12, 0)), point(aim, active) {
    const d = aim.clone().sub(this.center).normalize(); swivel.rotation.y = Math.atan2(-d.x, -d.z); head.rotation.x = Math.asin(THREE.MathUtils.clamp(d.y, -.2, .9));
    lens.color.set(active ? '#73f5ff' : '#317d89');
  } };
}