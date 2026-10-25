import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

// Each lane has the same bend: separation never collapses at a crossing.
export const laneX = (z, lane) => (lane - 3) * 22 + Math.sin(z * .018) * 7;
export function groundPose(group, x, z, heading, clearance = 0) {
  const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const height = heightAt(x, z);
  forward.y = (heightAt(x + forward.x * 2, z + forward.z * 2) - heightAt(x - forward.x * 2, z - forward.z * 2)) / 4;
  right.y = (heightAt(x + right.x * 2, z + right.z * 2) - heightAt(x - right.x * 2, z - right.z * 2)) / 4;
  const normal = new THREE.Vector3().crossVectors(forward, right).normalize();
  forward.normalize(); right.crossVectors(normal, forward).normalize();
  group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, normal, forward));
  group.position.set(x, height + clearance, z);
}
export function moveOnRoute(item, time, dt) {
  const active = time - item.group.userData.activation < 3;
  item.speed = THREE.MathUtils.damp(item.speed ?? item.cruise, active ? 0 : item.cruise, 3, dt);
  item.distance += item.speed * dt;
  const progress = (item.distance / item.length) % 1;
  const point = item.route.getPointAt(progress), tangent = item.route.getTangentAt(progress);
  groundPose(item.group, point.x, point.z, Math.atan2(tangent.x, tangent.z), item.clearance);
  item.wheels?.forEach(w => w.rotateY(item.speed * dt / .78));
  // Wrap only beyond the visible terrain, never in front of the camera.
  item.group.visible = point.z < 125 && point.z > -290;
}