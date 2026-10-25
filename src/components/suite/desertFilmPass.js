import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export default function desertFilmPass() {
  return new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main() {
        vec4 sampleColor = texture2D(tDiffuse, vUv);
        vec3 color = sampleColor.rgb;
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luminance), color, 0.94);
        float shadows = 1.0 - smoothstep(0.02, 0.42, luminance);
        float highlights = smoothstep(0.3, 1.5, luminance);
        color *= mix(vec3(1.0), vec3(0.94, 1.015, 1.045), shadows * 0.45);
        color *= mix(vec3(1.0), vec3(1.055, 1.015, 0.97), highlights * 0.5);
        vec2 centered = vUv * 2.0 - 1.0;
        float vignette = 1.0 - 0.14 * smoothstep(0.35, 1.65, dot(centered, centered));
        gl_FragColor = vec4(max(color * vignette, vec3(0.0)), sampleColor.a);
      }
    `,
  });
}