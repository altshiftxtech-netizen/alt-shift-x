import { palette } from '@/components/suite/sleekParts';
import desertCharacters from '@/components/suite/desertCharacters';
import desertRovers from '@/components/suite/desertRovers';
import desertDrones from '@/components/suite/desertDrones';
import desertQuadrupeds from '@/components/suite/desertQuadrupeds';
import { heightAt } from '@/components/suite/desertTerrain';

export default function desertVehicles(scene, routes, compact) {
  const materials = palette();
  const rovers = desertRovers(scene, routes, materials, compact);
  const drones = desertDrones(scene, materials, compact);
  const robots = desertQuadrupeds(scene, materials, compact);
  const people = desertCharacters(scene, heightAt, compact);
  return {
    targets: [...rovers.targets, ...drones.targets, ...robots.targets, ...people.targets],
    update(time, dt) { rovers.update(time, dt); drones.update(time, dt); robots.update(time); people.update(time); },
  };
}