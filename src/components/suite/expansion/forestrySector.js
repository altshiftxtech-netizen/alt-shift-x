import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import forestryClock from '@/components/suite/expansion/forestryClock';
import forestryTrees from '@/components/suite/expansion/forestryTrees';
import forestryMachines from '@/components/suite/expansion/forestryMachines';
import forestryWorkers from '@/components/suite/expansion/forestryWorkers';

export default function forestrySector(scene, compact, reduced) {
  const root = new THREE.Group(); root.name = 'Northeast ecological forestry'; scene.add(root);
  const target = new THREE.Group(); target.position.set(400, heightAt(400, -350), -350); target.userData = { kind: 'forestry', inspectionDistance: 155, inspectionAimHeight: 15, inspectionDirection: [0, .6, 1.2] }; scene.add(target);

  const lines = [];
  for (let i = 0; i <= 15; i++) for (let j = 0; j < 60; j++) {
    const x = 250 + i * 20, z = -200 - j * 5;
    lines.push(x, heightAt(x, z) + .32, z, x, heightAt(x, z - 5) + .32, z - 5);
    lines.push(250 + j * 5, heightAt(250 + j * 5, -200 - i * 20) + .32, -200 - i * 20, 255 + j * 5, heightAt(255 + j * 5, -200 - i * 20) + .32, -200 - i * 20);
  }
  const grid = new THREE.BufferGeometry(); grid.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3)); root.add(new THREE.LineSegments(grid, new THREE.LineBasicMaterial({ color: '#14b8a6', transparent: true, opacity: .3 })));
  const rays = new THREE.Group(); root.add(rays); const glow = new THREE.MeshBasicMaterial({ color: '#ffe0a0', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 4; i++) { const ray = new THREE.Mesh(new THREE.PlaneGeometry(12, 180), glow); ray.position.set(280 + i * 66, 80, -380); ray.rotation.z = -.5; rays.add(ray); }
  const trees = forestryTrees(root, compact), machines = forestryMachines(root, compact), workers = forestryWorkers(root, compact);
  const fill = new THREE.PointLight('#cbe9df', 3500, 300, 2); fill.position.set(400, 75, -350); root.add(fill);
  return { target, targets: [target, ...machines.targets], update(time, timestamp) {
    const state = forestryClock(timestamp); trees(state, timestamp); machines(time, state); workers(time, state);
    glow.opacity = reduced ? 0 : Math.sin(Math.min(state.secondsIntoPhase / 12, 1) * Math.PI) * .09;
    return state;
  } };
}