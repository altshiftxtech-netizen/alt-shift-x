import * as THREE from 'three';

export default function desertDaylight(scene, renderer, sunlight, hemisphere, rim) {
  const nightSky = new THREE.Color('#05080C'), daySky = new THREE.Color('#354D66');
  const nightFog = new THREE.Color('#101820'), dayFog = new THREE.Color('#657D91');
  const nightLight = new THREE.Color('#A7B7C7'), dayLight = new THREE.Color('#FFF1D6');
  return cycle => {
    const amount = cycle.daylight;
    scene.background.copy(nightSky).lerp(daySky, amount);
    scene.fog.color.copy(nightFog).lerp(dayFog, amount);
    renderer.toneMappingExposure = 1.14 + amount * .38;
    hemisphere.intensity = .48 + amount * .9;
    rim.intensity = 1.05 + amount * .3;
    sunlight.intensity = 1.9 + amount * 2.8;
    sunlight.color.copy(nightLight).lerp(dayLight, amount);
    const source = cycle.sun.visible ? cycle.sun : cycle.moon;
    sunlight.position.set(source.x * .4, Math.max(30, source.y), source.z * .3);
  };
}