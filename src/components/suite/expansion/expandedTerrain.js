import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function expandedTerrain(scene, material, compact) {
  // Keep the original central mesh and every existing device coordinate unchanged.
  const n = compact ? 160 : 256, inner = 310, outer = 1000;
  const vertices = [], indices = [], colors = [], color = new THREE.Color();
  for (let side = 0; side < 4; side++) {
    const offset = vertices.length / 3;
    for (let row = 0; row <= 64; row++) {
      const radius = inner + (outer - inner) * row / 64;
      for (let j = 0; j <= n; j++) {
        const along = (j / n * 2 - 1) * radius;
        const x = side === 0 ? along : side === 1 ? radius : side === 2 ? -along : -radius;
        const z = side === 0 ? -radius : side === 1 ? along : side === 2 ? radius : -along;
        const y = heightAt(x, z); vertices.push(x, y, z);
        color.set('#141e29').lerp(new THREE.Color('#303e4d'), THREE.MathUtils.clamp((y + 5) / 23, 0, 1));
        color.multiplyScalar(.85 + .15 * Math.sin(x * 7 + z * 3)); colors.push(color.r, color.g, color.b);
        if (row < 64 && j < n) { const a = offset + row * (n + 1) + j, b = a + n + 1; indices.push(a, a + 1, b, b, a + 1, b + 1); }
      }
    }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  // Match the central plane's UV density, including at the shared boundary.
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(vertices.flatMap((_, i) => i % 3 ? [] : [(vertices[i] + 310) / 620, (310 - vertices[i + 2]) / 620]), 2));
  const extension = new THREE.Mesh(geometry, material); extension.receiveShadow = true; extension.name = 'Unoccupied sector terrain'; scene.add(extension);
  const horizon = new THREE.Mesh(new THREE.PlaneGeometry(200000, 200000), new THREE.MeshStandardMaterial({ color: '#18232e', roughness: 1 }));
  horizon.rotation.x = -Math.PI / 2; horizon.position.y = -9; horizon.name = 'Camera-following endless ground'; scene.add(horizon);
  return camera => { horizon.position.x = camera.position.x; horizon.position.z = camera.position.z; };
}