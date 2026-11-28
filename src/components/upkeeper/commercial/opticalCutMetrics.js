// Small luma blocks approximate optical motion without decoding every frame.
export default function opticalCutMetrics(now, before, width, height) {
  if (!before) return { motion: 0, cut: false };
  let movement = 0, residual = 0, blocks = 0;
  const shifts = [0, -3, 3];
  for (let y = 6; y < height - 8; y += 9) {
    for (let x = 6; x < width - 8; x += 10) {
      let best = Infinity, vector = 0;
      for (const dy of shifts) for (const dx of shifts) {
        let cost = 0;
        for (let row = 0; row < 6; row += 2) for (let col = 0; col < 6; col += 2) {
          const at = (y + row) * width + x + col;
          cost += Math.abs(now[at] - before[at + dy * width + dx]);
        }
        if (cost < best) { best = cost; vector = Math.hypot(dx, dy); }
      }
      residual += best / 9; movement += vector; blocks++;
    }
  }
  const novelty = residual / blocks;
  return { motion: movement / blocks * 12 + Math.min(23, novelty), cut: novelty > 33 };
}