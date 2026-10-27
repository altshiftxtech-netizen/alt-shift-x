import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { laneX } from '@/components/suite/desertTraffic';
import builderBotAds from '@/components/suite/builderBotAds';

export default function desertCharacters(scene, heightAt, compact) {
  const suit = new THREE.MeshStandardMaterial({ color: '#8495A4', metalness: .55, roughness: .42 });
  const joints = new THREE.MeshStandardMaterial({ color: '#263B49', metalness: .65, roughness: .5 });
  const visor = new THREE.MeshStandardMaterial({ color: '#53DBED', emissive: '#2199AB', emissiveIntensity: .45, metalness: .5, roughness: .25 });
  const robotArmor = new THREE.MeshStandardMaterial({ color: '#BAA882', metalness: .75, roughness: .36 });
  const people = [], attachAds = builderBotAds();
  const stations = [[-24, 35], [30, 12], [-54, -28], [64, -58], [12, -78], [-83, -100], [85, -8], [-10, -145]];
  for (let i = 0; i < (compact ? 6 : 8); i++) {
    const robot = i % 2 === 1, group = new THREE.Group(), limbs = [];
    group.name = robot ? 'Survey robot' : 'Suited humanoid';
    group.userData = { kind: 'surveyor', activation: -100, isRobot: robot, robotId: `survey-${i}` };
    const add = (geometry, material, x, y, z, parent = group) => {
      const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
    };
    const armor = robot ? robotArmor : suit;
    add(new RoundedBoxGeometry(robot ? .95 : .75, 1, .5), armor, 0, 2.05, 0);
    add(new RoundedBoxGeometry(.65, .35, .45), joints, 0, 1.4, 0);
    add(robot ? new RoundedBoxGeometry(.65, .6, .6) : new THREE.SphereGeometry(.37, 16, 12), armor, 0, 2.95, 0);
    add(new RoundedBoxGeometry(robot ? .5 : .57, .16, .12), visor, 0, 3, .32);
    add(new RoundedBoxGeometry(.48, .65, .28), joints, 0, 2.1, -.4);
    for (const side of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(side * .58, 2.4, 0); group.add(arm);
      add(new THREE.CylinderGeometry(.14, .12, 1.05, 10), armor, 0, -.5, 0, arm);
      add(new THREE.SphereGeometry(.17, 10, 8), joints, 0, -1.05, 0, arm);
      const leg = new THREE.Group(); leg.position.set(side * .25, 1.3, 0); group.add(leg);
      add(new THREE.CylinderGeometry(.19, .14, 1.05, 10), armor, 0, -.5, 0, leg);
      add(new RoundedBoxGeometry(.34, .22, .55), joints, 0, -1.18, .12, leg);
      limbs.push({ arm, leg, side });
    }
    if (robot) attachAds(group);
    group.scale.setScalar(robot ? 1.8 : 1.5); scene.add(group);
    people.push({ group, limbs, station: stations[i], phase: i * 1.7 });
  }
  return { targets: people.map(person => person.group), update(time) { people.forEach(({ group, limbs, phase }, i) => {
    const angle = time * .045 + phase, z = -190 + i * 13 + Math.cos(angle) * 3;
    const x = laneX(z, i % 6) + 11 + Math.sin(angle) * 2;
    group.position.set(x, heightAt(x, z) + .2, z); group.rotation.y = Math.atan2(Math.cos(angle) * 2, -Math.sin(angle) * 3);
    const wave = time - group.userData.activation < 3;
    limbs.forEach(({ arm, leg, side }) => { leg.rotation.x = Math.sin(time * 1.8 + phase) * .12 * side; arm.rotation.x = wave && side === 1 ? -2.4 + Math.sin(time * 4) * .15 : -leg.rotation.x * .7; });
  }); } };
}