import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function desertInspectionCamera(camera, targets, inspection, activate) {
  const look = new THREE.Vector3(0, 0, -42), eye = new THREE.Vector3(), aim = new THREE.Vector3();
  let previousView = '';
  return (time, dt) => {
    const matches = inspection.focus ? targets.filter(target => {
      if (target.userData.kind !== inspection.focus || !target.visible) return false;
      if (inspection.focus !== 'rover') return true;
      const { x, y, z } = target.position;
      return target.userData.rendered && Math.abs(x) < 275 && z > -250 && z < 110 && Math.abs(y - heightAt(x, z)) < 1;
    }) : [];
    const target = matches[inspection.index % Math.max(1, matches.length)];
    inspection.target = target || null;
    if (target) {
      const aircraft = ['satellite', 'aircraft'].includes(target.userData.kind), distance = (aircraft || target.userData.kind === 'rocket' ? 24 : 15) / inspection.zoom * Math.max(1, .9 / camera.aspect);
      aim.copy(target.position); aim.y += aircraft ? 0 : 1.5;
      eye.copy(aim).add(new THREE.Vector3(distance, distance * .65, distance * 1.2));
      if (!aircraft) eye.y = Math.max(eye.y, heightAt(eye.x, eye.z) + 3);
      if (inspection.react) { activate(target); inspection.react = false; }
    } else {
      eye.set(Math.sin(time * .035) * 5, 45 + Math.sin(time * .12) * 1.2, 80 + Math.cos(time * .07) * 1.2);
      aim.set(Math.sin(time * .04) * 3, 0, -42);
    }
    const view = `${target?.uuid ?? 'wide'}:${inspection.zoom}:${camera.aspect}`;
    if (view !== previousView) { camera.position.copy(eye); look.copy(aim); previousView = view; }
    else { const blend = 1 - Math.exp(-dt * 6); camera.position.lerp(eye, blend); look.lerp(aim, blend); }
    camera.lookAt(look);
  };
}