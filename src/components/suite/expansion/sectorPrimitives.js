import * as THREE from 'three';

export const steel = () => new THREE.MeshStandardMaterial({ color: '#121d24', metalness: .65, roughness: .4 });
export const teal = () => new THREE.MeshStandardMaterial({ color: '#14b8a6', emissive: '#14b8a6', emissiveIntensity: .8, roughness: .4 });
export function part(parent, geometry, material, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); parent.add(mesh); return mesh;
}
export function box(parent, dimensions, position, material) { return part(parent, new THREE.BoxGeometry(...dimensions), material, position); }
export function beam(parent, material, radius = .12) {
  const mesh = part(parent, new THREE.CylinderGeometry(radius, radius, 1, 5), material); return mesh;
}
export function connect(mesh, a, b) {
  mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.scale.y = a.distanceTo(b);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(b, a).normalize());
}
export function instances(parent, geometry, material, count) {
  const mesh = new THREE.InstancedMesh(geometry, material, count); mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; parent.add(mesh); return mesh;
}
export function matrix(mesh, index, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const o = new THREE.Object3D(); o.position.set(...position); o.scale.set(...scale); o.rotation.set(...rotation); o.updateMatrix(); mesh.setMatrixAt(index, o.matrix);
}
export function label(parent, width = 90, height = 18) {
  const canvas = document.createElement('canvas'); canvas.width = 1536; canvas.height = 320;
  const context = canvas.getContext('2d'), texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
  sprite.scale.set(width, height, 1); parent.add(sprite); let previous = '';
  return { sprite, set(text) {
    if (text === previous) return; previous = text;
    context.clearRect(0, 0, 1536, 320); context.fillStyle = 'rgba(4,12,18,.9)'; context.fillRect(0, 0, 1536, 320);
    context.strokeStyle = '#14b8a6'; context.lineWidth = 5; context.strokeRect(3, 3, 1530, 314);
    context.textAlign = 'center'; context.fillStyle = '#d4f9f4'; context.font = 'bold 42px monospace';
    text.split('\n').forEach((line, i) => context.fillText(line, 768, 76 + i * 65)); texture.needsUpdate = true;
  } };
}
export function random(seed) { let value = seed >>> 0; return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; }; }