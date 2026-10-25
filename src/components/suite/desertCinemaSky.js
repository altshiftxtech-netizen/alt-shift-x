import * as THREE from 'three';

export default function desertCinemaSky(scene) {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { daylight: { value: 0 }, source: { value: new THREE.Vector3(-.4, .2, -1).normalize() } },
    vertexShader: `varying vec3 direction;
      void main() { direction = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 direction;
      uniform float daylight;
      uniform vec3 source;
      void main() {
        vec3 ray = normalize(direction);
        float elevation = max(ray.y, 0.0);
        float horizon = exp(-elevation * 9.0);
        vec3 zenith = mix(vec3(.003, .007, .016), vec3(.065, .14, .25), daylight);
        vec3 haze = mix(vec3(.055, .079, .105), vec3(.36, .40, .43), daylight);
        vec3 sky = mix(zenith, haze, horizon * .85);
        float alignment = max(dot(ray, source), 0.0);
        float glow = pow(alignment, 24.0) * .06 + pow(alignment, 180.0) * .16;
        sky += mix(vec3(.30, .43, .55), vec3(1.0, .67, .36), daylight) * glow;
        float cloud = sin(ray.x * 13.0 + ray.z * 8.0 + sin(ray.z * 19.0) * .8);
        cloud *= sin(ray.z * 27.0 - ray.x * 7.0) * .5 + .5;
        sky += vec3(.012, .017, .023) * smoothstep(.25, .95, cloud) * horizon;
        gl_FragColor = vec4(sky, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(780, 32, 16), material);
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  return cycle => {
    material.uniforms.daylight.value = cycle.daylight;
    const body = cycle.sun.visible ? cycle.sun : cycle.moon;
    material.uniforms.source.value.set(body.x, body.y, body.z).normalize();
  };
}