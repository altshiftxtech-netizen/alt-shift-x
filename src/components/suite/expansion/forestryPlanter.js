import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, beam, connect } from '@/components/suite/expansion/sectorPrimitives';
import { forestRoute } from '@/components/suite/expansion/forestryRoutes';

export default function forestryPlanter(parent, dark, light, index) {
  const group = new THREE.Group(); parent.add(group);
  box(group, [4.6, 1.2, 5], [0, 2.7, 0], dark);
  box(group, [2.8, .15, 3], [0, 3.4, 0], light);
  const drill = beam(group, light, .25), legs = [];
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    legs.push({ angle, top: beam(group, dark, .22), bottom: beam(group, dark, .17) });
  }
  const a = new THREE.Vector3(), foot = new THREE.Vector3(), knee = new THREE.Vector3();
  const update = (time, active) => {
    group.visible = active; if (!active) return;
    const commanded = group.userData.plantingPosition;
    const route = forestRoute(time, index, .9);
    const x = commanded?.x ?? route.x, z = commanded?.z ?? route.z;
    group.position.set(x, heightAt(x, z), z); group.rotation.y = commanded ? 0 : route.heading;
    legs.forEach(({ angle, top, bottom }, i) => {
      const phase = (time * .65 + (i % 2) * .5) % 1;
      const swing = phase > .6, stride = swing ? -1.4 + (phase - .6) / .4 * 2.8 : 1.4 - phase / .6 * 2.8;
      a.set(Math.cos(angle) * 1.7, 2.6, Math.sin(angle) * 1.8);
      foot.set(Math.cos(angle) * 4.2, 0, Math.sin(angle) * 4.2 + stride);
      const c = Math.cos(group.rotation.y), s = Math.sin(group.rotation.y);
      foot.y = heightAt(x + foot.x * c + foot.z * s, z - foot.x * s + foot.z * c) - group.position.y + (swing && !commanded ? Math.sin((phase - .6) / .4 * Math.PI) * 1.2 : 0);
      knee.copy(a).add(foot).multiplyScalar(.5);
      // Analytic two-bone IK: equal 3.2m segments with an outward knee pole.
      const half = a.distanceTo(foot) / 2, bend = Math.sqrt(Math.max(0, 3.2 ** 2 - half ** 2));
      const pole = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const axis = new THREE.Vector3().subVectors(foot, a).normalize(); pole.addScaledVector(axis, -pole.dot(axis)).normalize();
      knee.addScaledVector(pole, bend); connect(top, a, knee); connect(bottom, knee, foot);
    });
    const stroke = .3 + (Math.sin(time * 2 + index) * .5 + .5) * 2;
    connect(drill, new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, stroke, 0));
  };
  update.target = group; return update;
}