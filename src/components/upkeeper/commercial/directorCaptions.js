// Word-level caption model and the burned-in caption painter. Captions are
// drawn straight to the canvas so they stay vector-crisp and can be re-edited
// word by word without re-rendering the visuals.

const TECHNICAL =
  /\b(make|git|npm|npx|docker|gpu|webgpu|cpu|soc|pi5|n100|esp32|api|cli|ssh|json|thermal|thermals|watt|watts|fps|bench|benchmark|command|terminal)\b/i;

const STOPWORDS = new Set([
  'A', 'An', 'The', 'And', 'But', 'Or', 'To', 'Of', 'In', 'On', 'It', 'Is', 'At',
  'For', 'With', 'As', 'So', 'We', 'You', 'This', 'That', 'Every', 'Not',
]);

export function wordsFromText(text, accent = '#00e5ff') {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((raw) => {
      const bare = raw.replace(/[^A-Za-z0-9]/g, '');
      const emphasis =
        TECHNICAL.test(bare) ||
        /\d/.test(bare) ||
        (bare.length > 1 && bare === bare.toUpperCase() && !STOPWORDS.has(bare));
      return { w: raw, e: emphasis, c: accent };
    });
}

export const captionText = (words) => (words || []).map((x) => x.w).join(' ');

export const CAPTION_FONT = (size) =>
  `900 ${size}px "Inter", "Helvetica Neue", Arial, sans-serif`;

// Wrap the words into lines inside `maxWidth`, returning positioned boxes.
function layout(ctx, words, maxWidth, size, lineHeight) {
  ctx.font = CAPTION_FONT(size);
  const space = ctx.measureText(' ').width;
  const lines = [];
  let line = { items: [], width: 0 };
  words.forEach((word, i) => {
    const width = ctx.measureText(word.w).width;
    const next = line.width + (line.items.length ? space : 0) + width;
    if (next > maxWidth && line.items.length) {
      lines.push(line);
      line = { items: [], width: 0 };
    }
    const x = line.width + (line.items.length ? space : 0);
    line.items.push({ i, x, width, word });
    line.width = x + width;
  });
  if (line.items.length) lines.push(line);
  return { lines, lineHeight, space };
}

/**
 * Paint animated captions. Words reveal progressively across the beat and the
 * active word is punched in the accent colour.
 * Returns hit rectangles in canvas pixels for click-to-edit.
 */
export function paintCaptions(ctx, box, words, progress, options = {}) {
  if (!words?.length) return [];
  const size = options.size || Math.round(box.w * 0.062);
  const lineHeight = size * 1.16;
  const maxWidth = box.w - size * 0.6;
  const accentDefault = options.accent || '#00e5ff';
  const revealed = Math.max(1, Math.ceil(progress * words.length));

  const { lines } = layout(ctx, words, maxWidth, size, lineHeight);
  const blockHeight = lines.length * lineHeight;
  const bottom = box.y + box.h - size * 0.5;
  const top = bottom - blockHeight;

  const hits = [];
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  lines.forEach((line, li) => {
    const baseline = top + li * lineHeight + size * 0.86;
    const left = box.x + (box.w - line.width) / 2;

    // Legibility plate behind each line.
    ctx.fillStyle = 'rgba(4, 8, 12, 0.62)';
    const padX = size * 0.22;
    const padY = size * 0.14;
    const plate = { x: left - padX, y: baseline - size * 0.92, w: line.width + padX * 2, h: size * 1.18 + padY };
    const radius = Math.min(14, size * 0.16);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(plate.x, plate.y, plate.w, plate.h, radius);
    else ctx.rect(plate.x, plate.y, plate.w, plate.h);
    ctx.fill();

    line.items.forEach((item) => {
      const index = item.i;
      if (index >= revealed) return;
      const active = index === revealed - 1;
      const word = item.word;
      const x = left + item.x;
      const colour = word.c || accentDefault;

      ctx.font = CAPTION_FONT(size);
      if (active) {
        ctx.save();
        ctx.translate(x + item.width / 2, baseline - size * 0.32);
        ctx.scale(1.06, 1.06);
        ctx.translate(-(x + item.width / 2), -(baseline - size * 0.32));
      }
      if (word.e || active) {
        ctx.fillStyle = colour;
        ctx.shadowColor = colour;
        ctx.shadowBlur = active ? size * 0.5 : size * 0.24;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = size * 0.18;
      }
      ctx.fillText(word.w, x, baseline);
      ctx.restore();

      hits.push({
        i: index,
        x: x * (options.scale || 1),
        y: (baseline - size * 0.95) * (options.scale || 1),
        w: item.width * (options.scale || 1),
        h: size * 1.25 * (options.scale || 1),
      });
    });
  });

  ctx.restore();
  return hits;
}