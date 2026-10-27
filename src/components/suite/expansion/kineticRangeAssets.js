import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, part, steel } from '@/components/suite/expansion/sectorPrimitives';
import { palette } from '@/components/suite/sleekParts';
import laserTurret from '@/components/suite/expansion/laserTurret';

export default function kineticRangeAssets(scene) {
  const root = new THREE.Group(); root.position.set(0, heightAt(0, 480) + 6, 480); root.name = 'Spaceport laser interception range'; scene.add(root);
  const dark = steel(), materials = palette();
  box(root, [250, 3, 230], [0, -2, 0], new THREE.MeshStandardMaterial({ color: '#333d43', roughness: .88 }));
  const turrets = [[-72, 0, 18], [0, 0, 48], [72, 0, 18], [0, 0, -48]].map(position => laserTurret(root, position, materials));
  for (const x of [-100, 100]) {
    part(root, new THREE.CylinderGeometry(9, 11, 4, 24), dark, [x, 1, -65]);
    part(root, new THREE.SphereGeometry(9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.shell, [x, 3, -65]);
  }
  const reticle = part(root, new THREE.TorusGeometry(2.3, .18, 6, 40), new THREE.MeshBasicMaterial({ color: '#73f5ff', toneMapped: false, depthTest: false, fog: false }), [0, 85, -145]); reticle.visible = false;
  const target = new THREE.Group(); target.position.copy(root.position); target.userData = { kind: 'kinetic', inspectionDistance: 155, inspectionAimHeight: 55, inspectionDirection: [0, .4, 1.4] }; scene.add(target);
  const targets = [target, ...turrets.map(turret => {
    const marker = new THREE.Group(); marker.position.copy(root.position).add(turret.base.position); marker.userData = { kind: 'kinetic', inspectionDistance: 90, inspectionAimHeight: 40, inspectionDirection: [0, .35, 1.6] }; scene.add(marker); return marker;
  })];
  const fill = new THREE.PointLight('#d2efff', 7000, 320, 2); fill.position.set(0, 75, 20); root.add(fill);
  return { root, target, targets, reticle, turrets };
}