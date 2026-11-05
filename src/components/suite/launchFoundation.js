import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function launchFoundation(root, material) {
  const count = 64, positions = new Float32Array((count + 1) * 6), indices = [];
  for (let i = 0; i < count; i++) { const n = i * 2; indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setIndex(indices);
  const foundation = new THREE.Mesh(geometry, material); foundation.receiveShadow = true; foundation.castShadow = true; root.add(foundation);
  const apron = new THREE.Mesh(new THREE.CylinderGeometry(6.3, 6.3, .3, count), material); apron.position.y = -.425; apron.receiveShadow = true; root.add(apron);
  return (x, z) => {
    let ground = -Infinity;
    for (const radius of [0, 3, 6, 9, 11]) for (let i = 0; i < count; i++) { const a = i / count * Math.PI * 2; ground = Math.max(ground, heightAt(x + Math.cos(a) * radius, z + Math.sin(a) * radius)); }
    root.position.set(x, ground + .6, z); root.rotation.set(0, 0, 0);
    for (let i = 0; i <= count; i++) {
      const a = i / count * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      positions.set([c * 6.3, -.575, s * 6.3, c * 11, heightAt(x + c * 11, z + s * 11) - root.position.y - .4, s * 11], i * 6);
    }
    geometry.attributes.position.needsUpdate = true; geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  };
}