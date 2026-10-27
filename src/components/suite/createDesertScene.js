import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import desertTerrain from '@/components/suite/desertTerrain';
import desertVehicles from '@/components/suite/desertVehicles';
import desertAtmosphere from '@/components/suite/desertAtmosphere';
import desertDaylight from '@/components/suite/desertDaylight';
import desertAerospace from '@/components/suite/desertAerospace';
import desertInspectionCamera from '@/components/suite/desertInspectionCamera';
import desertRocket from '@/components/suite/desertRocket';
import desertFilmPass from '@/components/suite/desertFilmPass';
import desertCinemaSky from '@/components/suite/desertCinemaSky';
import desertRenderQuality from '@/components/suite/desertRenderQuality';
import { palette } from '@/components/suite/sleekParts';
import vehicleSignals from '@/components/suite/vehicleSignals';
import droneCursorFlight from '@/components/suite/droneCursorFlight';
import rocketDemoEffects from '@/components/suite/game/rocketDemoEffects';
import provingGroundExpansion from '@/components/suite/expansion/provingGroundExpansion';

export default function createDesertScene(host, onStatus, inspection, game, robotWave) {
  const compact = window.innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'high-performance' });
  // Start at display resolution instead of allocating a supersampled frame before first paint.
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D desert reconnaissance, move cursor to fly an inspected drone, click drones for lasers and rovers for transmissions');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05080C'); scene.fog = new THREE.FogExp2('#101820', .003);
  const camera = new THREE.PerspectiveCamera(52, 1, .3, 22000); camera.position.set(0, 45, 80); camera.lookAt(0, 0, -42);
  const environment = new RoomEnvironment(); const pmrem = new THREE.PMREMGenerator(renderer); const env = pmrem.fromScene(environment, .06); scene.environment = env.texture; environment.dispose(); pmrem.dispose();
  const hemisphere = new THREE.HemisphereLight('#8294A8', '#080D12', .65); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight('#A7B7C7', 1.5); sun.position.set(-100, 55, -75); sun.castShadow = true; sun.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048); sun.shadow.autoUpdate = true; sun.shadow.normalBias = .16; sun.shadow.radius = 2; Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, far: 280 }); sun.shadow.bias = -.0002; scene.add(sun);
  const rim = new THREE.DirectionalLight('#45596B', .65); rim.position.set(80, 25, 35); scene.add(rim);
  const routes = desertTerrain(scene, compact, renderer.capabilities.getMaxAnisotropy()), vehicles = desertVehicles(scene, routes, compact), updateAtmosphere = desertAtmosphere(scene, camera, inspection);
  const updateDaylight = desertDaylight(scene, renderer, sun, hemisphere, rim);
  const updateSky = desertCinemaSky(scene, camera);
  const aerospace = desertAerospace(scene, palette(), compact);
  const rocket = desertRocket(scene, state => { renderer.domElement.dataset.rocketPhase = state; game?.current.onPhase?.(state); });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const expansion = provingGroundExpansion(scene, camera, renderer.domElement, compact, reduced, inspection);
  const targets = [...vehicles.targets, ...aerospace.targets, rocket.target, ...expansion.targets];
  const updateSignals = vehicleSignals(scene, vehicles.targets);
  const flight = droneCursorFlight(camera, renderer.domElement, inspection);
  // Avoid multisampled HDR resolves: use full-frame postprocess edge smoothing instead.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let contactShadows = null;
  if (host.clientWidth >= 1100) {
    contactShadows = new SSAOPass(scene, camera, 400, 300, 8);
    contactShadows.kernelRadius = 4; contactShadows.minDistance = .002; contactShadows.maxDistance = .07;
    composer.addPass(contactShadows);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(800, 600), .22, .45, 1.05); composer.addPass(bloom); composer.addPass(desertFilmPass()); composer.addPass(new OutputPass());
  const antialias = new ShaderPass(FXAAShader); composer.addPass(antialias);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let hovered = null, elapsed = 0, frame = 0, last = 0, lastStatus = 0, sampleFrames = 0, sampleTime = 0;
  const demoEffects = rocketDemoEffects(scene, rocket.target, reduced);
  const quality = desertRenderQuality(host, renderer, composer, antialias, contactShadows);
  const resize = () => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); quality.resize(); rocket.resize(camera.aspect); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const interactionSurface = host.closest('.suite-cinematic');
  let pointerDown = null;
  const down = event => { pointerDown = [event.clientX, event.clientY]; if (!event.target.closest?.('button,a,select,input,.suite-ground-controls,header,footer')) expansion.down(event); };
  const up = () => expansion.up(), keyDown = event => expansion.key(event, true), keyUp = event => expansion.key(event, false);
  const pick = event => {
    if (event.target.closest?.('button,a,select,input')) return null;
    if (event.target !== renderer.domElement && !event.target.closest?.('.suite-orbit')) return null;
    const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(targets.filter(target => target.visible), true);
    for (const hit of hits) { let object = hit.object; while (object && !object.userData.kind) object = object.parent; if (object) return object; }
    return null;
  };
  const activate = (target, hover = false) => { if (!target || (hover && !['drone', 'aircraft'].includes(target.userData.kind))) return; target.userData.activation = reduced ? elapsed * .12 : elapsed; if (target.userData.kind === 'rocket') { if (game) game.current.fuel(); else target.userData.launch(); } if (!hover) target.userData.onActivate?.(); if (!hover && target.userData.isRobot) robotWave?.current?.(target.userData.robotId); onStatus(`${target.userData.kind} responding`); lastStatus = performance.now(); };
  const updateCamera = desertInspectionCamera(camera, targets, inspection, activate);
  const move = event => { if (!event.target.closest?.('button,a,select,input,.suite-ground-controls,header,footer')) expansion.move(event); const target = pick(event); flight.move(event, target); renderer.domElement.style.cursor = target || inspection.focus === 'drone' ? 'crosshair' : 'default'; if (target !== hovered) { hovered = target; activate(target, true); } };
  const click = event => { if (pointerDown && Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) > 6) return; if (event.target.closest?.('button,a,select,input,.suite-ground-controls,header,footer')) return; if (event.target === renderer.domElement && expansion.click(event)) return; activate(pick(event)); };
  interactionSurface.addEventListener('pointerdown', down); interactionSurface.addEventListener('pointermove', move); interactionSurface.addEventListener('click', click); interactionSurface.addEventListener('pointerleave', flight.release);
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up); window.addEventListener('blur', up); window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp);
  const animate = now => {
    frame = requestAnimationFrame(animate);
    if (document.hidden) { last = now; return; }
    const realDt = last ? (now - last) / 1000 : .016;
    const dt = Math.min(realDt, .05); last = now; elapsed += dt;
    const time = reduced ? elapsed * .12 : elapsed;
    vehicles.update(time, reduced ? dt * .12 : dt);
    const cycle = updateAtmosphere(time); updateDaylight(cycle); updateSky(cycle); aerospace.update(time, cycle.daylight);
    scene.fog.density = ['forestry', 'repository', 'kinetic'].includes(inspection.focus) ? .0012 : .003;
    if (game?.current.launchRequested) { game.current.launchRequested = false; rocket.launchDemo(); demoEffects.start(now); }
    const rocketState = rocket.update(now);
    expansion.update(time, reduced ? dt * .12 : dt, Date.now());
    updateCamera(time, dt);
    expansion.camera();
    routes.updateHorizon(camera);
    renderer.domElement.dataset.celestialsVisible = String(camera.userData.celestialsVisible);
    flight.update();
    renderer.domElement.dataset.vehicleSignal = updateSignals(time);
    renderer.domElement.dataset.inspectionPosition = inspection.target?.position.toArray().map(value => value.toFixed(2)).join(',') || '';
    renderer.domElement.dataset.inspectionKind = inspection.target?.userData.kind || 'wide';
    renderer.domElement.dataset.inspectionId = inspection.target?.uuid || '';
    renderer.domElement.dataset.inspectionGrounded = String(inspection.target?.userData.kind === 'rover' && inspection.target.visible && inspection.target.userData.rendered);

    const shake = demoEffects.update(now, rocketState);
    camera.position.add(shake);
    renderer.setScissorTest(false);
    composer.render();
    camera.position.sub(shake);
    quality.sample(realDt);
    sampleFrames++; sampleTime += realDt;
    if (sampleTime > 2) {
      const fps = sampleFrames / sampleTime;
      if (performance.now() - lastStatus > 4000) onStatus(`WEBGL / ${Math.round(fps)} FPS / LOCAL EXECUTION / $0 CLOUD TOKENS`);
      sampleFrames = 0; sampleTime = 0;
    }
    renderer.domElement.dataset.rendered = 'true';
  };
  frame = requestAnimationFrame(animate);
  return () => {
    window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); window.removeEventListener('blur', up); window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp);
    cancelAnimationFrame(frame); observer.disconnect(); interactionSurface.removeEventListener('pointerdown', down); interactionSurface.removeEventListener('pointermove', move); interactionSurface.removeEventListener('click', click); interactionSurface.removeEventListener('pointerleave', flight.release); flight.release();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => { materials.add(m); Object.values(m).forEach(value => { if (value?.isTexture) textures.add(value); }); }); });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); env.dispose(); composer.passes.forEach(p => p.dispose?.()); composer.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
}