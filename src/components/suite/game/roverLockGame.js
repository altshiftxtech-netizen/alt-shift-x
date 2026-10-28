import * as THREE from 'three';
export default function roverLockGame(scene, host, camera, inspection, bridge, actions, vehicles) {
  const rovers = vehicles.filter(t => ['rover', 'transport'].includes(t.userData.kind));
  const drone = vehicles.filter(t => t.userData.kind === 'drone').sort((a, b) => b.userData.stationZ - a.userData.stationZ)[0];
  const target = new THREE.Group(); target.position.set(0, 0, 0); target.userData = { kind: 'rovergame', inspectionDistance: 100, inspectionAimHeight: 2, inspectionDirection: [0, .9, 1.25] }; scene.add(target);
  const mat = new THREE.MeshBasicMaterial({ color: '#65eaff', transparent: true, opacity: .85, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 1, 8), mat); beam.visible = false; scene.add(beam);
  const spot = new THREE.Mesh(new THREE.RingGeometry(2, 2.2, 32), mat); spot.rotation.x = -Math.PI / 2; spot.visible = false; scene.add(spot);
  const point = new THREE.Vector3(), start = new THREE.Vector3(), end = new THREE.Vector3(), delta = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  let lastScored = null, controllingDrone = false;
  const eligible = rover => rover.visible && rover.position.z > -100 && rover.position.z < 115;
  const buttons = rovers.map((rover, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'suite-rover-target'; button.hidden = true;
    button.textContent = String(index + 1); button.setAttribute('aria-label', `Lock rover ${index + 1}`); host.appendChild(button);
    button.onclick = event => { event.stopPropagation(); if (!eligible(rover) || lastScored === rover || actions.current) return;
      actions.start('rover', `rover-${index}`, 'rovergame', () => eligible(rover), () => { lastScored = rover; });
    };
    return { button, rover, index };
  });
  return { target, update() {
    const active = inspection.focus === 'rovergame', action = actions.current;
    const selected = action?.kind === 'rover' ? rovers[Number(action.target.split('-')[1])] : null;
    beam.visible = spot.visible = active && !!selected && action.phase === 'running';
    if (beam.visible) {
      start.copy(drone.position); start.y -= .4; end.copy(selected.position); end.y += 2.5; delta.subVectors(end, start);
      beam.position.copy(start).add(end).multiplyScalar(.5); beam.scale.y = delta.length(); beam.quaternion.setFromUnitVectors(up, delta.normalize());
      spot.position.copy(end); drone.userData.flightGoal = new THREE.Vector3(end.x, end.y + 18, end.z + 12); controllingDrone = true;
    } else if (drone && controllingDrone) { delete drone.userData.flightGoal; controllingDrone = false; }
    for (const { button, rover } of buttons) {
      point.copy(rover.position); point.y += 4; point.project(camera);
      const x = (point.x + 1) * host.clientWidth / 2, y = (1 - point.y) * host.clientHeight / 2;
      button.hidden = !active || !eligible(rover) || point.z < -1 || point.z > 1 || x < 22 || x > host.clientWidth - 22 || y < 110 || y > host.clientHeight - 80;
      button.disabled = !!action || bridge.current.loading || bridge.current.unlocked || lastScored === rover;
      button.style.left = `${x - 22}px`; button.style.top = `${y - 22}px`;
    }
  }, dispose() { buttons.forEach(({ button }) => button.remove()); if (drone) delete drone.userData.flightGoal; } };
}