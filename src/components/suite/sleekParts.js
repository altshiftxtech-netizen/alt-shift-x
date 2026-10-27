import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import hardwareSkin from '@/components/suite/hardwareSkin';

export function palette() {
  const skin = hardwareSkin();
  return {
    shell: new THREE.MeshStandardMaterial({ color: '#d2dbe1', metalness: .68, roughness: .28, map: skin, bumpMap: skin, bumpScale: .012 }),
    dark: new THREE.MeshStandardMaterial({ color: '#17232e', metalness: .55, roughness: .36 }),
    glass: new THREE.MeshStandardMaterial({ color: '#143b50', metalness: .85, roughness: .16 }),
    light: new THREE.MeshStandardMaterial({ color: '#75dce5', emissive: '#38b5ca', emissiveIntensity: .75, roughness: .3 }),
  };
}
export function rounded(parent, size, position, material) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, Math.min(...size) * .23), material);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function sphere(parent, radius, position, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 12), material);
  mesh.position.set(...position); mesh.castShadow = true; parent.add(mesh); return mesh;
}
export function disposeScene(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { materials.add(m); Object.values(m).forEach(value => { if (value?.isTexture) textures.add(value); }); }); });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
}