import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';
import forestryPlanter from '@/components/suite/expansion/forestryPlanter';
import { steel, teal } from '@/components/suite/expansion/sectorPrimitives';
export default function treePlantingGame(scene, inspection, bridge, actions) {
  const target = new THREE.Group(); target.position.set(350, heightAt(350, -130), -130);
  target.userData = { kind: 'planting', inspectionDistance: 85, inspectionAimHeight: 4, inspectionDirection: [0, .95, 1.15] }; scene.add(target);
  const root = new THREE.Group(); root.name = 'Personal reforestation grove'; scene.add(root);
  const bark = new THREE.MeshStandardMaterial({ color: '#74513a', roughness: .9 });
  const foliage = new THREE.MeshStandardMaterial({ color: '#37b77c', roughness: .65, emissive: '#123d26', emissiveIntensity: .4 });
  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#60e5c2', transparent: true, opacity: .55 });
  const plots = Array.from({ length: 50 }, (_, index) => {
    const x = 290 + index % 10 * 13, z = -100 - Math.floor(index / 10) * 13, y = heightAt(x, z);
    const group = new THREE.Group(); group.position.set(x, y, z); root.add(group);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.4, 24), ringMaterial); ring.rotation.x = -Math.PI / 2; ring.position.y = .2; group.add(ring);
    const tree = new THREE.Group(); group.add(tree); tree.visible = false;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.3, .5, 5, 8), bark); trunk.position.y = 2.5; tree.add(trunk);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6, 10), foliage); crown.position.y = 6; tree.add(crown);
    return { id: `plot-${index}`, group, tree, ring, grown: 0, practice: false };
  });
  const planter = forestryPlanter(root, steel(), teal(), 0);
  planter.target.userData.hardwareProfile = 'planter';
  inspection.personalPlant = () => {
    if (inspection.focus !== 'planting') return;
    const plot = plots.find(p => !p.practice && !bridge.current.planted?.includes(p.id)); if (!plot) return;
    target.position.copy(plot.group.position); target.userData.inspectionDistance = 25; target.userData.inspectionAimHeight = 4;
    planter.target.userData.plantingPosition = plot.group.position.clone();
    actions.start('tree', plot.id, 'planting', () => true, result => { plot.practice = !!result.practice; plot.tree.visible = true; planter.target.userData.plantingPosition = plot.group.position.clone().add(new THREE.Vector3(7, 0, 0)); });
  };
  return { target, update(time, dt) {
    const enabled = inspection.focus === 'planting';
    planter(time, enabled); const active = actions.current;
    for (const plot of plots) {
      const planted = plot.practice || bridge.current.planted?.includes(plot.id);
      plot.tree.visible = planted; plot.ring.visible = enabled && !planted;
      if (planted) { plot.grown = Math.min(1, plot.grown + dt * 1.8); plot.tree.scale.setScalar(.12 + .88 * plot.grown); }
      else plot.ring.scale.setScalar(active?.target === plot.id ? 1 + .15 * Math.sin(time * 8) : 1);
    }
  } };
}