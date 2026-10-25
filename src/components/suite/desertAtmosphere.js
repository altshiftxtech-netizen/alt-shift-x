import * as THREE from 'three';
import desertCelestialCycle from '@/components/suite/desertCelestialCycle';

export default function desertAtmosphere(scene) {
  // Clear air at device height: no additive dust veil over moving machinery.
  const moon = new THREE.Mesh(new THREE.SphereGeometry(23, 64, 48), new THREE.MeshStandardMaterial({ color: '#46535F', roughness: 1 })); moon.position.set(103, 83, -220); scene.add(moon);
  const ring = new THREE.Mesh(new THREE.RingGeometry(28, 38, 128), new THREE.MeshBasicMaterial({ color: '#657582', transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })); ring.position.copy(moon.position); ring.rotation.set(.85, -.6, -.4); scene.add(ring);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#81909E').multiplyScalar(1.1) })); sun.position.set(-150, 18, -260); scene.add(sun);
  moon.name = 'local-time-moon'; sun.name = 'local-time-sun';
  const update = time => {
    const cycle = desertCelestialCycle();
    for (const [body, position] of [[sun, cycle.sun], [moon, cycle.moon]]) {
      body.position.set(position.x, position.y, position.z);
      body.visible = position.visible;
    }
    ring.position.copy(moon.position); ring.visible = moon.visible;
    return cycle;
  };
  update(0);
  return update;
}