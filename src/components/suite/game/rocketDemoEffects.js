import * as THREE from 'three';
export default function rocketDemoEffects(scene, target, reduced) {
  const count = reduced ? 48 : 220, positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: '#a8cfda', size: .65, transparent: true, opacity: .5, depthWrite: false });
  const plume = new THREE.Points(geometry, material); plume.visible = false; plume.frustumCulled = false; scene.add(plume);
  const shake = new THREE.Vector3(); let started = -Infinity;
  return {
    start(now) { started = now; },
    update(now, state) {
      const t = (now - started) / 1000;
      plume.visible = t >= 0 && t < 9;
      shake.set(0, 0, 0);
      if (!plume.visible) return shake;
      plume.position.copy(target.position);
      for (let i = 0; i < count; i++) {
        const life = (t * .65 + i / count) % 1, angle = i * 2.39996;
        const radius = .5 + life * (state.altitude < 3 ? 8 : 3);
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.max(.4, state.altitude + 1 - life * 18);
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      geometry.attributes.position.needsUpdate = true;
      material.opacity = Math.min(.5, (9 - t) * .2);
      if (!reduced && t < 4) { const strength = Math.sin(t / 4 * Math.PI) * .12; shake.set(Math.sin(t * 27) * strength, Math.sin(t * 33) * strength, 0); }
      return shake;
    },
  };
}