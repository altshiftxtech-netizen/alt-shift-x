import * as THREE from 'three';
import desertGroundTexture from '@/components/suite/desertGroundTexture';
import desertGroundDetail from '@/components/suite/desertGroundDetail';
import { laneX } from '@/components/suite/desertTraffic';
import expandedTerrain from '@/components/suite/expansion/expandedTerrain';
import forestryTerrainMaterial from '@/components/suite/expansion/forestryTerrainMaterial';

export function heightAt(x, z) {
  const canyon = Math.exp(-Math.pow((x - 13 * Math.sin(z * .024)) / 22, 2));
  const dunes = Math.pow(Math.abs(Math.sin(x * .035 + Math.sin(z * .024) * 1.8)), 2.4) * 15;
  const ridges = Math.sin(x * .12 + z * .045) * 1.6 + Math.sin(z * .18 + x * .08) * .65 + Math.sin(x * .52 + Math.sin(z * .23) * 2) * .25 + Math.sin(x * 1.4 + z * .8) * .08;
  const original = (dunes + ridges) * (1 - canyon * .85) - canyon * 5;
  // Grade only the new remote concrete aprons, never the original device lanes.
  const south = (1 - THREE.MathUtils.smoothstep(Math.abs(x), 145, 200)) * (1 - THREE.MathUtils.smoothstep(Math.abs(z - 475), 110, 140));
  const northwest = (1 - THREE.MathUtils.smoothstep(Math.abs(x + 429), 48, 70)) * (1 - THREE.MathUtils.smoothstep(Math.abs(z + 470), 165, 190));
  return original * (1 - Math.max(south, northwest));
}

export default function desertTerrain(scene, compact, anisotropy) {
  const geometry = new THREE.PlaneGeometry(620, 620, compact ? 160 : 256, compact ? 160 : 256);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  const colors = [];
  const obsidian = new THREE.Color('#060B11'), clay = new THREE.Color('#141E29'), crest = new THREE.Color('#303E4D');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = heightAt(x, z);
    pos.setY(i, y);
    const c = obsidian.clone().lerp(clay, .65).lerp(crest, THREE.MathUtils.clamp((y + 5) / 23, 0, 1));
    c.multiplyScalar(.85 + .15 * Math.sin(x * 7 + z * 3));
    colors.push(c.r, c.g, c.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const sand = desertGroundTexture(false, anisotropy, compact);
  const grain = desertGroundTexture(true, anisotropy, compact);
  const material = new THREE.MeshStandardMaterial({ color: new THREE.Color().setScalar(1.15), vertexColors: true, map: grain, roughness: .88, roughnessMap: grain, metalness: .08, envMapIntensity: .22, bumpMap: sand, bumpScale: .32 });
  const updateSoil = forestryTerrainMaterial(material);
  const land = new THREE.Mesh(geometry, material); land.receiveShadow = true; scene.add(land);
  desertGroundDetail(scene, heightAt, compact);
  const updateHorizon = expandedTerrain(scene, material, compact);
  const routes = [];
  routes.updateHorizon = camera => { updateHorizon(camera); updateSoil(); };
  for (let lane = 0; lane < 7; lane++) {
    const points = [];
    for (let j = 0; j <= 200; j++) {
      const z = -340 + j * 2.8;
      const x = laneX(z, lane);
      points.push(new THREE.Vector3(x, heightAt(x, z) + .65, z));
    }
    const curve = new THREE.CatmullRomCurve3(points); routes.push(curve);
    const color = lane % 2 ? '#284653' : '#4C493D';
    const vein = new THREE.Mesh(new THREE.TubeGeometry(curve, 360, lane === 3 ? .14 : .065, 5, false), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .8, roughness: .3 }));
    scene.add(vein);
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 250, .48, 5, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .055, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(halo);
  }
  return routes;
}