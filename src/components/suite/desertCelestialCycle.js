export default function desertCelestialCycle(date = new Date()) {
  const eastern = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  const hours = eastern.getUTCHours() + eastern.getUTCMinutes() / 60 + eastern.getUTCSeconds() / 3600 + eastern.getUTCMilliseconds() / 3600000;
  // Sunrise at 06:00, sunset at 18:00; the moon follows the opposite half-cycle.
  const phase = (hours - 6) / 24 * Math.PI * 2;
  const position = angle => ({
    x: -135 * Math.cos(angle),
    y: 12 + 42 * Math.sin(angle),
    z: -260,
    visible: Math.sin(angle) >= 0,
  });
  const elevation = Math.max(0, Math.sin(phase));
  const daylight = elevation * elevation * (3 - 2 * elevation);
  return { sun: position(phase), moon: position(phase + Math.PI), daylight };
}