import * as THREE from 'three';
import { palette } from '@/components/suite/sleekParts';
import launchFoundation from '@/components/suite/launchFoundation';
import launchVehicle from '@/components/suite/launchVehicle';
import launchPad from '@/components/suite/launchPad';
import launchSequence from '@/components/suite/launchSequence';

export default function desertRocket(scene, notify) {
  const root = new THREE.Group();
  root.userData = { kind: 'rocket', inspectionAimHeight: 4.3, inspectionDistance: 18 };
  const vehicleMount = new THREE.Group();
  // The vehicle and deck share world-up at every camera angle.
  vehicleMount.rotation.set(0, 0, 0);
  root.add(vehicleMount);
  const materials = palette(), vehicle = launchVehicle(vehicleMount, materials), pad = launchPad(root, materials);
  const sequence = launchSequence(vehicle, pad, notify);
  const placeFoundation = launchFoundation(root, materials.dark);
  root.userData.launch = sequence.launch;
  scene.add(root);
  const resize = aspect => {
    const x = -aspect * (aspect < .65 ? 57 : 66), z = -65;
    placeFoundation(x, z);
  };
  return { target: root, vehicle: vehicle.rocket, resize, update: sequence.update, launchDemo: () => { const launched = sequence.launch(true); if (launched) vehicleMount.rotation.x = 0; return launched; } };
}