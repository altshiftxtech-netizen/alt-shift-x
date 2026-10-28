import timedPersonalAction from '@/components/suite/game/timedPersonalAction';
import treePlantingGame from '@/components/suite/game/treePlantingGame';
import roverLockGame from '@/components/suite/game/roverLockGame';
export default function personalGroundGames(scene, host, camera, inspection, bridge, vehicles) {
  const actions = timedPersonalAction(inspection, bridge);
  const trees = treePlantingGame(scene, inspection, bridge, actions);
  const rovers = roverLockGame(scene, host, camera, inspection, bridge, actions, vehicles);
  inspection.personalCancel = actions.cancel;
  const cancel = () => actions.cancel();
  document.addEventListener('visibilitychange', cancel); window.addEventListener('blur', cancel);
  return { targets: [trees.target, rovers.target], update(time, dt) { actions.update(dt); trees.update(time, Math.min(dt, .1)); rovers.update(); },
    dispose() { actions.cancel(); rovers.dispose(); document.removeEventListener('visibilitychange', cancel); window.removeEventListener('blur', cancel); delete inspection.personalPlant; delete inspection.personalCancel; },
  };
}