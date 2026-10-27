import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { instances, matrix, random } from '@/components/suite/expansion/sectorPrimitives';

export default function forestryTrees(parent, compact) {
  const count = compact ? 120 : 240, rand = random(81293), positions = [];
  const bark = new THREE.MeshStandardMaterial({ color: '#584135', roughness: .95 });
  const leaf = new THREE.MeshStandardMaterial({ color: '#1c5746', roughness: .9, emissive: '#0c2920', emissiveIntensity: .25 });
  const stages = [[.25, 1.4, .8], [.75, 9, 4], [1.5, 28, 8]].map(([radius, height, crown]) => ({
    radius, height, crown,
    trunks: instances(parent, new THREE.CylinderGeometry(.7, 1, 1, 6), bark, count),
    tops: instances(parent, new THREE.ConeGeometry(1, 1, 7), leaf, count),
  }));
  for (let i = 0; i < count; i++) {
    const columns = compact ? 12 : 16, x = 258 + i % columns * (280 / columns) + rand() * 5, z = -212 - Math.floor(i / columns) * 18 + rand() * 5;
    positions.push([x, heightAt(x, z) + .15, z]);
  }
  let last = -1;
  return (state, timestamp) => {
    if (Math.floor(timestamp / 1000) === last) return; last = Math.floor(timestamp / 1000);
    stages.forEach((stage, i) => {
      stage.trunks.visible = stage.tops.visible = i === state.phase - 1;
      if (i !== state.phase - 1) return;
      positions.forEach(([x, y, z], index) => {
        const planted = state.phase !== 1 || index / count < state.progress;
        // Selective cuts leave protected stands and clear the rest progressively.
        const harvested = state.phase === 3 && index % 3 !== 0 && index / count < state.progress;
        const scale = planted && !harvested ? 1 : 0;
        matrix(stage.trunks, index, [x, y + stage.height / 2, z], [stage.radius * scale, stage.height * scale, stage.radius * scale]);
        matrix(stage.tops, index, [x, y + stage.height, z], [stage.crown * scale, stage.height * .9 * scale, stage.crown * scale]);
      });
      stage.trunks.instanceMatrix.needsUpdate = stage.tops.instanceMatrix.needsUpdate = true;
    });
  };
}