import * as THREE from 'three';
import { palette, disposeScene } from '@/components/suite/sleekParts';
import launchVehicle from '@/components/suite/launchVehicle';
import launchPad from '@/components/suite/launchPad';
import launchSequence from '@/components/suite/launchSequence';

export default function createLaunchScene(host, notify) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true'); host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, 1, .1, 200), materials = palette();
  scene.add(new THREE.HemisphereLight('#def5ff', '#2a3e59', 2.5));
  const key = new THREE.DirectionalLight('#ffffff', 3); key.position.set(9, 16, 11); key.castShadow = true;
  key.shadow.mapSize.set(512, 512); Object.assign(key.shadow.camera, { left: -9, right: 9, top: 16, bottom: -9 }); key.shadow.normalBias = .035; scene.add(key);
  const rim = new THREE.DirectionalLight('#73d8ed', 2); rim.position.set(-8, 6, -9); scene.add(rim);
  const vehicle = launchVehicle(scene, materials), pad = launchPad(scene, materials), sequence = launchSequence(vehicle, pad, notify);
  const resize = () => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  let frame, last = 0;
  const render = now => {
    frame = requestAnimationFrame(render); if (document.hidden || now - last < 30) return; last = now;
    const { altitude, state } = sequence.update(now);
    const center = (altitude + 9) / 2;
    const halfFov = Math.min(camera.fov * Math.PI / 360, Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect));
    const distance = Math.max(8.5, center + 3) / Math.sin(halfFov);
    camera.position.set(distance * .48, center + distance * .28, distance * .83); camera.lookAt(0, center, 0);
    renderer.domElement.dataset.phase = state; renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(render);
  return { launch: sequence.launch, dispose() { cancelAnimationFrame(frame); observer.disconnect(); disposeScene(scene); renderer.dispose(); renderer.domElement.remove(); } };
}