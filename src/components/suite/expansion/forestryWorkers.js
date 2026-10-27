import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import { box, part, steel } from '@/components/suite/expansion/sectorPrimitives';

export default function forestryWorkers(parent, compact) {
  const root = new THREE.Group(); root.name = 'Phase-gated environmental engineers'; root.visible = false; parent.add(root);
  const suit = new THREE.MeshToonMaterial({ color: '#dfb941' }), dark = steel();
  const visor = new THREE.MeshStandardMaterial({ color: '#164957', metalness: .7, roughness: .2 });
  const workers = [];
  for (let i = 0; i < (compact ? 2 : 4); i++) {
    const g = new THREE.Group(); root.add(g); box(g, [1.2, 1.6, .7], [0, 2.4, 0], suit);
    part(g, new THREE.SphereGeometry(.52, 10, 8), suit, [0, 3.7, 0]); box(g, [.8, .24, .12], [0, 3.75, .45], visor);
    box(g, [.85, 1.2, .5], [0, 2.5, -.65], dark);
    const limbs = [];
    for (const side of [-1, 1]) {
      const arm = box(g, [.3, 1.5, .35], [side * .85, 2.2, 0], suit);
      const leg = box(g, [.4, 1.5, .4], [side * .35, .8, 0], dark); limbs.push({ arm, leg, side });
      box(g, [.12, 1.9, .16], [side * .65, 1.3, -.3], dark);
    }
    workers.push({ g, limbs });
  }
  return (time, state) => {
    root.visible = state.humans;
    if (!root.visible) return;
    workers.forEach(({ g, limbs }, i) => {
      const x = 300 + i * 58, z = -285 + Math.sin(time * .1 + i) * 8;
      g.position.set(x, heightAt(x, z) + .2, z); g.rotation.y = Math.cos(time * .1 + i) > 0 ? 0 : Math.PI;
      limbs.forEach(({ arm, leg, side }) => { leg.rotation.x = Math.sin(time * 2) * .22 * side; arm.rotation.x = -leg.rotation.x; });
    });
  };
}