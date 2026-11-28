// Native cinematic asset generators. Everything here is drawn procedurally on
// the canvas — no stock footage, no uploads, no network round-trips — so a
// commercial can be built from a single sentence.

import { TERMINAL_BUDGET } from '@/components/upkeeper/commercial/directorCueTiming';

export const LIGHT_TINT = {
  'Obsidian dark mode': { rim: '#5fd8ff', key: '#ffffff', warm: '#2a3a4a', bg: '#05080b' },
  'Neon cyan': { rim: '#00e5ff', key: '#d8feff', warm: '#062b33', bg: '#04121a' },
  'Warm amber': { rim: '#ffb347', key: '#ffe6c2', warm: '#3a2410', bg: '#0d0805' },
  'Cold steel': { rim: '#bcd8ff', key: '#eef5ff', warm: '#16202c', bg: '#070b10' },
};

const shade = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r},${g},${b})`;
};

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
}

function plate(ctx, w, h, tint) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, tint.warm);
  g.addColorStop(0.55, shade(tint.bg, 6));
  g.addColorStop(1, '#020406');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// A moving specular band that sells the "lit on a bench" look.
function specular(ctx, w, h, progress, tint) {
  const sweep = ((progress * 1.6) % 1) * 1.8 - 0.4;
  const g = ctx.createLinearGradient(w * (sweep - 0.35), 0, w * (sweep + 0.35), h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.09)');
  g.addColorStop(0.5, tint.rim);
  g.addColorStop(0.55, 'rgba(255,255,255,0.07)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function vignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.82)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function pins(ctx, x, y, cols, rows, gap, size, tint) {
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const px = x + c * gap;
      const py = y + r * gap;
      const g = ctx.createLinearGradient(px, py, px + size, py + size);
      g.addColorStop(0, '#f6d68a');
      g.addColorStop(0.5, '#b98c2c');
      g.addColorStop(1, '#f7e3ad');
      ctx.fillStyle = g;
      ctx.fillRect(px, py, size, size);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(px, py, size * 0.3, size * 0.3);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - gap * 0.35, y - gap * 0.35, cols * gap + gap * 0.35, rows * gap + gap * 0.35);
}

function fan(ctx, cx, cy, radius, spin) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(10,16,22,0.9)';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(spin);
  for (let i = 0; i < 7; i += 1) {
    ctx.rotate((Math.PI * 2) / 7);
    const g = ctx.createLinearGradient(0, 0, radius * 0.86, 0);
    g.addColorStop(0, 'rgba(190,210,225,0.85)');
    g.addColorStop(1, 'rgba(90,110,128,0.25)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(radius * 0.46, 0, radius * 0.42, radius * 0.16, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#0b1117';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,190,210,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function pi5(ctx, w, h, p, tint) {
  plate(ctx, w, h, tint);
  const bw = w * 0.74;
  const bh = bw * 0.62;
  const x = (w - bw) / 2;
  const y = (h - bh) / 2 - h * 0.02;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.045 + Math.sin(p * Math.PI) * 0.012);
  ctx.translate(-w / 2, -h / 2);

  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 26;
  const pcb = ctx.createLinearGradient(x, y, x + bw, y + bh);
  pcb.addColorStop(0, '#1e6a45');
  pcb.addColorStop(0.5, '#175238');
  pcb.addColorStop(1, '#0f3a28');
  ctx.fillStyle = pcb;
  rounded(ctx, x, y, bw, bh, bw * 0.012);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Copper traces + silkscreen.
  ctx.save();
  rounded(ctx, x, y, bw, bh, bw * 0.012);
  ctx.clip();
  ctx.strokeStyle = 'rgba(140,220,180,0.16)';
  ctx.lineWidth = Math.max(1, bw * 0.0016);
  for (let i = 1; i < 22; i += 1) {
    ctx.beginPath();
    const ty = y + (bh / 22) * i;
    ctx.moveTo(x + bw * 0.06, ty);
    ctx.lineTo(x + bw * 0.34, ty);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(235,255,245,0.5)';
  ctx.font = `700 ${Math.round(bw * 0.028)}px "Inter", Arial, sans-serif`;
  ctx.fillText('RASPBERRY PI 5', x + bw * 0.055, y + bh * 0.93);
  ctx.font = `600 ${Math.round(bw * 0.017)}px "Inter", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(235,255,245,0.34)';
  ctx.fillText('SOVEREIGN EDGE NODE', x + bw * 0.055, y + bh * 0.975);
  ctx.restore();

  // GPIO header.
  pins(ctx, x + bw * 0.07, y + bh * 0.1, 20, 2, bw * 0.0215, bw * 0.0135, tint);

  // Ports along the bottom edge.
  const portY = y + bh * 0.7;
  [[0.14, 0.19, 'USB'], [0.35, 0.19, 'USB'], [0.57, 0.2, 'LAN'], [0.79, 0.11, 'HDMI']].forEach(([px, pw]) => {
    const rx = x + bw * px;
    const rw = bw * pw;
    const rh = bh * 0.13;
    const g = ctx.createLinearGradient(rx, portY, rx, portY + rh);
    g.addColorStop(0, '#c9d3da');
    g.addColorStop(0.35, '#8d9aa4');
    g.addColorStop(1, '#4a545d');
    ctx.fillStyle = g;
    rounded(ctx, rx, portY, rw, rh, rh * 0.12);
    ctx.fill();
    ctx.fillStyle = '#0a0d10';
    rounded(ctx, rx + rw * 0.08, portY + rh * 0.28, rw * 0.84, rh * 0.44, rh * 0.08);
    ctx.fill();
  });

  // SoC heatsink + fan.
  const hx = x + bw * 0.56;
  const hy = y + bh * 0.26;
  const hw = bw * 0.3;
  const hh = bh * 0.32;
  const metal = ctx.createLinearGradient(hx, hy, hx + hw, hy + hh);
  metal.addColorStop(0, '#eef4f8');
  metal.addColorStop(0.35, '#9fb0bd');
  metal.addColorStop(0.55, '#e7eff5');
  metal.addColorStop(1, '#5d6b76');
  ctx.fillStyle = metal;
  rounded(ctx, hx, hy, hw, hh, hw * 0.04);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(hx + (hw / 8) * i, hy + hh * 0.08);
    ctx.lineTo(hx + (hw / 8) * i, hy + hh * 0.92);
    ctx.stroke();
  }
  fan(ctx, hx + hw / 2, hy + hh / 2, Math.min(hw, hh) * 0.4, p * Math.PI * 14);

  ctx.restore();
  specular(ctx, w, h, p, tint);
  vignette(ctx, w, h);
}

function n100(ctx, w, h, p, tint) {
  plate(ctx, w, h, tint);
  const bw = w * 0.8;
  const bh = bw * 0.5;
  const x = (w - bw) / 2;
  const y = (h - bh) / 2;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(0.03 - Math.sin(p * Math.PI) * 0.01);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 30;
  const pcb = ctx.createLinearGradient(x, y, x + bw, y + bh);
  pcb.addColorStop(0, '#16243a');
  pcb.addColorStop(0.55, '#0e1a2c');
  pcb.addColorStop(1, '#070e18');
  ctx.fillStyle = pcb;
  rounded(ctx, x, y, bw, bh, bw * 0.01);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // DIMM slot.
  ctx.fillStyle = '#1d2b3d';
  rounded(ctx, x + bw * 0.06, y + bh * 0.14, bw * 0.34, bh * 0.1, 4);
  ctx.fill();
  ctx.fillStyle = '#0a1220';
  rounded(ctx, x + bw * 0.07, y + bh * 0.17, bw * 0.32, bh * 0.04, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,220,240,0.35)';
  ctx.font = `700 ${Math.round(bw * 0.016)}px "Inter", Arial, sans-serif`;
  ctx.fillText('DDR4 SO-DIMM', x + bw * 0.075, y + bh * 0.32);

  // CPU.
  const cx = x + bw * 0.52;
  const cy = y + bh * 0.3;
  const cs = bh * 0.36;
  const chip = ctx.createLinearGradient(cx, cy, cx + cs, cy + cs);
  chip.addColorStop(0, '#2a3644');
  chip.addColorStop(0.5, '#141c26');
  chip.addColorStop(1, '#28323f');
  ctx.fillStyle = chip;
  rounded(ctx, cx, cy, cs, cs, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,180,210,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(230,242,255,0.86)';
  ctx.font = `800 ${Math.round(cs * 0.26)}px "Inter", Arial, sans-serif`;
  ctx.fillText('N100', cx + cs * 0.14, cy + cs * 0.6);

  // M.2 + SATA.
  ctx.fillStyle = '#101a28';
  rounded(ctx, x + bw * 0.06, y + bh * 0.6, bw * 0.3, bh * 0.14, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,229,255,0.5)';
  ctx.fillRect(x + bw * 0.06, y + bh * 0.6, bw * 0.3, 2);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = '#16202e';
    rounded(ctx, x + bw * (0.44 + i * 0.14), y + bh * 0.62, bw * 0.1, bh * 0.16, 3);
    ctx.fill();
  }

  // Capacitors.
  for (let i = 0; i < 5; i += 1) {
    const ccx = x + bw * (0.08 + i * 0.055);
    const ccy = y + bh * 0.82;
    const g = ctx.createLinearGradient(ccx - 8, ccy, ccx + 8, ccy);
    g.addColorStop(0, '#2b3746');
    g.addColorStop(0.5, '#8f9db0');
    g.addColorStop(1, '#2b3746');
    ctx.fillStyle = g;
    ctx.fillRect(ccx - bh * 0.03, ccy, bh * 0.06, bh * 0.1);
  }
  ctx.restore();
  specular(ctx, w, h, p, tint);
  vignette(ctx, w, h);
}

function breadboard(ctx, w, h, p, tint) {
  plate(ctx, w, h, tint);
  const bw = w * 0.78;
  const bh = bw * 0.58;
  const x = (w - bw) / 2;
  const y = (h - bh) / 2;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(0.06 - p * 0.05);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 26;
  const body = ctx.createLinearGradient(x, y, x, y + bh);
  body.addColorStop(0, '#f4f1e6');
  body.addColorStop(0.5, '#e3ded0');
  body.addColorStop(1, '#c8c2b2');
  ctx.fillStyle = body;
  rounded(ctx, x, y, bw, bh, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Rails.
  ctx.fillStyle = 'rgba(200,50,50,0.55)';
  ctx.fillRect(x + bw * 0.04, y + bh * 0.09, bw * 0.92, bh * 0.03);
  ctx.fillRect(x + bw * 0.04, y + bh * 0.88, bw * 0.92, bh * 0.03);
  ctx.fillStyle = 'rgba(50,90,200,0.55)';
  ctx.fillRect(x + bw * 0.04, y + bh * 0.145, bw * 0.92, bh * 0.03);
  ctx.fillRect(x + bw * 0.04, y + bh * 0.825, bw * 0.92, bh * 0.03);

  // Hole grid.
  const cols = 26;
  const rows = 12;
  const gx = (bw * 0.9) / cols;
  const gy = (bh * 0.5) / rows;
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const hx = x + bw * 0.05 + c * gx;
      const hy = y + bh * 0.28 + r * gy;
      ctx.fillStyle = 'rgba(70,66,58,0.75)';
      ctx.fillRect(hx, hy, gx * 0.44, gy * 0.44);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(hx, hy + gy * 0.44, gx * 0.44, 1);
    }
  }

  // Jumper wires with a travelling LED pulse.
  const wires = [
    ['#ff4d4d', 0.18, 0.3, 0.62, 0.72],
    ['#ffd23f', 0.2, 0.36, 0.55, 0.3],
    ['#3ddc84', 0.22, 0.42, 0.72, 0.44],
    ['#00e5ff', 0.24, 0.48, 0.48, 0.66],
  ];
  wires.forEach(([colour, ax, ay, bx, by]) => {
    ctx.strokeStyle = colour;
    ctx.lineWidth = Math.max(3, bw * 0.008);
    ctx.lineCap = 'round';
    ctx.shadowColor = colour;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(x + bw * ax, y + bh * ay);
    ctx.bezierCurveTo(
      x + bw * (ax + 0.1),
      y + bh * (ay - 0.35),
      x + bw * (bx - 0.1),
      y + bh * (by - 0.3),
      x + bw * bx,
      y + bh * by
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  // LED.
  const lx = x + bw * 0.48;
  const ly = y + bh * 0.66;
  const pulse = 0.5 + 0.5 * Math.sin(p * Math.PI * 6);
  const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, bw * 0.09);
  glow.addColorStop(0, `rgba(0,229,255,${0.85 * pulse})`);
  glow.addColorStop(1, 'rgba(0,229,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(lx - bw * 0.09, ly - bw * 0.09, bw * 0.18, bw * 0.18);
  ctx.fillStyle = `rgba(180,255,255,${0.7 + 0.3 * pulse})`;
  ctx.beginPath();
  ctx.arc(lx, ly, bw * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  specular(ctx, w, h, p, tint);
  vignette(ctx, w, h);
}

function esp32(ctx, w, h, p, tint) {
  plate(ctx, w, h, tint);
  const bw = w * 0.42;
  const bh = bw * 0.72;
  const x = (w - bw) / 2;
  const y = (h - bh) / 2;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.06 + Math.sin(p * Math.PI * 2) * 0.04);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 24;

  // Carrier board.
  const pcb = ctx.createLinearGradient(x, y, x + bw, y + bh);
  pcb.addColorStop(0, '#123a4d');
  pcb.addColorStop(1, '#081c26');
  ctx.fillStyle = pcb;
  rounded(ctx, x, y, bw, bh, 6);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Castellated pads.
  ctx.fillStyle = '#d8b86a';
  for (let i = 0; i < 8; i += 1) {
    const py = y + bh * (0.2 + i * 0.08);
    ctx.fillRect(x - bw * 0.012, py, bw * 0.035, bh * 0.04);
    ctx.fillRect(x + bw - bw * 0.023, py, bw * 0.035, bh * 0.04);
  }

  // Shield can.
  const sx = x + bw * 0.13;
  const sy = y + bh * 0.1;
  const sw = bw * 0.74;
  const sh = bh * 0.56;
  const metal = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
  metal.addColorStop(0, '#cfd9e2');
  metal.addColorStop(0.4, '#8b98a5');
  metal.addColorStop(0.62, '#e8f1f8');
  metal.addColorStop(1, '#5b6672');
  ctx.fillStyle = metal;
  rounded(ctx, sx, sy, sw, sh, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,30,38,0.9)';
  ctx.font = `800 ${Math.round(bw * 0.075)}px "Inter", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ESP32', sx + sw / 2, sy + sh * 0.52);
  ctx.font = `600 ${Math.round(bw * 0.03)}px "Inter", Arial, sans-serif`;
  ctx.fillText('SOVEREIGN NODE', sx + sw / 2, sy + sh * 0.68);
  ctx.textAlign = 'left';

  // Antenna trace.
  ctx.strokeStyle = '#c9a24a';
  ctx.lineWidth = Math.max(2, bw * 0.012);
  ctx.beginPath();
  const ax = x + bw * 0.18;
  const ay = y + bh * 0.8;
  ctx.moveTo(ax, ay);
  for (let i = 0; i < 6; i += 1) {
    ctx.lineTo(ax + (bw * 0.1) * i + bw * 0.05, ay - (i % 2 ? 0 : bh * 0.07));
  }
  ctx.stroke();

  // Status LEDs.
  [0, 1].forEach((i) => {
    const on = Math.sin(p * Math.PI * 8 + i * 2) > 0;
    ctx.fillStyle = on ? (i ? '#3ddc84' : '#00e5ff') : '#123';
    ctx.beginPath();
    ctx.arc(x + bw * (0.32 + i * 0.1), y + bh * 0.9, bw * 0.016, 0, Math.PI * 2);
    ctx.fill();
    if (on) {
      ctx.shadowColor = i ? '#3ddc84' : '#00e5ff';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  ctx.restore();
  specular(ctx, w, h, p, tint);
  vignette(ctx, w, h);
}

function heatsink(ctx, w, h, p, tint) {
  plate(ctx, w, h, tint);
  const cx = w / 2;
  const cy = h * 0.5;
  const bw = w * 0.66;
  const bh = bw * 0.42;
  const x = cx - bw / 2;
  const y = cy - bh / 2;
  const fins = 16;
  ctx.save();
  for (let i = 0; i < fins; i += 1) {
    const fx = x + (bw / fins) * i;
    const depth = bh * (0.75 + 0.25 * Math.sin(i * 0.6));
    const g = ctx.createLinearGradient(fx, y, fx, y + depth);
    g.addColorStop(0, '#f2f7fb');
    g.addColorStop(0.18, '#b6c5d2');
    g.addColorStop(0.5, '#7e8f9e');
    g.addColorStop(0.8, '#c9d7e3');
    g.addColorStop(1, '#4a5866');
    ctx.fillStyle = g;
    ctx.fillRect(fx, y + (bh - depth) / 2, (bw / fins) * 0.62, depth);
  }
  // Top plate in perspective.
  const top = ctx.createLinearGradient(x, y - bh * 0.12, x + bw, y);
  top.addColorStop(0, '#dbe7f0');
  top.addColorStop(0.5, '#8fa0ae');
  top.addColorStop(1, '#5a6875');
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(x, y - bh * 0.05);
  ctx.lineTo(x + bw, y - bh * 0.14);
  ctx.lineTo(x + bw, y + bh * 0.02);
  ctx.lineTo(x, y + bh * 0.1);
  ctx.closePath();
  ctx.fill();

  // Screws.
  [[x + bw * 0.06, y + bh * 0.08], [x + bw * 0.94, y + bh * 0.02]].forEach(([sx, sy]) => {
    ctx.fillStyle = '#0d1319';
    ctx.beginPath();
    ctx.arc(sx, sy, bh * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b9c8d4';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#6f8090';
    ctx.beginPath();
    ctx.moveTo(sx - bh * 0.025, sy);
    ctx.lineTo(sx + bh * 0.025, sy);
    ctx.stroke();
  });
  ctx.restore();

  // Heat shimmer.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i += 1) {
    const off = (p * 2 + i * 0.2) % 1;
    ctx.fillStyle = `rgba(255,${140 + i * 12},80,${0.05 * (1 - off)})`;
    ctx.beginPath();
    ctx.ellipse(cx + Math.sin(off * 8 + i) * w * 0.04, y - bh * 0.3 - off * h * 0.12, w * 0.12, h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  specular(ctx, w, h, p, tint);
  vignette(ctx, w, h);
}

const PAINTERS = { pi5, n100, breadboard, esp32, heatsink };

export function paintHardware(ctx, kind, w, h, progress, lighting) {
  const tint = LIGHT_TINT[lighting] || LIGHT_TINT['Obsidian dark mode'];
  (PAINTERS[kind] || heatsink)(ctx, w, h, Math.max(0, Math.min(1, progress)), tint);
}

export function paintLightingWash(ctx, w, h, lighting, strength = 1) {
  const tint = LIGHT_TINT[lighting] || LIGHT_TINT['Obsidian dark mode'];
  const g = ctx.createLinearGradient(0, 0, w * 0.2, h);
  g.addColorStop(0, `${tint.rim}44`);
  g.addColorStop(0.45, 'rgba(0,0,0,0)');
  g.addColorStop(1, `${tint.rim}22`);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.5 * strength;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ── Terminal overlay ────────────────────────────────────────────────────────

const KEYWORDS = new Set(['make', 'git', 'npm', 'npx', 'docker', 'cd', 'ls', 'sudo', 'clone', 'run', 'test']);

function tokens(line) {
  return line.split(/(\s+)/).filter(Boolean).map((piece) => {
    if (/^\s+$/.test(piece)) return { text: piece, kind: 'space' };
    if (piece.startsWith('#')) return { text: piece, kind: 'comment' };
    if (/^-{1,2}[\w-]+/.test(piece)) return { text: piece, kind: 'flag' };
    if (KEYWORDS.has(piece.replace(/[^\w-]/g, ''))) return { text: piece, kind: 'key' };
    if (/^["'].*["']$/.test(piece)) return { text: piece, kind: 'string' };
    if (/^[\d.]+(%|°C|fps|W|ms)?$/.test(piece)) return { text: piece, kind: 'num' };
    if (/^[✓●→>]/.test(piece)) return { text: piece, kind: 'ok' };
    return { text: piece, kind: 'plain' };
  });
}

const TERM_COLOURS = {
  key: '#00e5ff',
  flag: '#e6bd4d',
  string: '#7cf6c8',
  num: '#ffb347',
  ok: '#3ddc84',
  comment: '#5b6b78',
  plain: '#d6e2ea',
  space: '#d6e2ea',
};

/**
 * Crisp #0B0D0F terminal with syntax-highlighted typing animation.
 * @param {string[]} lines command and output lines
 * @param {number} reveal 0..1 typing progress across all lines
 */
export function paintTerminal(ctx, box, lines, reveal, accent = '#00e5ff') {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#0b0d0f';
  rounded(ctx, x, y, w, h, Math.min(18, w * 0.012));
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Title bar.
  const barH = h * 0.085;
  ctx.fillStyle = '#10161c';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, barH, [Math.min(18, w * 0.012), Math.min(18, w * 0.012), 0, 0]);
  else ctx.rect(x, y, w, barH);
  ctx.fill();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + w * 0.028 + i * w * 0.026, y + barH / 2, barH * 0.16, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(214,226,234,0.5)';
  ctx.font = `600 ${Math.round(barH * 0.38)}px "JetBrains Mono", "SFMono-Regular", Menlo, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('sovereign@edge — zsh', x + w / 2, y + barH * 0.66);
  ctx.textAlign = 'left';

  // Body.
  const padX = w * 0.045;
  const size = Math.round(h * 0.052);
  const lineH = size * 1.62;
  const top = y + barH + lineH * 0.9;
  ctx.font = `600 ${size}px "JetBrains Mono", "SFMono-Regular", Menlo, monospace`;
  ctx.textBaseline = 'alphabetic';

  const totalChars = lines.reduce((sum, l) => sum + l.length, 0) || 1;
  let budget = Math.floor(reveal * totalChars * TERMINAL_BUDGET + 1e-8);
  let cursor = null;

  lines.forEach((line, li) => {
    const ly = top + li * lineH;
    if (ly > y + h - lineH * 0.3) return;
    let cx = x + padX;
    if (li === 0) {
      ctx.fillStyle = '#3ddc84';
      ctx.fillText('$', cx, ly);
      cx += ctx.measureText('$ ').width;
    }
    tokens(line).forEach((token) => {
      if (budget <= 0) return;
      const take = Math.min(token.text.length, budget);
      const text = token.text.slice(0, take);
      budget -= take;
      ctx.fillStyle = li === 0 ? (token.kind === 'plain' ? '#eaf4fa' : TERM_COLOURS[token.kind]) : token.kind === 'plain' ? 'rgba(160,180,196,0.85)' : TERM_COLOURS[token.kind];
      if (li === 0 && token.kind === 'plain') ctx.font = `800 ${size}px "JetBrains Mono", Menlo, monospace`;
      ctx.fillText(text, cx, ly);
      cx += ctx.measureText(text).width;
      ctx.font = `600 ${size}px "JetBrains Mono", "SFMono-Regular", Menlo, monospace`;
      if (take < token.text.length) cursor = { x: cx, y: ly };
    });
    if (budget <= 0 && !cursor && li === lines.length - 1) cursor = { x: cx, y: ly };
  });

  if (cursor) {
    // Deterministic blink so recorded frames stay identical to the preview.
    const blink = Math.sin(reveal * 42) > -0.35;
    if (blink) {
      ctx.fillStyle = accent;
      ctx.fillRect(cursor.x + size * 0.1, cursor.y - size * 0.78, size * 0.62, size * 0.96);
    }
  }

  // Faint scanlines.
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#ffffff';
  for (let sy = y + barH; sy < y + h; sy += 4) ctx.fillRect(x, sy, w, 1);
  ctx.globalAlpha = 1;
  ctx.restore();
}