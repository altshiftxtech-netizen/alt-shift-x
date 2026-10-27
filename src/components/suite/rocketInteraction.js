import * as THREE from 'three';

export default function rocketInteraction(host, vehicle, camera, inspection, onClick) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'suite-rocket-hit';
  button.setAttribute('aria-label', 'Launch rocket'); button.title = 'Launch rocket · add fuel toward the 100-pressure reward'; button.hidden = true; host.appendChild(button);
  const click = event => { event.stopPropagation(); onClick(); }; button.addEventListener('click', click);
  const corners = [];
  for (const x of [-1, 1]) for (const y of [-1.8, 8.1]) for (const z of [-1, 1]) corners.push(new THREE.Vector3(x, y, z));
  const projected = new THREE.Vector3();
  return {
    update() {
      const width = host.clientWidth, height = host.clientHeight;
      let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity, inFront = false;
      for (const corner of corners) {
        projected.copy(corner).applyMatrix4(vehicle.matrixWorld).project(camera);
        inFront ||= projected.z > -1 && projected.z < 1;
        const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      button.hidden = !inFront || right < 0 || left > width || bottom < 0 || top > height;
      if (button.hidden) return;
      const w = Math.max(44, right - left), h = Math.max(44, bottom - top);
      Object.assign(button.style, { left: `${(left + right - w) / 2}px`, top: `${(top + bottom - h) / 2}px`, width: `${w}px`, height: `${h}px` });
    },
    dispose() { button.removeEventListener('click', click); button.remove(); },
  };
}