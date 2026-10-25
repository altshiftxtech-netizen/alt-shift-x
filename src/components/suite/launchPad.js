import * as THREE from 'three';
import { rounded, sphere } from '@/components/suite/sleekParts';

export default function launchPad(scene, materials) {
  const pad = new THREE.Group(), arms = [];
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(5.1, 5.7, .55, 64), materials.dark); deck.receiveShadow = true; pad.add(deck);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4, .055, 8, 96), materials.light); ring.rotation.x = Math.PI / 2; ring.position.y = .3; pad.add(ring);
  rounded(pad, [2.8, .035, .18], [0, .31, 0], materials.shell);
  for (const x of [-1.3, 1.3]) rounded(pad, [.18, .035, 2.3], [x, .31, 0], materials.shell);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sphere(pad, .09, [Math.cos(a) * 4.8, .4, Math.sin(a) * 4.8], materials.light); }
  for (const side of [-1, 1]) {
    const base = new THREE.Group(); base.position.set(side * 3.3, .4, -1.7); pad.add(base);
    rounded(base, [1.3, .7, 1.3], [0, 0, 0], materials.shell);
    const shoulder = new THREE.Group(); shoulder.position.y = .4; base.add(shoulder);
    sphere(shoulder, .3, [0, 0, 0], materials.dark);
    rounded(shoulder, [.35, 2.2, .4], [0, 1.05, 0], materials.shell);
    const elbow = new THREE.Group(); elbow.position.y = 2; shoulder.add(elbow);
    sphere(elbow, .26, [0, 0, 0], materials.dark);
    rounded(elbow, [.3, 1.8, .32], [0, .85, 0], materials.shell);
    for (const finger of [-1, 1]) rounded(elbow, [.12, .5, .12], [finger * .17, 1.8, 0], materials.dark);
    arms.push({ shoulder, elbow, side });
  }
  rounded(pad, [.7, 8, .7], [-3.8, 4, -2.8], materials.dark);
  for (let y = 1; y < 8; y++) rounded(pad, [.8, .08, .8], [-3.8, y, -2.8], materials.shell);
  scene.add(pad); return { pad, arms };
}