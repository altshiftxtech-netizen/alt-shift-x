import * as THREE from 'three';
import { rounded, sphere } from '@/components/suite/sleekParts';
import { moveOnRoute } from '@/components/suite/desertTraffic';

export default function desertRovers(scene, routes, materials, compact) {
  const targets = [], fleet = [];
  const lanes = compact ? [0, 2, 4, 1, 3, 5] : [0, 2, 4, 6, 1, 3, 5, 1, 3, 5];
  lanes.forEach((lane, i) => {
    const hover = lane % 2 === 1, group = new THREE.Group(), wheels = [];
    group.userData = { kind: hover ? 'transport' : 'rover', activation: -100 };
    rounded(group, [3.1, .85, 5.1], [0, 1.25, 0], materials.shell);
    rounded(group, [2.45, 1.1, 2.9], [0, 2.1, .2], materials.dark);
    rounded(group, [2.25, .72, 1.9], [0, 2.35, .65], materials.glass);
    rounded(group, [2.65, .09, .12], [0, 1.5, 2.55], materials.light);
    rounded(group, [2.4, .08, .12], [0, 1.48, -2.55], materials.light);
    sphere(group, .22, [0, 2.9, -.65], materials.dark);
    for (const x of [-1, 1]) for (const z of [-1.65, 0, 1.65]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, .48, 32), materials.dark);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(x * 1.66, .8, z); wheel.castShadow = true; group.add(wheel); wheels.push(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .5, 24), materials.shell);
      wheel.add(hub);
    }
    if (hover) group.scale.setScalar(.72);
    const route = routes[lane], length = route.getLength();
    const phase = hover ? (.48 + (i % 3) * .07 + (i > 6 ? .35 : 0)) % 1 : .52 + i * .025;
    fleet.push({ group, route, length, distance: phase * length, cruise: hover ? 5 : 2.4, clearance: .12, wheels });
    group.traverse(mesh => { if (mesh.isMesh) mesh.onAfterRender = () => { group.userData.rendered = true; }; });
    scene.add(group); targets.push(group);
  });
  return { targets, update(time, dt) { fleet.forEach(item => moveOnRoute(item, time, dt)); } };
}