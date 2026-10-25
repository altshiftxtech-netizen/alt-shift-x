import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function droneCursorFlight(camera, canvas, inspection) {
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), plane = new THREE.Plane(), point = new THREE.Vector3();
  let pilot = null;
  const release = () => { if (pilot) delete pilot.userData.flightGoal; pilot = null; };
  return {
    move(event, hovered) {
      if (event.target.closest?.('button,a,select,input,.suite-ground-controls,header,footer')) return;
      const target = inspection.focus === 'drone' ? inspection.target : !inspection.focus && hovered?.userData.kind === 'drone' ? hovered : !inspection.focus ? pilot : null;
      if (!target) { release(); return; }
      if (pilot !== target) { release(); pilot = target; }
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      plane.set(new THREE.Vector3(0, 1, 0), -target.position.y);
      if (!ray.ray.intersectPlane(plane, point)) return;
      const { stationX, stationZ } = target.userData;
      point.x = THREE.MathUtils.clamp(point.x, stationX - 32, stationX + 32);
      point.z = THREE.MathUtils.clamp(point.z, stationZ - 32, stationZ + 32);
      point.y = heightAt(point.x, point.z) + 15;
      target.userData.flightGoal = point.clone();
      canvas.dataset.droneFlight = 'cursor';
    },
    release,
    update() { if (pilot && inspection.focus && (inspection.focus !== 'drone' || inspection.target !== pilot)) release(); },
  };
}