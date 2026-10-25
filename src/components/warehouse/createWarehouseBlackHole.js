import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/components/warehouse/blackHoleShader';

export default function createWarehouseBlackHole(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true'); host.appendChild(canvas);
  const scene = new THREE.Scene(), camera = new THREE.Camera();
  const uniforms = { resolution: { value: new THREE.Vector2() }, pointer: { value: new THREE.Vector2() }, time: { value: 0 }, pulse: { value: 0 } };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const geometry = new THREE.PlaneGeometry(2, 2); scene.add(new THREE.Mesh(geometry, material));
  const target = new THREE.Vector2(), size = new THREE.Vector2();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame, previous = 0, elapsed = 0, pulseAge = 9, sample = 0, slowFrames = 0;
  let ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2);
  const resize = () => {
    renderer.setPixelRatio(ratio); renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.getDrawingBufferSize(size); uniforms.resolution.value.copy(size);
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const move = e => {
    target.set(e.clientX / window.innerWidth * 2 - 1, 1 - e.clientY / window.innerHeight * 2);
    host.dataset.interaction = 'orbit';
  };
  const press = e => {
    if (e.target.closest('button,a,input,select,textarea,[role="dialog"]')) return;
    move(e); pulseAge = 0; host.dataset.interaction = 'gravity-pulse';
  };
  const leave = () => target.set(0, 0);
  const surface = host.parentElement;
  surface.addEventListener('pointermove', move, { passive: true });
  surface.addEventListener('pointerdown', press, { passive: true }); surface.addEventListener('pointerleave', leave);
  const render = now => {
    frame = requestAnimationFrame(render);
    if (document.hidden) { previous = now; return; }
    const raw = previous ? (now - previous) / 1000 : .016, dt = Math.min(raw, .05); previous = now;
    elapsed += dt; pulseAge += dt; uniforms.time.value = elapsed * (reduced.matches ? .06 : 1);
    uniforms.pointer.value.lerp(target, 1 - Math.exp(-dt * 3)); uniforms.pulse.value = reduced.matches ? 0 : Math.min(pulseAge / 2.8, 1);
    renderer.render(scene, camera); host.dataset.rendered = 'true';
    if (++sample < 150 && raw > .04) slowFrames++;
    if (sample === 150 && slowFrames > 75 && ratio > 1) { ratio = 1; resize(); }
  };
  frame = requestAnimationFrame(render);
  return () => {
    cancelAnimationFrame(frame); observer.disconnect(); surface.removeEventListener('pointermove', move);
    surface.removeEventListener('pointerdown', press); surface.removeEventListener('pointerleave', leave);
    geometry.dispose(); material.dispose(); renderer.dispose(); canvas.remove();
  };
}