import * as THREE from 'three';
import { heightAt } from '@/components/suite/desertTerrain';

export default function desertVehicles(scene, routes, compact) {
  const armor = new THREE.MeshStandardMaterial({ color: '#343744', metalness: .82, roughness: .33 });
  const carbon = new THREE.MeshStandardMaterial({ color: '#0b1018', metalness: .5, roughness: .65 });
  const cyan = new THREE.MeshStandardMaterial({ color: '#3E6976', emissive: '#3E6976', emissiveIntensity: 4 });
  const emerald = new THREE.MeshStandardMaterial({ color: '#426C60', emissive: '#426C60', emissiveIntensity: 3 });
  const rotorMaterial = new THREE.MeshBasicMaterial({ color: '#6D818A', transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false });
  const targets = [], drones = [], rovers = [], sleds = [];
  const box = (group, size, position, material = armor) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.castShadow = true; group.add(mesh); return mesh;
  };
  for (let i = 0; i < (compact ? 4 : 6); i++) {
    const group = new THREE.Group(); group.userData = { kind: 'drone', activation: -100, index: i };
    box(group, [1.3, .55, 2.4], [0, 0, 0]); box(group, [.85, .32, .75], [0, .25, -.8], cyan);
    const rotors = [];
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      const arm = box(group, [2.1, .13, .18], [x * 1.03, 0, z * .9], carbon); arm.rotation.y = -x * z * .5;
      const rotor = new THREE.Group(); rotor.position.set(x * 1.95, .12, z * 1.45);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(.88, 28), rotorMaterial); disc.rotation.x = -Math.PI / 2; rotor.add(disc);
      box(rotor, [1.65, .035, .09], [0, .02, 0], carbon); box(rotor, [.1, .035, 1.65], [0, .02, 0], carbon);
      const led = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), emerald); led.position.y = -.14; rotor.add(led);
      group.add(rotor); rotors.push(rotor);
    }
    const spotlight = new THREE.SpotLight('#526976', 180, 45, .3, .8, 1.4); spotlight.position.y = -.3;
    spotlight.target.position.set(0, -25, 0); group.add(spotlight, spotlight.target);
    spotlight.castShadow = i === 0; spotlight.shadow.mapSize.set(512, 512); spotlight.shadow.bias = -.002;
    const coneGeo = new THREE.ConeGeometry(6.5, 23, 28, 1, true); coneGeo.translate(0, -11.5, 0);
    const cone = new THREE.Mesh(coneGeo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: { tint: { value: new THREE.Color('#3E6976') } }, vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'uniform vec3 tint; varying vec2 vUv; void main(){float a=pow(vUv.y,1.5)*.065;gl_FragColor=vec4(tint,a);}' })); group.add(cone);
    const thruster = new THREE.Mesh(new THREE.ConeGeometry(.28, 1.8, 12), cyan); thruster.rotation.x = Math.PI; thruster.position.set(0, -.9, .8); group.add(thruster);
    scene.add(group); targets.push(group); drones.push({ group, rotors, thruster });
  }
  for (let i = 0; i < 4; i++) {
    const group = new THREE.Group(); group.userData = { kind: 'rover', activation: -100, index: i };
    box(group, [3.5, .8, 5.2], [0, 1.35, 0]); box(group, [2.4, 1.2, 2.8], [0, 2.3, -.3]); box(group, [2.2, .5, .1], [0, 2.5, -1.76], cyan);
    box(group, [.1, 1.3, .1], [1, 3.4, .7]);
    const wheels = [];
    for (const x of [-1, 1]) for (let z = -1; z <= 1; z++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, .5, 18), carbon); wheel.rotation.z = Math.PI / 2; wheel.position.set(x * 1.92, .8, z * 1.7); group.add(wheel); wheels.push(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .53, 12), armor); hub.rotation.z = Math.PI / 2; hub.position.copy(wheel.position); group.add(hub);
    }
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), new THREE.MeshBasicMaterial({ color: '#3E6976', wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); group.add(pulse);
    scene.add(group); targets.push(group); rovers.push({ group, wheels, pulse });
  }
  for (let i = 0; i < 9; i++) {
    const group = new THREE.Group(); const route = routes[i % routes.length];
    box(group, [1.8, .45, 3.8], [0, .3, 0]); box(group, [1.5, .55, 2.2], [0, .8, .2], carbon);
    box(group, [2.1, .12, 3.4], [0, -.1, 0], cyan);
    const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(60 * 3), 3));
    const trailColors = new Float32Array(60 * 3); for(let k=0;k<60;k++){const c=new THREE.Color('#3E6976').multiplyScalar(Math.pow(1-k/60,2)*2);c.toArray(trailColors,k*3);} trailGeo.setAttribute('color',new THREE.BufferAttribute(trailColors,3));
    const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ size: .55, transparent: true, opacity: .65, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false })); trail.frustumCulled = false;
    scene.add(group, trail); sleds.push({ group, route, trail, offset: i / 9 });
  }
  const update = (time, dt) => {
    drones.forEach(({ group, rotors, thruster }, i) => {
      const age = time - group.userData.activation, evade = age >= 0 && age < 4 ? Math.sin(age / 4 * Math.PI) : 0;
      const a = time * .05 + i * 1.6, x = Math.cos(a) * (30 + i * 8), z = Math.sin(a * .7) * 43 - 12;
      group.position.set(x + Math.sin(age * 3) * evade * 9, heightAt(x, z) + 17 + Math.sin(time * .5 + i) * 2, z + Math.cos(age * 3) * evade * 5);
      group.rotation.set(Math.sin(time + i) * .07 + evade * .3, -a, Math.sin(age * 2) * evade * .65);
      rotors.forEach(r => { r.rotation.y += dt * 42; }); thruster.scale.y = 1 + evade * 4;
    });
    rovers.forEach(({ group, wheels, pulse }, i) => {
      const x = -65 + i * 35 + Math.sin(time * .025 + i) * 8, z = ((time * 1.2 + i * 32) % 140) - 70;
      group.position.set(x, heightAt(x, z), z); group.rotation.x = Math.atan2(heightAt(x, z - 1) - heightAt(x, z + 1), 2);
      group.rotation.z = Math.atan2(heightAt(x + 1, z) - heightAt(x - 1, z), 2);
      wheels.forEach(w => { w.rotation.x += dt * 1.2; });
      const age = time - group.userData.activation; const active = age >= 0 && age < 4; pulse.visible = active;
      if (active) { pulse.scale.setScalar(1 + age * 5); pulse.material.opacity = Math.sin(age / 4 * Math.PI) * .28; }
    });
    sleds.forEach(({ group, route, trail, offset }) => {
      const p = (time * .022 + offset) % 1, location = route.getPoint(p); group.position.copy(location); group.position.y += 1.1; group.lookAt(route.getPoint(Math.min(.9999, p + .002)).add(new THREE.Vector3(0, 1.1, 0)));
      const pos = trail.geometry.attributes.position;
      for (let j = 0; j < 60; j++) { const v = route.getPoint(Math.max(0, p - j * .0006)); pos.setXYZ(j, v.x + Math.sin(j * 2 + time) * .12, v.y + 1.1 + Math.sin(j + time) * .12, v.z); } pos.needsUpdate = true;
    });
  };
  return { targets, update };
}