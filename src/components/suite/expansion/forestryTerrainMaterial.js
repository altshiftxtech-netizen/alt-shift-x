import forestryClock from '@/components/suite/expansion/forestryClock';

export default function forestryTerrainMaterial(material) {
  const phase = { value: forestryClock().phase };
  // Tint the actual terrain instead of laying an intersecting sheet over the dunes.
  material.onBeforeCompile = shader => {
    shader.uniforms.ecologyPhase = phase;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 ecologyXZ;').replace('#include <begin_vertex>', '#include <begin_vertex>\necologyXZ = position.xz;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 ecologyXZ;\nuniform float ecologyPhase;').replace('#include <color_fragment>', `#include <color_fragment>
      float basin = smoothstep(250.0, 264.0, ecologyXZ.x) * (1.0 - smoothstep(536.0, 550.0, ecologyXZ.x));
      basin *= smoothstep(-500.0, -486.0, ecologyXZ.y) * (1.0 - smoothstep(-214.0, -200.0, ecologyXZ.y));
      vec3 soil = ecologyPhase < 1.5 ? vec3(.12, .09, .065) : vec3(.045, .07, .043);
      diffuseColor.rgb = mix(diffuseColor.rgb, soil, basin * .65);
    `);
  };
  material.customProgramCacheKey = () => 'ecological-terrain-v1';
  return () => { phase.value = forestryClock().phase; };
}