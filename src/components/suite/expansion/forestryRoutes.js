import * as THREE from 'three';

export const forestLanes = [282, 382, 482];
export const clearForestLane = x => forestLanes.some(lane => Math.abs(x - lane) < 22);
// Separate, tree-free working aisles with rounded headland turns, never a teleport.
export function forestRoute(time, index, speed = 1.4) {
  const radius = 7, straight = 190, arc = Math.PI * radius, length = 2 * (straight + arc);
  const d = ((time * speed + index * length / 3) % length + length) % length;
  const center = forestLanes[index % forestLanes.length];
  let x, z, heading;
  if (d < straight) { x = center + radius; z = -245 - d; heading = Math.PI; }
  else if (d < straight + arc) { const a = (d - straight) / radius; x = center + radius * Math.cos(a); z = -435 - radius * Math.sin(a); heading = Math.PI + a; }
  else if (d < 2 * straight + arc) { x = center - radius; z = -435 + d - straight - arc; heading = 0; }
  else { const a = (d - 2 * straight - arc) / radius; x = center - radius * Math.cos(a); z = -245 + radius * Math.sin(a); heading = a; }
  return { x, z, heading };
}
export function forestLaneGrade(x, z) {
  const distance = Math.min(...forestLanes.map(lane => Math.abs(x - lane)));
  return (1 - THREE.MathUtils.smoothstep(distance, 20, 28)) * (1 - THREE.MathUtils.smoothstep(Math.abs(z + 340), 112, 130));
}