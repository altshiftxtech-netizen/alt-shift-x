export default function desertCelestialCycle(date = new Date()) {
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600 + date.getMilliseconds() / 3600000;
  // Sunrise at 06:00, sunset at 18:00; the moon follows the opposite half-cycle.
  const phase = (hours - 6) / 24 * Math.PI * 2;
  const position = angle => ({
    x: -135 * Math.cos(angle),
    y: 12 + 42 * Math.sin(angle),
    z: -260,
    visible: Math.sin(angle) >= 0,
  });
  return { sun: position(phase), moon: position(phase + Math.PI) };
}