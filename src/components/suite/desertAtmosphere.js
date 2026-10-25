import * as THREE from 'three';
import desertCelestialCycle from '@/components/suite/desertCelestialCycle';
import desertMoonTexture from '@/components/suite/desertMoonTexture';

export default function desertAtmosphere(scene) {
  // Clear air at device height: no additive dust veil over moving machinery.
  const lunarTexture = desertMoonTexture();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(23, 64, 48), new THREE.MeshStandardMaterial({ color: '#657582', map: lunarTexture, bumpMap: lunarTexture, bumpScale: .55, roughness: .96, envMapIntensity: .12 })); moon.position.set(103, 83, -220); scene.add(moon);
  const ring = new THREE.Mesh(new THREE.RingGeometry(28, 38, 128), new THREE.MeshBasicMaterial({ color: '#657582', transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })); ring.position.copy(moon.position); ring.rotation.set(.85, -.6, -.4); scene.add(ring);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#81909E').multiplyScalar(1.1) })); sun.position.set(-150, 18, -260); scene.add(sun);
  moon.name = 'local-time-moon'; sun.name = 'local-time-sun';
  const positions = [];
  for (let i = 0; i < 600; i++) {
    const azimuth = i * 2.39996323, elevation = .08 + (i + .5) / 600 * 1.42;
    positions.push(Math.cos(azimuth) * Math.cos(elevation) * 650, Math.sin(elevation) * 650, Math.sin(azimuth) * Math.cos(elevation) * 650);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: '#A7B7C7', size: 1.15, sizeAttenuation: false, transparent: true, opacity: .55, fog: false, depthWrite: false }));
  scene.add(stars);
  const update = time => {
    const cycle = desertCelestialCycle();
    for (const [body, position] of [[sun, cycle.sun], [moon, cycle.moon]]) {
      body.position.set(position.x, position.y, position.z);
      body.visible = position.visible;
    }
    ring.position.copy(moon.position); ring.visible = moon.visible;
    stars.material.opacity = .55 * (1 - cycle.daylight);
    return cycle;
  };
  update(0);
  return update;
}