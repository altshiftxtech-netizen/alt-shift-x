import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function repositoryRoad(parent, floor, light) {
  const curve = new THREE.CatmullRomCurve3([
    [-429, floor, -650], [-429, floor, -380], [-429, floor, -230],
    [-590, floor, -80], [-1000, floor, 120], [-1800, floor, 340], [-3200, floor, 650],
  ].map(point => new THREE.Vector3(...point)), false, 'centripetal');
  const length = curve.getLength(), segments = Math.ceil(length / 8);
  const sample = (t, lane = 0) => {
    const point = curve.getPointAt(t), tangent = curve.getTangentAt(t);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    point.y = Math.max(floor, ...[-48, 0, 48].map(offset => heightAt(point.x + normal.x * offset, point.z + normal.z * offset) + .6));
    return point.addScaledVector(normal, lane);
  };
  const positions = [], indices = [];
  for (let i = 0; i <= segments; i++) {
    for (const side of [-48, 48]) positions.push(...sample(i / segments, side).toArray());
    if (i < segments) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const road = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: '#3c4448', roughness: .92, side: THREE.DoubleSide }));
  road.name = 'Repository road continuing beyond the horizon'; road.receiveShadow = true; parent.add(road);
  for (const offset of [-15, -3, 3, 15]) {
    const points = Array.from({ length: segments + 1 }, (_, i) => sample(i / segments, offset).add(new THREE.Vector3(0, .15, 0)));
    const stripe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, .15, 4, false), light); parent.add(stripe);
  }
  return { length, sample, tangent: t => curve.getTangentAt(t) };
}