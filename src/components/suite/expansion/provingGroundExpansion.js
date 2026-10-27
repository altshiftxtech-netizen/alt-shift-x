import forestrySector from '@/components/suite/expansion/forestrySector';
import mountainRepository from '@/components/suite/expansion/mountainRepository';
import kineticRange from '@/components/suite/expansion/kineticRange';

export default function provingGroundExpansion(scene, camera, canvas, compact, reduced, inspection) {
  const forestry = forestrySector(scene, compact, reduced), repository = mountainRepository(scene, reduced), kinetic = kineticRange(scene, camera, canvas, reduced);
  forestry.targets.forEach(target => { target.userData.onActivate = () => { inspection.index++; }; });
  return {
    targets: [...forestry.targets, ...repository.targets, kinetic.target],
    move(event) { if (inspection.focus === 'kinetic') kinetic.move(event); },
    click(event) { if (inspection.focus !== 'kinetic') return false; kinetic.fire(event); return true; },
    update(time, dt, timestamp) {
      const phase = forestry.update(time, timestamp, inspection.focus === 'forestry');
      const repositoryState = repository.update(timestamp, inspection.focus === 'repository');
      const range = kinetic.update(time, dt, inspection.focus === 'kinetic');
      canvas.dataset.forestryPhase = String(phase.phase); canvas.dataset.forestryHumans = String(phase.humans);
      canvas.dataset.crimsonVisible = String(repositoryState.crimson); canvas.dataset.repositoryDoorsOpen = String(repositoryState.doorsOpen); canvas.dataset.interceptStreak = String(range.streak); canvas.dataset.inertShots = String(range.fired);
    },
  };
}