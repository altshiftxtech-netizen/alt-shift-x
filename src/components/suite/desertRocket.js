import * as THREE from 'three';
import { palette } from '@/components/suite/sleekParts';
import { heightAt } from '@/components/suite/desertTerrain';
import launchVehicle from '@/components/suite/launchVehicle';
import launchPad from '@/components/suite/launchPad';
import launchSequence from '@/components/suite/launchSequence';

export default function desertRocket(scene, notify) {
  const root = new THREE.Group();
  root.userData.kind = 'rocket';
  const vehicleMount = new THREE.Group();
  // Keep the rocket's silhouette vertical in the wide, downward-looking camera.
  vehicleMount.rotation.x = -Math.atan2(45, 122);
  root.add(vehicleMount);
  const materials = palette(), vehicle = launchVehicle(vehicleMount, materials), pad = launchPad(root, materials);
  const sequence = launchSequence(vehicle, pad, notify);
  root.userData.launch = sequence.launch;
  scene.add(root);
  const resize = aspect => {
    const x = -aspect * (aspect < .65 ? 57 : 66), z = -65;
    const ground = Math.max(...[-5, 0, 5].flatMap(dx => [-5, 0, 5].map(dz => heightAt(x + dx, z + dz))));
    root.position.set(x, ground + .6, z);
  };
  return { target: root, resize, update: sequence.update, launchDemo: () => { vehicleMount.rotation.x = 0; return sequence.launch(true); } };
}