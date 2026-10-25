import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function vehicleSignals(scene, targets) {
  const up = new THREE.Vector3(0, 1, 0), start = new THREE.Vector3(), end = new THREE.Vector3(), delta = new THREE.Vector3();
  const signals = targets.filter(t => ['drone', 'rover', 'transport'].includes(t.userData.kind)).map(target => {
    const drone = target.userData.kind === 'drone';
    const material = new THREE.MeshBasicMaterial({ color: drone ? '#58f5ff' : '#77e9ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const effect = new THREE.Group();
    if (drone) {
      effect.add(new THREE.Mesh(new THREE.CylinderGeometry(.045, .09, 1, 8), material));
      const spot = new THREE.Mesh(new THREE.RingGeometry(.6, .85, 40), material); spot.rotation.x = -Math.PI / 2; effect.add(spot);
    } else {
      for (let i = 0; i < 3; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .045, 6, 48), material); effect.add(ring); }
    }
    effect.visible = false; scene.add(effect);
    return { target, effect, material, drone };
  });
  return time => {
    signals.forEach(({ target, effect, material, drone }) => {
      const age = time - target.userData.activation;
      effect.visible = target.visible && age >= 0 && age < 4;
      if (!effect.visible) return;
      material.opacity = Math.sin(Math.PI * age / 4) * .85;
      if (drone) {
        start.copy(target.position); start.y -= .45;
        end.set(start.x, heightAt(start.x, start.z) + .12, start.z); delta.subVectors(start, end);
        const beam = effect.children[0]; beam.position.copy(start).add(end).multiplyScalar(.5); beam.scale.y = delta.length(); beam.quaternion.setFromUnitVectors(up, delta.normalize());
        effect.children[1].position.copy(end); effect.children[1].scale.setScalar(1 + .3 * Math.sin(age * 3));
      } else {
        effect.position.copy(target.position); effect.position.y += 3.4;
        effect.children.forEach((ring, i) => { const phase = (age * .55 + i / 3) % 1; ring.scale.setScalar(.5 + phase * 7); ring.position.y = phase * 3; });
      }
    });
    return signals.filter(({ effect, material }) => effect.visible && material.opacity > .2).map(({ target }) => target.userData.kind).join(',');
  };
}