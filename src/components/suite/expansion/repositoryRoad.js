import * as THREE from 'three';
import repositoryRoadShoulders from '@/components/suite/expansion/repositoryRoadShoulders';

export default function repositoryRoad(parent, floor, light) {
  const curve = new THREE.CatmullRomCurve3([
    [-429, floor, -650], [-429, floor, -380], [-429, floor, -230],
    [-590, floor, -80], [-1000, floor, 120], [-1800, floor, 340], [-3200, floor, 650],
  ].map(point => new THREE.Vector3(...point)), false, 'centripetal');
  const length = curve.getLength(), segments = Math.ceil(length / 4);
  const sample = (t, lane = 0) => {
    const point = curve.getPointAt(t), tangent = curve.getTangentAt(t);
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    // Flush with the tunnel floor, then a smooth engineered grade above the dunes.
    point.y = THREE.MathUtils.lerp(floor, Math.max(floor, 20), THREE.MathUtils.smoothstep(t * length, 270, 390));
    return point.addScaledVector(normal, lane);
  };
  const positions = [], indices = [];
  for (let i = 0; i <= segments; i++) {
    for (const side of [-24, 24]) positions.push(...sample(i / segments, side).toArray());
    if (i < segments) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const road = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: '#3c4448', roughness: .92, side: THREE.DoubleSide }));
  road.name = 'Repository road continuing beyond the horizon'; road.receiveShadow = true; parent.add(road);
  repositoryRoadShoulders(parent, sample, segments);
  for (const offset of [-22, -1, 1, 22]) {
    const vertices = [];
    for (let i = 0; i <= segments; i++) for (const side of [-.12, .12]) {
      const point = sample(i / segments, offset + side); point.y += .04; vertices.push(...point.toArray());
    }
    const marking = new THREE.BufferGeometry(); marking.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); marking.setIndex(indices); marking.computeVertexNormals();
    parent.add(new THREE.Mesh(marking, light));
  }
  return { length, sample, tangent: t => sample(Math.min(1, t + .0001)).sub(sample(Math.max(0, t - .0001))).normalize() };
}