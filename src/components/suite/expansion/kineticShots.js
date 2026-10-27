import * as THREE from 'three';
import { part, connect } from '@/components/suite/expansion/sectorPrimitives';

export default function kineticShots(root, onHit, onMiss, reduced) {
  const beams = Array.from({ length: 12 }, () => {
    const material = new THREE.MeshBasicMaterial({ color: '#72f7ff', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, fog: false });
    const mesh = part(root, new THREE.CylinderGeometry(.23, .23, 1, 8), material); mesh.visible = false;
    const halo = part(mesh, new THREE.CylinderGeometry(.85, .85, 1, 8), new THREE.MeshBasicMaterial({ color: '#33dfff', transparent: true, opacity: .16, depthWrite: false, toneMapped: false, fog: false }));
    return { mesh, halo, age: 10 };
  });
  const impacts = Array.from({ length: 12 }, () => {
    const mesh = part(root, new THREE.TorusGeometry(1, .08, 6, 36), new THREE.MeshBasicMaterial({ color: '#8efaff', transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); mesh.visible = false; return { mesh, age: 10 };
  });
  let index = 0;
  return {
    fire(origin, point, targets, scoped = false) {
      const direction = point.clone().sub(origin).normalize(), ray = new THREE.Ray(origin, direction);
      let hit = null, nearest = Infinity, end = origin.clone().addScaledVector(direction, 450);
      for (const target of targets) {
        if (!target.active) continue;
        const intersection = ray.intersectSphere(new THREE.Sphere(target.position, target.radius), new THREE.Vector3());
        if (intersection && origin.distanceTo(intersection) < nearest) { nearest = origin.distanceTo(intersection); hit = target; end.copy(intersection); }
      }
      const slot = index++ % beams.length, beam = beams[slot]; beam.age = 0; beam.mesh.visible = true; connect(beam.mesh, origin, end); beam.mesh.scale.x = beam.mesh.scale.z = scoped ? .18 : 1;
      if (hit) { const impact = impacts[slot]; impact.age = 0; impact.mesh.position.copy(hit.position); onHit(hit); }
      else onMiss();
    },
    update(dt) {
      beams.forEach(beam => { beam.age += dt; beam.mesh.visible = beam.age < .3; beam.mesh.material.opacity = Math.max(0, 1 - beam.age / .3) * .9; });
      impacts.forEach(impact => { impact.age += dt; impact.mesh.visible = impact.age < .8; impact.mesh.scale.setScalar(reduced ? 7 : 4 + impact.age * 15); impact.mesh.material.opacity = Math.max(0, 1 - impact.age / .8); });
    },
  };
}