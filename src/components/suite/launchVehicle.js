import * as THREE from 'three';
import { rounded } from '@/components/suite/sleekParts';
import rocketHullDetail from '@/components/suite/rocketHullDetail';

export default function launchVehicle(scene, materials) {
  const rocket = new THREE.Group(), legs = [];
  const profile = [[0, 0], [.65, 0], [.78, .4], [.78, 5.5], [.73, 6.2], [.6, 6.9], [.35, 7.5], [0, 8.1]].map(([x, y]) => new THREE.Vector2(x, y));
  const hull = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), materials.shell); hull.castShadow = true; rocket.add(hull);
  for (const y of [.5, 2, 5.5]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(.785, .035, 8, 48), materials.dark); band.rotation.x = Math.PI / 2; band.position.y = y; rocket.add(band);
  }
  rounded(rocket, [.58, .85, .12], [0, 6.1, .72], materials.glass);
  rounded(rocket, [.12, 1.8, .1], [0, 3.5, .8], materials.light);
  for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Group(); pivot.rotation.y = i * Math.PI / 2; pivot.position.y = .9; rocket.add(pivot);
    const leg = new THREE.Group(); leg.position.z = .65; pivot.add(leg);
    rounded(leg, [.15, 2.7, .17], [0, -1.25, 0], materials.dark);
    const foot = rounded(leg, [.55, .12, .5], [0, -2.6, 0], materials.shell); leg.userData.foot = foot;
    leg.rotation.x = -.8; foot.rotation.x = .8; legs.push(leg);
    const fin = rounded(pivot, [.08, .75, .7], [0, 4.3, .85], materials.dark); fin.rotation.x = -.12;
  }
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(.35, .57, .7, 32, 1, true), materials.dark); nozzle.position.y = -.22; rocket.add(nozzle);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(.45, 3.8, 32), new THREE.MeshBasicMaterial({ color: '#8cdfff', transparent: true, opacity: .85 }));
  flame.rotation.z = Math.PI; flame.position.y = -2.2; rocket.add(flame); flame.visible = false;
  const core = new THREE.Mesh(new THREE.ConeGeometry(.22, 2.6, 24), new THREE.MeshBasicMaterial({ color: '#fff3d6' })); core.rotation.z = Math.PI; core.position.y = -1.6; rocket.add(core); core.visible = false;
  rocketHullDetail(rocket);
  const restHeight = .275 - .9 + 2.6 * Math.cos(.8) + .06;
  rocket.position.y = restHeight; scene.add(rocket); return { rocket, legs, flame, core, restHeight };
}