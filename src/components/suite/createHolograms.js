import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export default function createHolograms(host, state) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0, 0); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-380, 380, 180, -180, .1, 2000); camera.position.z = 1000;
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(), env = pmrem.fromScene(room); scene.environment = env.texture; room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#c8eaff', '#191226', 3)); const light = new THREE.PointLight('#73dfff', 30000, 1000, 1); light.position.set(-200, 200, 300); scene.add(light);
  const rings = new THREE.Group(); scene.add(rings);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(235 + i * 39, .55, 6, 160), new THREE.MeshBasicMaterial({ color: i === 1 ? '#EAB308' : '#00F5FF', transparent: true, opacity: .22 + i * .04 })); ring.rotation.x = 1.05; rings.add(ring);
  }
  const tickPoints = [];
  for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, r = 314, length = i % 10 === 0 ? 11 : 4; tickPoints.push(Math.cos(a) * r, Math.sin(a) * r * .5, 0, Math.cos(a) * (r + length), Math.sin(a) * (r + length) * .5, 0); }
  const ticks = new THREE.BufferGeometry(); ticks.setAttribute('position', new THREE.Float32BufferAttribute(tickPoints, 3)); rings.add(new THREE.LineSegments(ticks, new THREE.LineBasicMaterial({ color: '#8ecbd9', transparent: true, opacity: .35 })));
  for (let i = 0; i < 12; i++) {
    const canvas = document.createElement('canvas'); canvas.width = 96; canvas.height = 32; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#9dcbd2'; ctx.font = '18px monospace'; ctx.textAlign = 'center'; ctx.fillText(`${i * 30}°`, 48, 23);
    const texture = new THREE.CanvasTexture(canvas), sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: .65, depthTest: true })); const a = i / 12 * Math.PI * 2; sprite.position.set(Math.cos(a) * 344, Math.sin(a) * 172, -1); sprite.scale.set(36, 12, 1); rings.add(sprite);
  }
  const shape = new THREE.Shape(), w = 170, h = 92, r = 12;
  shape.moveTo(-w/2+r,-h/2); shape.lineTo(w/2-r,-h/2); shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r); shape.lineTo(w/2,h/2-r); shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2); shape.lineTo(-w/2+r,h/2); shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); shape.lineTo(-w/2,-h/2+r); shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 1.5, bevelThickness: 1.5, curveSegments: 12 });
  const slabs = state.current.nodes.map(node => {
    const mat = new THREE.MeshPhysicalMaterial({ color: '#101c2c', metalness: .72, roughness: .23, clearcoat: 1, clearcoatRoughness: .16, transparent: true, opacity: .7, emissive: node.color, emissiveIntensity: .035 });
    const mesh = new THREE.Mesh(geo, mat); const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), new THREE.LineBasicMaterial({ color: node.color, transparent: true, opacity: .5 })); mesh.add(edge); scene.add(mesh); return mesh;
  });
  let frame, compact = false, width = 760;
  const resize = () => { const rect = host.getBoundingClientRect(); width = rect.width; compact = window.innerWidth < 640; camera.left = -width/2; camera.right = width/2; camera.top = rect.height/2; camera.bottom = -rect.height/2; camera.updateProjectionMatrix(); renderer.setSize(width, rect.height); };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const animate = () => {
    const { angle, selected } = state.current;
    const rx = compact ? width * .34 : Math.min(280, width * .37), ry = compact ? 86 : 115;
    slabs.forEach((mesh, i) => { const a = (i * 45 + angle) * Math.PI / 180, depth = (Math.sin(a) + 1) / 2, scale = .65 + depth * .5; mesh.position.set(Math.cos(a)*rx, -Math.sin(a)*ry, depth*45); mesh.scale.set(scale * (compact ? 126/170 : 1), scale * (compact ? 78/92 : 1), 1); mesh.rotation.y = -Math.cos(a)*.12; mesh.material.opacity = .22 + depth*.58; mesh.material.emissiveIntensity = i === selected ? .16 : .035; });
    rings.scale.setScalar(compact ? width / 760 : 1); rings.rotation.z = Math.sin(performance.now() * .00008) * .04;
    renderer.render(scene, camera); frame = requestAnimationFrame(animate);
  }; animate();
  return () => { cancelAnimationFrame(frame); observer.disconnect(); const geometries = new Set(), materials = new Set(); scene.traverse(o => { if(o.geometry) geometries.add(o.geometry); if(o.material) materials.add(o.material); }); geometries.forEach(g=>g.dispose()); materials.forEach(m=>{m.map?.dispose();m.dispose();}); env.dispose();renderer.dispose();renderer.domElement.remove(); };
}