import * as THREE from 'three';
import hardwareKit from '@/components/suite/hardwareKit';
import hardwareProfiles from '@/components/suite/hardwareProfiles';

export default function fleetDetailing(scene, targets) {
  const kit = hardwareKit(), tagged = [];
  scene.traverse(object => { if (object.userData.hardwareProfile) tagged.push(object); });
  for (const target of new Set([...targets, ...tagged])) {
    const kind = target.userData.kind;
    const key = target.userData.hardwareProfile || (kind === 'crimson' || (kind === 'repository' && target.name.includes('truck')) ? 'truck' : kind);
    const profile = hardwareProfiles[key]; if (!profile) continue;
    const { size: [w, h, l], center: [x, y, z], code } = profile;
    const detail = new THREE.Group(); detail.name = 'Branded maintenance hatches and machined ventilation';
    if (!profile.topOnly) {
      const frontSize = Math.min(w * .7, h * .8);
      kit.panel(detail, frontSize, frontSize, [x, y, z + l / 2 + .018], [0, 0, 0], code);
      if (!profile.frontOnly) for (const side of [-1, 1]) {
        const size = Math.min(l * .6, h * .78);
        kit.panel(detail, size, size, [x + side * (w / 2 + .018), y, z + l * .16], [0, side * Math.PI / 2, 0], code);
        kit.vent(detail, l * .22, h * .46, [x + side * (w / 2 + .025), y, z - l * .31], [0, side * Math.PI / 2, 0]);
      }
    }
    if (!profile.frontOnly && !profile.noRoof) {
      const size = Math.min(w, l) * .67;
      kit.panel(detail, size, size, [x, profile.roof ?? y + h / 2 + .025, z], [-Math.PI / 2, 0, 0], code);
    }
    const lod = new THREE.LOD(); lod.addLevel(detail, 0); lod.addLevel(new THREE.Group(), Math.max(w, h, l) * 18 + 45); target.add(lod);
  }
}