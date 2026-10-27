import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, part, steel, teal, label } from '@/components/suite/expansion/sectorPrimitives';

export default function kineticRangeAssets(scene) {
  const root = new THREE.Group(); root.position.set(0, heightAt(0, 480) + 6, 480); root.name = 'Inert spaceport test matrix'; scene.add(root);
  const dark = steel(), light = teal();
  box(root, [250, 3, 230], [0, -2, 0], new THREE.MeshStandardMaterial({ color: '#333d43', roughness: .88 }));
  const turntable = new THREE.Group(); root.add(turntable);
  part(turntable, new THREE.CylinderGeometry(13, 16, 3, 24), dark, [0, 1.5, 0]);
  const gimbal = new THREE.Group(); gimbal.position.y = 6; turntable.add(gimbal);
  for (const x of [-2, 2]) for (const y of [-2, 2]) {
    const barrel = box(gimbal, [2, 2, 20], [x, y, -8], dark); box(barrel, [.3, .4, 19], [0, 1.1, 0], light);
  }
  const domes = [], rings = [];
  const hologram = new THREE.MeshBasicMaterial({ color: '#39dbe5', transparent: true, opacity: .15, side: THREE.DoubleSide, depthWrite: false });
  for (const x of [-80, 80]) {
    part(root, new THREE.CylinderGeometry(12, 14, 5, 16), dark, [x, 1, -20]);
    const dome = part(root, new THREE.IcosahedronGeometry(13, 1), new THREE.MeshStandardMaterial({ color: '#7d939a', roughness: .6, wireframe: true }), [x, 11, -20]); domes.push(dome);
    for (let i = 0; i < 3; i++) { const ring = part(root, new THREE.RingGeometry(10 + i * 5, 10.3 + i * 5, 48), hologram, [x, 28 + i * 13, -20]); ring.rotation.x = -Math.PI / 2; rings.push(ring); }
    for (let i = 0; i < 3; i++) part(root, new THREE.CylinderGeometry(6, 6, 2, 12), dark, [x, 1, 35 + i * 20]);
  }
  const sign = label(root, 105, 26); sign.sprite.position.set(0, 100, -95);
  const decal = label(root, 135, 28); decal.set('SPACEPORT DEBRIS MITIGATION\n& KINETIC TEST MATRIX\n100% INERT · NON-VIOLENT TELEMETRY');
  const markings = new THREE.Mesh(new THREE.PlaneGeometry(150, 32), new THREE.MeshBasicMaterial({ map: decal.sprite.material.map, transparent: true, toneMapped: false }));
  markings.rotation.x = -Math.PI / 2; markings.position.set(0, .05, 65); root.add(markings); root.remove(decal.sprite); decal.sprite.material.dispose();
  const reticle = part(root, new THREE.TorusGeometry(2.8, .12, 4, 40), light, [0, 75, -70]);
  reticle.name = 'Lead reticle'; reticle.visible = false;
  const target = new THREE.Group(); target.position.copy(root.position); target.userData = { kind: 'kinetic', inspectionDistance: 155, inspectionAimHeight: 45, inspectionDirection: [0, .55, 1.35] }; scene.add(target);
  return { root, target, sign, reticle, turntable, gimbal, update(time, inspected) { domes.forEach(d => d.rotation.y = time * .25); rings.forEach((r, i) => r.scale.setScalar(1 + Math.sin(time * .7 - i) * .08)); sign.sprite.visible = inspected; } };
}