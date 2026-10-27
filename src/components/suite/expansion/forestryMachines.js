import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, part, instances, matrix, steel, teal } from '@/components/suite/expansion/sectorPrimitives';
import forestryPlanter from '@/components/suite/expansion/forestryPlanter';

export default function forestryMachines(parent, compact) {
  const dark = steel(), light = teal(), planters = Array.from({ length: compact ? 2 : 3 }, (_, i) => forestryPlanter(parent, dark, light, i));
  const drones = [], tracked = [], dogs = [], beams = [];
  const cone = new THREE.MeshBasicMaterial({ color: '#dfa85c', transparent: true, opacity: .08, side: THREE.DoubleSide, depthWrite: false });
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group(); parent.add(g); box(g, [3, .7, 3], [0, 0, 0], dark); const rotors = [];
    for (const x of [-2.5, 2.5]) for (const z of [-2.5, 2.5]) { box(g, [.25, .25, 7], [x, 0, 0], dark); const rotor = box(g, [3, .08, .3], [x, .5, z], light); rotors.push(rotor); }
    drones.push({ g, rotors });
    const carrier = new THREE.Group(); parent.add(carrier); box(carrier, [7, 2, 10], [0, 2, 0], dark);
    for (const x of [-4, 4]) box(carrier, [1.5, 2, 12], [x, 1, 0], dark);
    const cutter = part(carrier, new THREE.CylinderGeometry(4, 4, .35, 12), light, [0, .8, 7]);
    const logs = instances(carrier, new THREE.CylinderGeometry(.8, .8, 10, 6), new THREE.MeshStandardMaterial({ color: '#6a4936', roughness: .9 }), 5);
    for (let j = 0; j < 5; j++) matrix(logs, j, [(j - 2) * 1.4, 4, 0], [1, 1, 1], [Math.PI / 2, 0, 0]); logs.instanceMatrix.needsUpdate = true;
    const laser = box(carrier, [.08, .08, 15], [0, 3, 10], light); beams.push(laser); tracked.push({ g: carrier, cutter, logs });
    const dog = new THREE.Group(); parent.add(dog); box(dog, [2, 1, 4], [0, 2.4, 0], dark); const legs = [];
    for (const x of [-1.2, 1.2]) for (const z of [-1.4, 1.4]) legs.push(box(dog, [.3, 2.1, .35], [x, 1.1, z], dark));
    box(dog, [1.4, .8, 1], [0, 2.7, 2.4], light);
    const scan = part(dog, new THREE.ConeGeometry(4, 12, 16, 1, true), cone, [0, 2, 8]); scan.rotation.x = Math.PI / 2; dogs.push({ g: dog, legs, scan });
  }
  const seeds = instances(parent, new THREE.IcosahedronGeometry(.13, 0), new THREE.MeshBasicMaterial({ color: '#7edfcc' }), 64);
  const targets = [...planters.map(update => update.target), ...drones.map(d => d.g), ...tracked.map(d => d.g), ...dogs.map(d => d.g)];
  targets.forEach(target => { target.userData = { kind: 'forestry', inspectionDistance: 22, inspectionAimHeight: 2 }; });
  const update = (time, state) => {
    planters.forEach(update => update(time, state.phase === 1)); seeds.visible = state.phase !== 3; seeds.material.color.set(state.phase === 1 ? '#7edfcc' : '#dfa85c');
    drones.forEach(({ g, rotors }, i) => { const x = 310 + i * 120 + Math.sin(time * .06) * 25, z = -340 + Math.cos(time * .04 + i) * 110; g.visible = state.phase === 1; g.position.set(x, heightAt(x, z) + 20 + Math.sin(time) * 2, z); rotors.forEach(r => r.rotation.y = time * 22); for (let j = 0; j < 32; j++) { const f = (time * .25 + j / 32) % 1; matrix(seeds, i * 32 + j, [x + Math.sin(j) * 2, g.position.y * (1 - f) + heightAt(x, z) * f, z + Math.cos(j) * 2]); } }); seeds.instanceMatrix.needsUpdate = true;
    tracked.forEach(({ g, cutter, logs }, i) => { const x = 320 + i * 100, z = -260 - (time * 1.1 + i * 60) % 180; g.visible = state.phase !== 1; g.position.set(x, heightAt(x, z), z); cutter.visible = state.phase === 2; cutter.rotation.y = time * 3; logs.visible = state.phase === 3; beams[i].visible = state.phase === 3 && Math.sin(time * .5) > 0; });
    dogs.forEach(({ g, legs, scan }, i) => { const x = 350 + i * 80, z = -310 + Math.sin(time * .06 + i) * 25; g.visible = state.phase === 2; g.position.set(x, heightAt(x, z), z); legs.forEach((leg, j) => leg.rotation.x = Math.sin(time * 3 + j % 2 * Math.PI) * .2); scan.rotation.z = Math.sin(time * .4) * .2; if (state.phase === 2) for (let j = 0; j < 32; j++) { const f = (time * .2 + j / 32) % 1, a = j * 2.4; matrix(seeds, i * 32 + j, [x + Math.sin(a) * f * 4, g.position.y + 2 + Math.cos(a) * f * 2, z + 3 + f * 12]); } }); seeds.instanceMatrix.needsUpdate = true;
  };
  update.targets = targets; return update;
}