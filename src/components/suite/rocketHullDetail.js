import * as THREE from 'three';
import hardwareKit from '@/components/suite/hardwareKit';

export default function rocketHullDetail(rocket) {
  const kit = hardwareKit(), details = new THREE.Group(); details.name = 'AltShiftX flight hardware and thermal protection'; rocket.add(details);
  const brand = kit.material('ASX-01 / FLIGHT SYSTEMS');
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(.792, .792, 1.25, 24, 1, true, angle - .69, 1.38), brand);
    hatch.position.y = 3.35; details.add(hatch);
    const pod = new THREE.Group(); pod.position.set(Math.sin(angle) * .77, 5.05, Math.cos(angle) * .77); pod.rotation.y = angle; details.add(pod);
    kit.block(pod, [.25, .47, .24], [0, 0, .08], kit.dark);
    const port = new THREE.Mesh(new THREE.CylinderGeometry(.09, .14, .18, 12), kit.frame); port.rotation.x = Math.PI / 2; port.position.z = .25; pod.add(port);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(.793, .793, .65, 20, 1, true, angle - .45, .9), kit.material('PROPULSION / SERVICE 02'));
    lower.position.y = 1.32; details.add(lower);
  }
  const points = [];
  for (let i = 0; i < 16; i++) { const angle = i * Math.PI / 8, x = Math.sin(angle) * .784, z = Math.cos(angle) * .784; points.push(x, .48, z, x, 5.45, z); }
  const seams = new THREE.BufferGeometry(); seams.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  details.add(new THREE.LineSegments(seams, new THREE.LineBasicMaterial({ color: '#40515d', transparent: true, opacity: .5 })));
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, .16, .055), kit.dark, 48), dummy = new THREE.Object3D(); details.add(tiles);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 16; i++) {
    const a = (i + (row % 2) * .5) * Math.PI / 8; dummy.position.set(Math.sin(a) * .792, .58 + row * .18, Math.cos(a) * .792); dummy.rotation.y = a; dummy.updateMatrix(); tiles.setMatrixAt(row * 16 + i, dummy.matrix);
  }
  tiles.instanceMatrix.needsUpdate = true;
  const bronze = new THREE.MeshStandardMaterial({ color: '#b18b51', metalness: .85, roughness: .31 });
  for (const [y, radius] of [[2.03, .787], [5.48, .787], [-.05, .41], [-.22, .46], [-.4, .51]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .018, 6, 48), bronze); ring.rotation.x = Math.PI / 2; ring.position.y = y; details.add(ring);
  }
}