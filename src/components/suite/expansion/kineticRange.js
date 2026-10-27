import * as THREE from 'three';
import kineticRangeAssets from '@/components/suite/expansion/kineticRangeAssets';
import kineticDebris from '@/components/suite/expansion/kineticDebris';
import kineticShots from '@/components/suite/expansion/kineticShots';
import provingGroundEvents from '@/components/suite/expansion/provingGroundEvents';

export default function kineticRange(scene, camera, canvas, reduced) {
  const assets = kineticRangeAssets(scene), debris = kineticDebris(assets.root);
  let streak = 0, hits = 0, fired = 0, resolved = 0, unlocked = false;
  const shots = kineticShots(assets.root, () => {
    streak++; hits++; resolved++;
    if (streak === 100 && !unlocked) { unlocked = true; provingGroundEvents('PROVING_GROUND_DEFENDER_UNLOCK', { streak: 100 }); }
  }, () => { streak = 0; resolved++; }, reduced);
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(assets.root.position.z - 70));
  const aim = new THREE.Vector3(0, 80, -70), world = new THREE.Vector3();
  const move = event => {
    const rect = canvas.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    ray.setFromCamera(pointer, camera); if (!ray.ray.intersectPlane(plane, world)) return;
    aim.copy(world).sub(assets.root.position); aim.x = THREE.MathUtils.clamp(aim.x, -160, 160); aim.y = THREE.MathUtils.clamp(aim.y, 5, 195); assets.reticle.position.copy(aim);
  };
  const fire = event => {
    if (event) move(event);
    if (!shots.fire(aim)) return;
    fired++; assets.turntable.rotation.y = Math.atan2(-aim.x, -aim.z);
    assets.gimbal.rotation.x = Math.atan2(aim.y - 6, Math.hypot(aim.x, aim.z));
  };
  assets.target.userData.onActivate = () => fire();
  return { target: assets.target, move, fire, update(time, dt, inspected) {
    assets.update(time, inspected); assets.reticle.visible = inspected;
    debris.update(time); shots.update(dt, debris.targets);
    assets.sign.set(`INTERCEPT ACCURACY: ${resolved ? (hits / resolved * 100).toFixed(1) + '%' : '—'} | STREAK: ${streak}/100\nCLICK AHEAD OF DESCENDING CYAN VECTORS\nINERT TEST SLUGS · 0.2M PRECISION WINDOW`);
    return { streak, fired, hits };
  } };
}