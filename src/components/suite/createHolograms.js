import * as THREE from 'three';
import holographicEmblems from '@/components/suite/holographicEmblems';
import suiteOrbitLayout from '@/components/suite/suiteOrbitLayout';
import hologramPalettes from '@/components/suite/hologramPalettes';
import magnaHologramTexture from '@/components/suite/magnaHologramTexture';

export default function createHolograms(host, state) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-500, 500, 160, -160, .1, 2000); camera.position.z = 1000;
  const rings = new THREE.Group(); scene.add(rings);
  for (let i = 0; i < 3; i++) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(280 + i * 15, .35, 4, 140), new THREE.MeshBasicMaterial({ color: i === 1 ? '#EAB308' : '#00F5FF', transparent: true, opacity: .14 }));
    mesh.rotation.x = 1.38; rings.add(mesh);
  }
  const geometry = new THREE.PlaneGeometry(1, 1), loader = new THREE.TextureLoader(), textures = [];
  let disposed = false, ready = 0, frame, width = 950;
  const emblems = state.current.nodes.map(node => {
    const palette = hologramPalettes[node.id];
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { image: { value: null }, strength: { value: 1 }, opacity: { value: 1 }, brandLeft: { value: new THREE.Color(palette.left).convertLinearToSRGB() }, brandRight: { value: new THREE.Color(palette.right).convertLinearToSRGB() }, iridescence: { value: palette.iridescence || 0 } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform sampler2D image; uniform float strength; uniform float opacity; uniform vec3 brandLeft; uniform vec3 brandRight; uniform float iridescence; varying vec2 vUv; void main(){vec3 ink=texture2D(image,vUv).rgb;float light=max(ink.r,max(ink.g,ink.b));float alpha=smoothstep(.035,.19,light);if(alpha<.01)discard;float shade=mix(dot(ink,vec3(.299,.587,.114)),light,.65);vec3 brand=mix(brandLeft,brandRight,smoothstep(.2,.8,vUv.x));vec3 prism=.5+.5*sin(vec3(0.,2.,4.)+vUv.x*6.);brand=mix(brand,prism,iridescence);ink=brand*shade+vec3(smoothstep(.72,1.,light)*.16*shade);float scan=.96+.04*sin(vUv.y*620.0);gl_FragColor=vec4(ink*strength*scan,alpha*opacity);}' });
    const group = new THREE.Group(), image = new THREE.Mesh(geometry, material); group.add(image); group.visible = false; scene.add(group);
    const texture = loader.load(holographicEmblems[node.id], loaded => {
      if (disposed) { loaded.dispose(); return; }
      const emblem = node.id === 'magna' ? magnaHologramTexture(loaded.image) : loaded;
      if (emblem !== loaded) textures.push(emblem);
      material.uniforms.image.value = emblem; group.visible = true; renderer.domElement.dataset.emblemsReady = String(++ready);
    }); textures.push(texture);
    return { group, material };
  });
  const resize = () => {
    const rect = host.getBoundingClientRect(); width = rect.width;
    camera.left = -width / 2; camera.right = width / 2; camera.top = rect.height / 2; camera.bottom = -rect.height / 2; camera.updateProjectionMatrix(); renderer.setSize(width, rect.height);
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const animate = () => {
    const { angle, selected, nodes } = state.current, layout = suiteOrbitLayout(width);
    emblems.forEach(({ group, material }, index) => {
      const { x, y, depth, scale, size } = suiteOrbitLayout(width, index, angle, nodes.length);
      group.position.set(x, -y, depth * 50); group.scale.set(size * scale, size * scale, 1);
      group.rotation.y = -Math.cos((index * 360 / nodes.length + angle) * Math.PI / 180) * .16;
      material.uniforms.opacity.value = .5 + depth * .5; material.uniforms.strength.value = selected === index ? 1.5 : 1.15;
    });
    rings.scale.set(layout.radiusX / 280, layout.radiusY / 53, 1);
    renderer.render(scene, camera); renderer.domElement.dataset.rendered = 'true'; frame = requestAnimationFrame(animate);
  }; animate();
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); geometry.dispose(); textures.forEach(t => t.dispose()); emblems.forEach(e => e.material.dispose());
    rings.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); renderer.dispose(); renderer.domElement.remove();
  };
}