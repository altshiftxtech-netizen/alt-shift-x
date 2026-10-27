import kineticRangeAssets from '@/components/suite/expansion/kineticRangeAssets';
import kineticDebris from '@/components/suite/expansion/kineticDebris';
import kineticShots from '@/components/suite/expansion/kineticShots';
import laserAimControls from '@/components/suite/expansion/laserAimControls';
import provingGroundEvents from '@/components/suite/expansion/provingGroundEvents';

export default function kineticRange(scene, camera, canvas, reduced, inspection) {
  const assets = kineticRangeAssets(scene), debris = kineticDebris(assets.root);
  inspection.laserTurretCount = assets.turrets.length;
  const selected = () => assets.turrets[Math.max(0, inspection.index % assets.targets.length - 1)];
  const input = laserAimControls(camera, canvas, assets.root, inspection, selected);
  let streak = 0, hits = 0, fired = 0, unlocked = false, lastShot = -1000, previousStats = '';
  const shots = kineticShots(assets.root, () => {
    streak++; hits++;
    if (streak === 100 && !unlocked) { unlocked = true; provingGroundEvents('PROVING_GROUND_DEFENDER_UNLOCK', { streak: 100 }); }
  }, () => { streak = 0; }, reduced);
  const fire = event => {
    if (event) input.move(event);
    if (performance.now() - lastShot < 140) return;
    const turret = selected(), origin = turret.center.clone(), direction = input.aim.clone().sub(origin).normalize();
    shots.fire(origin.addScaledVector(direction, 15.5), input.aim, debris.targets, inspection.scope); fired++; lastShot = performance.now();
  };
  assets.targets.forEach(target => { target.userData.onActivate = () => fire(); });
  return { targets: assets.targets, move: input.move, down(event) { input.down(event); fire(); }, up: input.up, key: input.key, fire,
    camera() { if (inspection.focus === 'kinetic') input.camera(); },
    update(time, dt, inspected) {
      debris.update(time); shots.update(dt); canvas.style.touchAction = inspected ? 'none' : '';
      if (inspected && (input.held || inspection.keyHeld)) fire();
      if (!inspected) { input.up(); inspection.keyHeld = false; }
      assets.reticle.position.copy(input.aim); assets.reticle.visible = inspected && !inspection.scope;
      assets.turrets.forEach((turret, i) => { const active = inspected && turret === selected(); turret.base.visible = !(active && inspection.scope); turret.point(active ? input.aim : debris.targets[i * 2].position, active); });
      const stats = { streak, fired, hits }, key = `${streak}:${fired}:${hits}`;
      if (key !== previousStats) { previousStats = key; inspection.onRangeUpdate?.(stats); }
      canvas.dataset.laserSight = String(Boolean(inspected && inspection.scope)); canvas.dataset.laserHits = String(hits); canvas.dataset.laserTurrets = String(assets.turrets.length);
      return stats;
    },
  };
}