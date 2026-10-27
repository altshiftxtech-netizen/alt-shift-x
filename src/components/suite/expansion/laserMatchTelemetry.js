export default function laserMatchTelemetry(canvas, root, camera, targets, stats, inspected) {
  canvas.dataset.laserPairs = String(stats.pairs);
  canvas.dataset.laserGoal = String(stats.goal);
  canvas.dataset.laserComplete = String(stats.complete);
  if (!inspected) { delete canvas.dataset.laserTargets; return; }
  const rect = canvas.getBoundingClientRect();
  canvas.dataset.laserTargets = JSON.stringify(targets.map((target, id) => {
    const point = target.position.clone().add(root.position).project(camera);
    return { id, color: target.colorIndex, active: target.active, selected: target.selected,
      x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 };
  }));
}