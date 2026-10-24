import * as THREE from 'three';

export function heightAt(x, z) {
  const canyon = Math.exp(-Math.pow((x - 13 * Math.sin(z * .024)) / 22, 2));
  const dunes = Math.pow(Math.abs(Math.sin(x * .035 + Math.sin(z * .024) * 1.8)), 2.4) * 15;
  const ridges = Math.sin(x * .12 + z * .045) * 1.6 + Math.sin(z * .18 + x * .08) * .65 + Math.sin(x * .52 + Math.sin(z * .23) * 2) * .25 + Math.sin(x * 1.4 + z * .8) * .08;
  return (dunes + ridges) * (1 - canyon * .85) - canyon * 5;
}

export default function desertTerrain(scene, compact) {
  const geometry = new THREE.PlaneGeometry(620, 620, compact ? 180 : 300, compact ? 180 : 300);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position;
  const colors = [];
  const obsidian = new THREE.Color('#03060A'), clay = new THREE.Color('#0B1219'), crest = new THREE.Color('#202A35');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = heightAt(x, z);
    pos.setY(i, y);
    const c = obsidian.clone().lerp(clay, .65).lerp(crest, THREE.MathUtils.clamp((y + 5) / 23, 0, 1));
    c.multiplyScalar(.85 + .15 * Math.sin(x * 7 + z * 3));
    colors.push(c.r, c.g, c.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d'), image = ctx.createImageData(256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 105 + Math.random() * 95;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value; image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const sand = new THREE.CanvasTexture(canvas); sand.wrapS = sand.wrapT = THREE.RepeatWrapping; sand.repeat.set(110, 110);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .94, metalness: .12, envMapIntensity: .28, bumpMap: sand, bumpScale: .06 });
  const land = new THREE.Mesh(geometry, material); land.receiveShadow = true; scene.add(land);
  const routes = [];
  for (let lane = 0; lane < 7; lane++) {
    const points = [];
    for (let j = 0; j <= 200; j++) {
      const z = -260 + j * 2.4;
      const x = (lane - 3) * 22 + Math.sin(z * .024 + lane * .55) * (lane === 3 ? 13 : 18);
      points.push(new THREE.Vector3(x, heightAt(x, z) + .22, z));
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