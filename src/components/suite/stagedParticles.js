import * as THREE from 'three';

export default function stagedParticles(scene, count, material, positionAt) {
  let populated = Math.min(5000, Math.ceil(count / 10));
  let positions = new Float32Array(populated * 3);
  for (let i = 0; i < populated; i++) positions.set(positionAt(i), i * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return {
    points,
    update(visibleSeconds) {
      if (visibleSeconds < 1 || populated === count) return;
      const nextCount = Math.min(count, populated + 5000);
      const expanded = new Float32Array(nextCount * 3);
      expanded.set(positions);
      for (let i = populated; i < nextCount; i++) expanded.set(positionAt(i), i * 3);
      // Dispose the previous GPU buffer before replacing its attribute.
      geometry.dispose();
      positions = expanded; populated = nextCount;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.computeBoundingSphere();
    },
  };
}