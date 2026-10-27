import * as THREE from 'three';

export default function laserAimControls(camera, canvas, root, inspection, selected, targets) {
  const aim = new THREE.Vector3(0, 85, -145), pointer = new THREE.Vector2(), ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(root.position.z - 145)), world = new THREE.Vector3();
  let cursor = null, scoped = false, yaw = 0, pitch = .3, held = false, previousTurret = null;
  const direction = () => new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const move = event => {
    const rect = canvas.getBoundingClientRect();
    if (inspection.scope) {
      if (cursor) { yaw = THREE.MathUtils.clamp(yaw + (event.clientX - cursor[0]) / rect.width * 1.7, -.95, .95); pitch = THREE.MathUtils.clamp(pitch - (event.clientY - cursor[1]) / rect.height * 1.3, .025, .9); }
      cursor = [event.clientX, event.clientY]; aim.copy(selected().center).addScaledVector(direction(), 400);
    } else {
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      ray.setFromCamera(pointer, camera); if (ray.ray.intersectPlane(plane, world)) aim.copy(world).sub(root.position);
      let nearest = Infinity;
      for (const target of targets) {
        if (!target.active) continue;
        const center = target.position.clone().add(root.position);
        const hit = ray.ray.intersectSphere(new THREE.Sphere(center, target.radius), new THREE.Vector3());
        if (hit && ray.ray.origin.distanceToSquared(hit) < nearest) { nearest = ray.ray.origin.distanceToSquared(hit); aim.copy(target.position); }
      }
    }
  };
  return { aim, move, down(event) { move(event); held = true; }, up() { held = false; }, get held() { return held; },
    key(event, down) {
      if (event.target.closest?.('input,select,textarea,[contenteditable="true"]')) return;
      if (event.code === 'Space') { event.preventDefault(); inspection.keyHeld = down; }
      if (down && event.code === 'Escape' && inspection.scope) inspection.onScopeChange?.(false);
    },
    camera() {
      if (!inspection.scope) { scoped = false; cursor = null; return; }
      const turret = selected(), origin = turret.center;
      if (!scoped || turret !== previousTurret) { aim.set(0, 85, -145); const d = aim.clone().sub(origin).normalize(); yaw = Math.atan2(d.x, -d.z); pitch = THREE.MathUtils.clamp(Math.asin(d.y), .025, .9); cursor = null; scoped = true; previousTurret = turret; }
      aim.copy(origin).addScaledVector(direction(), 400);
      camera.position.copy(origin).addScaledVector(direction(), 18).add(root.position); camera.position.y += 1.1;
      camera.lookAt(aim.clone().add(root.position));
    },
  };
}