import * as THREE from 'three';
import { rounded } from '@/components/suite/sleekParts';
import { box, part, steel } from '@/components/suite/expansion/sectorPrimitives';

function arch(outer, peak, inner, crown) {
  const s = new THREE.Shape();
  s.moveTo(-outer, 0); s.lineTo(-outer, 25); s.quadraticCurveTo(-outer, peak, 0, peak);
  s.quadraticCurveTo(outer, peak, outer, 25); s.lineTo(outer, 0); s.lineTo(inner, 0); s.lineTo(inner, 23);
  s.quadraticCurveTo(inner, crown, 0, crown); s.quadraticCurveTo(-inner, crown, -inner, 23); s.lineTo(-inner, 0); s.closePath();
  return s;
}
export default function repositoryTunnel(parent, floor) {
  const tunnel = new THREE.Group(); tunnel.position.set(-429, floor, -380); parent.add(tunnel); tunnel.name = 'Excavated repository tunnel';
  const lining = new THREE.MeshStandardMaterial({ color: '#48545d', roughness: .87, metalness: .12, emissive: '#18252f', emissiveIntensity: .3 });
  const dark = steel(), amber = new THREE.MeshBasicMaterial({ color: '#e0a754' }), white = new THREE.MeshBasicMaterial({ color: '#b5e0eb' });
  const shell = new THREE.ExtrudeGeometry(arch(33, 54, 26, 47), { depth: 270, bevelEnabled: false, curveSegments: 14 }); shell.translate(0, 0, -270);
  const vault = part(tunnel, shell, lining); vault.receiveShadow = true; vault.castShadow = true;
  const facade = new THREE.ExtrudeGeometry(arch(39, 62, 26, 47), { depth: 7, bevelEnabled: true, bevelThickness: .7, bevelSize: .7, bevelSegments: 2, curveSegments: 14 });
  facade.translate(0, 0, -7); part(tunnel, facade, lining).castShadow = true;
  const ribGeometry = new THREE.ExtrudeGeometry(arch(27, 48, 25.5, 46.5), { depth: .65, bevelEnabled: false, curveSegments: 12 });
  for (const z of [-8, -52, -98, -144, -190, -236]) {
    part(tunnel, ribGeometry, dark, [0, 0, z]);
    for (const x of [-24.8, 24.8]) { box(tunnel, [.28, 1, 14], [x, 16, z - 8], white); box(tunnel, [.3, .18, 32], [x, .25, z - 16], amber); }
    rounded(tunnel, [5, .3, 2], [0, 45.6, z - 10], white);
  }
  box(tunnel, [52, 44, 2], [0, 22, -269], new THREE.MeshStandardMaterial({ color: '#101820', roughness: .95 }));
  const doors = [];
  for (const side of [-1, 1]) {
    rounded(tunnel, [30, 49, 36], [side * 41, 24.5, -34], lining);
    const leaf = new THREE.Group(); leaf.position.set(side * 13, 22, -24); tunnel.add(leaf);
    rounded(leaf, [25.8, 43.5, 2.4], [0, 0, 0], dark);
    for (const y of [-15, -5, 5, 15]) rounded(leaf, [22, .3, .5], [0, y, 1.3], lining);
    rounded(leaf, [.28, 37, .3], [-side * 11.5, 0, 1.5], amber); doors.push({ leaf, side });
  }
  box(tunnel, [3, 2, 1], [-31, 9, 1], amber); box(tunnel, [3, 2, 1], [31, 9, 1], amber);
  let last = 0;
  return { get gap() { return Math.abs(doors[0].leaf.position.x) - 13; }, update(open, timestamp) { const blend = 1 - Math.exp(-Math.min(last ? (timestamp - last) / 1000 : .016, .1) * 4); last = timestamp; doors.forEach(({ leaf, side }) => { leaf.position.x += (side * (open ? 41 : 13) - leaf.position.x) * blend; }); } };
}