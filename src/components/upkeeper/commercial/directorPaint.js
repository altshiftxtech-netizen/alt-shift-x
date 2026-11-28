// The frame compositor. One function paints any moment of the commercial:
// beat visual, camera move, lighting grade, proof readout, CTA crest, burned-in
// captions and the timeline rule. Used by the preview and by the recorder.

import { beatAt, totalSeconds } from '@/components/upkeeper/commercial/directorPlan';
import { paintHardware, paintTerminal, paintLightingWash, LIGHT_TINT } from '@/components/upkeeper/commercial/directorBroll';
import { drawBadge } from '@/components/upkeeper/commercial/crystalBadge';
import { paintCaptions } from '@/components/upkeeper/commercial/directorCaptions';

export const stageSize = (aspect, shortEdge = 1080) =>
  aspect === '16:9'
    ? { width: Math.round((shortEdge * 16) / 9), height: shortEdge }
    : { width: shortEdge, height: Math.round((shortEdge * 16) / 9) };

const DESIGN = (aspect) =>
  aspect === '16:9' ? { w: 1920, h: 1080 } : { w: 1080, h: 1920 };

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function camera(ctx, w, h, move, p) {
  const cx = w / 2;
  const cy = h / 2;
  switch (move) {
    case 'Push-in':
      ctx.translate(cx, cy);
      ctx.scale(1 + 0.13 * p, 1 + 0.13 * p);
      ctx.translate(-cx, -cy);
      break;
    case 'Orbit':
      ctx.translate(cx, cy);
      ctx.rotate((p - 0.5) * 0.05);
      ctx.scale(1.14, 1.14);
      ctx.translate(-cx, -cy);
      break;
    case 'FPV tracking':
      ctx.translate(-w * 0.04 + p * w * 0.08, 0);
      ctx.scale(1.14, 1.14);
      break;
    case 'Macro rack':
      ctx.translate(cx, cy);
      ctx.scale(1.3 - 0.18 * p, 1.3 - 0.18 * p);
      ctx.translate(-cx, -cy);
      break;
    case 'Crane rise':
      ctx.translate(0, h * 0.03 - p * h * 0.06);
      ctx.scale(1.12 + 0.06 * p, 1.12 + 0.06 * p);
      break;
    default:
      break;
  }
}

function motionStreaks(ctx, w, h, p, accent) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 9; i += 1) {
    const y = (h / 9) * i + ((p * h * 1.4 + i * 37) % h);
    ctx.fillStyle = `rgba(180,240,255,${0.05 + (i % 3) * 0.02})`;
    ctx.fillRect(0, y % h, w, 2);
  }
  ctx.restore();
}

function grid(ctx, w, h, accent) {
  ctx.save();
  ctx.strokeStyle = 'rgba(120,200,230,0.07)';
  ctx.lineWidth = 1;
  const step = w / 26;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function proofOverlay(ctx, w, h, p, plan, accent) {
  const metric = String(plan.prompt || '').match(/(-?\d+(?:\.\d+)?)\s*(°C|C\b|%|fps)/i);
  const label = metric ? metric[2].toUpperCase() : '';
  const value = metric ? metric[1] : '';
  const wide = w > h;
  const panelW = wide ? w * 0.34 : w * 0.78;
  const panelX = wide ? w * 0.06 : w * 0.11;
  const panelY = wide ? h * 0.14 : h * 0.1;
  const bars = [
    { name: 'THERMAL', v: 0.42 },
    { name: 'CLOCK', v: 0.76 },
    { name: 'POWER', v: 0.61 },
  ];

  ctx.save();
  ctx.fillStyle = 'rgba(5,10,14,0.72)';
  rounded(ctx, panelX, panelY, panelW, wide ? h * 0.42 : h * 0.24, 18);
  ctx.fill();
  ctx.strokeStyle = `${accent}55`;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (metric) {
    ctx.fillStyle = accent;
    ctx.font = `900 ${Math.round(panelW * 0.26)}px "Inter", Arial, sans-serif`;
    ctx.fillText(value, panelX + panelW * 0.08, panelY + panelW * 0.24);
    const vw = ctx.measureText(value).width;
    ctx.font = `700 ${Math.round(panelW * 0.075)}px "Inter", Arial, sans-serif`;
    ctx.fillStyle = 'rgba(220,240,250,0.8)';
    ctx.fillText(label, panelX + panelW * 0.08 + vw + panelW * 0.03, panelY + panelW * 0.22);
  } else {
    ctx.fillStyle = 'rgba(220,240,250,0.85)';
    ctx.font = `800 ${Math.round(panelW * 0.075)}px "Inter", Arial, sans-serif`;
    ctx.fillText('BENCH READOUT', panelX + panelW * 0.08, panelY + panelW * 0.13);
  }

  const baseY = panelY + (wide ? h * 0.24 : h * 0.13);
  bars.forEach((bar, i) => {
    const by = baseY + i * (wide ? h * 0.055 : h * 0.038);
    const bw = panelW * 0.84;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(panelX + panelW * 0.08, by, bw, 10);
    const grow = Math.min(1, Math.max(0, (p - i * 0.12) / 0.5));
    ctx.fillStyle = i === 0 ? accent : 'rgba(255,255,255,0.55)';
    ctx.fillRect(panelX + panelW * 0.08, by, bw * bar.v * grow, 10);
    ctx.fillStyle = 'rgba(200,225,240,0.65)';
    ctx.font = `700 ${Math.round(panelW * 0.042)}px "Inter", Arial, sans-serif`;
    ctx.fillText(bar.name, panelX + panelW * 0.08, by - 10);
  });
  ctx.restore();
}

function crest(ctx, w, h, p, plan, emblem, accent) {
  const cx = w / 2;
  ctx.fillStyle = '#05080b';
  ctx.fillRect(-w * 0.2, -h * 0.2, w * 1.4, h * 1.4);
  const glow = ctx.createRadialGradient(cx, h * 0.42, 0, cx, h * 0.42, Math.max(w, h) * 0.55);
  glow.addColorStop(0, `${accent}33`);
  glow.addColorStop(0.5, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const size = Math.min(w, h) * 0.3 * (0.92 + p * 0.08);
  if (emblem) {
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 60;
    ctx.globalAlpha = Math.min(1, p * 2.4);
    ctx.drawImage(emblem, cx - size / 2, h * 0.26 - size / 2, size, size);
    ctx.restore();
  }

  const mark = (plan.wordmark || 'THE PRODUCT').toUpperCase();
  const size2 = Math.min(w * 0.11, (w * 0.86) / Math.max(1, mark.length * 0.62));
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.round(size2)}px "Inter", Arial, sans-serif`;
  ctx.fillText(mark, cx, h * 0.62);

  ctx.fillStyle = accent;
  const ruleW = w * 0.18 * Math.min(1, p * 2);
  ctx.fillRect(cx - ruleW / 2, h * 0.65, ruleW, 5);

  if (plan.command) {
    ctx.fillStyle = 'rgba(214,226,234,0.82)';
    ctx.font = `700 ${Math.round(w * 0.032)}px "JetBrains Mono", Menlo, monospace`;
    ctx.fillText(`$ ${plan.command}`, cx, h * 0.71);
  }
  ctx.textAlign = 'left';
}



/**
 * Paint one frame. Returns the caption hit boxes in canvas pixels.
 */
export function paintDirectorFrame(canvas, time, plan, assets = {}) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { w, h } = DESIGN(plan.aspect);
  const scale = width / w;
  const beat = beatAt(plan, time);
  const current = plan.beats[beat.index] || plan.beats[0];
  const p = Math.max(0, Math.min(1, beat.local / beat.duration));
  const accent = current.accent || '#00e5ff';
  const tint = LIGHT_TINT[current.lighting] || LIGHT_TINT['Obsidian dark mode'];

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = tint.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  camera(ctx, w, h, current.camera, p);

  if (beat.index === 1) {
    ctx.fillStyle = '#05080b';
    ctx.fillRect(-w * 0.2, -h * 0.2, w * 1.4, h * 1.4);
    grid(ctx, w, h, accent);
    const wide = w > h;
    const box = wide
      ? { x: w * 0.09, y: h * 0.2, w: w * 0.82, h: h * 0.55 }
      : { x: w * 0.06, y: h * 0.2, w: w * 0.88, h: h * 0.36 };
    const command = current.command || plan.command || 'make edge-optimize';
    paintTerminal(
      ctx,
      box,
      [command, '✓ thermal envelope nominal', '✓ clock held at target', '→ run the bench, not the slide'],
      Math.min(1, p * 1.25),
      accent
    );
  } else if (beat.index === 2) {
    paintHardware(ctx, current.broll, w, h, p, current.lighting);
    proofOverlay(ctx, w, h, p, plan, accent);
  } else if (beat.index === 3) {
    crest(ctx, w, h, p, plan, assets.emblem, accent);
  } else {
    paintHardware(ctx, current.broll, w, h, p, current.lighting);
    // Problem beat: a warm pressure wash over the cold macro plate.
    const heat = ctx.createLinearGradient(0, h, w, 0);
    heat.addColorStop(0, 'rgba(255,90,40,0.28)');
    heat.addColorStop(0.6, 'rgba(255,90,40,0)');
    ctx.fillStyle = heat;
    ctx.fillRect(0, 0, w, h);
  }

  if (current.camera === 'FPV tracking') motionStreaks(ctx, w, h, p, accent);
  ctx.restore();

  paintLightingWash(ctx, w, h, current.lighting, 0.8);

  // Timeline rule.
  const total = totalSeconds(plan) || 1;
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillStyle = accent;
  ctx.fillRect(0, h - 8, w * Math.min(1, time / total), 8);



  // Landscape captions sit lower so they clear the terminal plate.
  const captionBox = w > h
    ? { x: w * 0.06, y: h * 0.66, w: w * 0.88, h: h * 0.27 }
    : { x: w * 0.06, y: h * 0.63, w: w * 0.88, h: h * 0.29 };
  const hits = paintCaptions(ctx, captionBox, current.words, p, {
    accent,
    size: Math.round(w * (w > h ? 0.036 : 0.062)),
    scale,
  });

  drawBadge(ctx, w, h, assets.badge);
  return hits;
}

export function paintBeatPoster(canvas, plan, index, assets = {}) {
  const start = (plan.durations || []).slice(0, index).reduce((sum, n) => sum + Number(n), 0);
  return paintDirectorFrame(canvas, start + (plan.durations[index] || 1) * 0.55, plan, assets);
}