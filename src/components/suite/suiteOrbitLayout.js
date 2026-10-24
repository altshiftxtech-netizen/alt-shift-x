export default function suiteOrbitLayout(width, index = 0, angle = 90, count = 8) {
  const compact = width < 640, radians = (index * 360 / count + angle) * Math.PI / 180;
  const depth = (Math.sin(radians) + 1) / 2;
  const radiusX = width * (compact ? .36 : .41), radiusY = compact ? 44 : 58;
  return { radiusX, radiusY, x: Math.cos(radians) * radiusX, y: Math.sin(radians) * radiusY, depth, scale: .72 + depth * .32, size: compact ? 98 : 158 };
}