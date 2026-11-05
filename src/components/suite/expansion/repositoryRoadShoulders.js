import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function repositoryRoadShoulders(parent, sample, segments) {
  const material = new THREE.MeshStandardMaterial({ color: '#303e4d', roughness: 1, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    const positions = [], indices = [];
    for (let i = 0; i <= segments; i++) {
      const edge = sample(i / segments, side * 24), shoulder = sample(i / segments, side * 28), toe = sample(i / segments, side * 48);
      shoulder.y -= .35;
      toe.y = (Math.max(Math.abs(toe.x), Math.abs(toe.z)) > 1000 ? -9 : heightAt(toe.x, toe.z)) - .3;
      positions.push(...edge.toArray(), ...shoulder.toArray(), ...toe.toArray());
      if (i < segments) for (let j = 0; j < 2; j++) { const n = i * 3 + j; indices.push(n, n + 1, n + 3, n + 1, n + 4, n + 3); }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material); mesh.receiveShadow = true; parent.add(mesh);
  }
}