import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import hardwareAtlas from '@/components/suite/hardwareAtlas';

export default function hardwareKit() {
  const maps = new Map(), plane = new THREE.PlaneGeometry(1, 1), box = new RoundedBoxGeometry(1, 1, 1, 2, .045);
  const frame = new THREE.MeshStandardMaterial({ color: '#a8b8bf', metalness: .85, roughness: .28 });
  const dark = new THREE.MeshStandardMaterial({ color: '#0d1922', metalness: .65, roughness: .4 });
  const material = label => {
    if (!maps.has(label)) {
      const map = hardwareAtlas(label);
      maps.set(label, new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: .32, metalness: .12, roughness: .62 }));
    }
    return maps.get(label);
  };
  const block = (parent, size, position, mat = frame) => {
    const mesh = new THREE.Mesh(box, mat); mesh.scale.set(...size); mesh.position.set(...position); parent.add(mesh); return mesh;
  };
  const panel = (parent, width, height, position, rotation, label) => {
    const group = new THREE.Group(), depth = Math.min(width, height) * .035;
    group.position.set(...position); group.rotation.set(...rotation); parent.add(group);
    block(group, [width, height, depth], [0, 0, 0]);
    const face = new THREE.Mesh(plane, material(label)); face.scale.set(width * .96, height * .96, 1); face.position.z = depth * .52 + .002; group.add(face);
    for (const y of [-.28, .28]) block(group, [width * .045, height * .12, depth * .6], [-width * .46, y * height, depth * .7]);
    block(group, [width * .03, height * .15, depth], [width * .36, 0, depth * .8], dark);
    return group;
  };
  const vent = (parent, width, height, position, rotation) => {
    const group = new THREE.Group(); group.position.set(...position); group.rotation.set(...rotation); parent.add(group);
    block(group, [width, height, width * .025], [0, 0, 0], dark);
    const slots = new THREE.InstancedMesh(box, frame, 7), dummy = new THREE.Object3D(); group.add(slots);
    for (let i = 0; i < 7; i++) { dummy.position.set(0, (i - 3) * height / 8, width * .018); dummy.rotation.x = -.35; dummy.scale.set(width * .85, height * .045, width * .035); dummy.updateMatrix(); slots.setMatrixAt(i, dummy.matrix); }
    slots.instanceMatrix.needsUpdate = true;
  };
  return { panel, vent, block, material, frame, dark };
}