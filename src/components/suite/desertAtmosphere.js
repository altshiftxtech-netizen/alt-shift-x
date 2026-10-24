import * as THREE from 'three';
import desertCelestialCycle from '@/components/suite/desertCelestialCycle';

export default function desertAtmosphere(scene) {
  const geometry = new THREE.BufferGeometry(), count = 4200;
  const positions = new Float32Array(count * 3), sizes = new Float32Array(count), seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) { positions.set([(Math.random() - .5) * 450, Math.random() * 150 + 4, (Math.random() - .5) * 450], i * 3); sizes[i] = .6 + Math.random() * 2; seeds[i] = Math.random(); }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1)); geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({ transparent: true, depthTest: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { time: { value: 0 }, dpr: { value: Math.min(window.devicePixelRatio, 2) } }, vertexShader: `uniform float time; uniform float dpr; attribute float aSize; attribute float aSeed; varying float vSeed; varying float vDepth; void main(){vSeed=aSeed;vec3 p=position;p.x+=sin(time*.07+aSeed*80.)*3.;p.y+=sin(time*.12+aSeed*30.)*1.5;p.z+=cos(time*.06+aSeed*60.)*2.;vec4 mv=modelViewMatrix*vec4(p,1.);vDepth=-mv.z;gl_PointSize=clamp(aSize*dpr*100./max(8.,-mv.z),.5,6.);gl_Position=projectionMatrix*mv;}`, fragmentShader: `varying float vSeed; varying float vDepth; void main(){float a=1.-smoothstep(.05,.5,length(gl_PointCoord-.5));vec3 c=mix(vec3(.22,.29,.36),vec3(.48,.51,.56),vSeed);float fade=1.-smoothstep(90.,300.,vDepth);gl_FragColor=vec4(c*1.5,a*fade*.24);}` });
  const dust = new THREE.Points(geometry, material); scene.add(dust);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(23, 64, 48), new THREE.MeshStandardMaterial({ color: '#46535F', roughness: 1 })); moon.position.set(103, 83, -220); scene.add(moon);
  const ring = new THREE.Mesh(new THREE.RingGeometry(28, 38, 128), new THREE.MeshBasicMaterial({ color: '#657582', transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })); ring.position.copy(moon.position); ring.rotation.set(.85, -.6, -.4); scene.add(ring);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#81909E').multiplyScalar(1.1) })); sun.position.set(-150, 18, -260); scene.add(sun);
  moon.name = 'local-time-moon'; sun.name = 'local-time-sun';
  const update = time => {
    material.uniforms.time.value = time;
    const cycle = desertCelestialCycle();
    for (const [body, position] of [[sun, cycle.sun], [moon, cycle.moon]]) {
      body.position.set(position.x, position.y, position.z);
      body.visible = position.visible;
    }
    ring.position.copy(moon.position); ring.visible = moon.visible;
    return cycle;
  };
  update(0);
  return update;
}