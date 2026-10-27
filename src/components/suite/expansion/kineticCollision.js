import * as THREE from 'three';

export default function kineticCollision(shotStart, shotEnd, targetStart, targetEnd, radius = .2) {
  // Continuous relative swept-sphere test: fast slugs cannot tunnel between frames.
  const a = new THREE.Vector3().subVectors(shotStart, targetStart);
  const b = new THREE.Vector3().subVectors(shotEnd, targetEnd);
  const delta = b.clone().sub(a), denominator = delta.lengthSq();
  const t = denominator ? THREE.MathUtils.clamp(-a.dot(delta) / denominator, 0, 1) : 0;
  return a.addScaledVector(delta, t).lengthSq() <= radius * radius;
}