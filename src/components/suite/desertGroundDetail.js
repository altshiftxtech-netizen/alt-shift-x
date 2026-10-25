import * as THREE from 'three';
import { laneX } from '@/components/suite/desertTraffic';

export default function desertGroundDetail(scene, heightAt, compact) {
  // One instanced draw keeps real foreground relief affordable across the full frame.
  const count = compact ? 900 : 2400;
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshStandardMaterial({ color: '#445361', roughness: .96, metalness: .08 });
  const stones = new THREE.InstancedMesh(geometry, material, count);
  const transform = new THREE.Object3D();
  const color = new THREE.Color();
  let seed = 1749;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < count; i++) {
    const x = (random() - .5) * 420, z = -210 + random() * 320;
    const inLane = Array.from({ length: 7 }, (_, lane) => Math.abs(x - laneX(z, lane))).some(distance => distance < 4);
    const size = inLane ? .015 : .12 + Math.pow(random(), 4) * 1.15;
    transform.position.set(x, heightAt(x, z) + size * .12, z);
    transform.rotation.set(random() * .6, random() * Math.PI, random() * .4);
    transform.scale.set(size * (1 + random()), size * .4, size * (.7 + random()));
    transform.updateMatrix(); stones.setMatrixAt(i, transform.matrix);
    color.setHSL(.59, .12 + random() * .12, .35 + random() * .22);
    stones.setColorAt(i, color);
  }
  stones.receiveShadow = true;
  stones.computeBoundingSphere();
  scene.add(stones);
}