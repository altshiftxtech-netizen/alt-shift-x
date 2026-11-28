// A small, dependency-free GIF89a encoder.
//
// Frames are quantised to one shared 256-colour palette (6×6×6 colour cube plus
// a 40-step grey ramp, which suits dark UI and metal), ordered-dithered, then
// LZW-compressed exactly as the GIF89a specification requires: the code width
// grows as the dictionary fills and a Clear code resets it at 4096 entries.

function buildPalette() {
  const table = new Uint8Array(256 * 3);
  let i = 0;
  for (let r = 0; r < 6; r += 1) {
    for (let g = 0; g < 6; g += 1) {
      for (let b = 0; b < 6; b += 1) {
        table[i++] = r * 51;
        table[i++] = g * 51;
        table[i++] = b * 51;
      }
    }
  }
  for (let k = 0; k < 40; k += 1) {
    const v = Math.round((k * 255) / 39);
    table[i++] = v;
    table[i++] = v;
    table[i++] = v;
  }
  return table;
}

const PALETTE = buildPalette();

// 4×4 ordered dither, centred around zero.
const BAYER = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map((v) => (v / 16 - 0.5) * 26);

export function quantise(rgba, width, height) {
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      const p = (row + x) * 4;
      const d = BAYER[(y & 3) * 4 + (x & 3)];
      let r = rgba[p] + d;
      let g = rgba[p + 1] + d;
      let b = rgba[p + 2] + d;
      r = r < 0 ? 0 : r > 255 ? 255 : r;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      b = b < 0 ? 0 : b > 255 ? 255 : b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min < 16) {
        // Near-grey: use the smooth ramp.
        out[row + x] = 216 + Math.min(39, Math.round(((r + g + b) / 3 / 255) * 39));
      } else {
        const r6 = Math.min(5, Math.round(r / 51));
        const g6 = Math.min(5, Math.round(g / 51));
        const b6 = Math.min(5, Math.round(b / 51));
        out[row + x] = r6 * 36 + g6 * 6 + b6;
      }
    }
  }
  return out;
}

class Bytes {
  constructor(size = 1 << 16) {
    this.buf = new Uint8Array(size);
    this.len = 0;
  }
  push(byte) {
    if (this.len >= this.buf.length) {
      const next = new Uint8Array(this.buf.length * 2);
      next.set(this.buf);
      this.buf = next;
    }
    this.buf[this.len++] = byte;
  }
  bytes() {
    return this.buf.subarray(0, this.len);
  }
}

export function lzwEncode(pixels, sink) {
  const MIN = 8;
  const clear = 1 << MIN;
  const eoi = clear + 1;
  let codeSize = MIN + 1;
  let maxCode = (1 << codeSize) - 1;
  let free = eoi + 1;
  const table = new Int32Array(1 << 20).fill(-1);
  let acc = 0;
  let accBits = 0;

  const write = (code) => {
    acc |= code << accBits;
    accBits += codeSize;
    while (accBits >= 8) {
      sink.push(acc & 0xff);
      acc >>>= 8;
      accBits -= 8;
    }
    if (free > maxCode && codeSize < 12) {
      codeSize += 1;
      maxCode = (1 << codeSize) - 1;
    }
  };

  write(clear);
  let prefix = pixels[0];
  for (let i = 1; i < pixels.length; i += 1) {
    const k = pixels[i];
    const key = (prefix << 8) | k;
    const found = table[key];
    if (found >= 0) {
      prefix = found;
      continue;
    }
    write(prefix);
    if (free < 4096) {
      table[key] = free;
      free += 1;
    } else {
      write(clear);
      table.fill(-1);
      free = eoi + 1;
      codeSize = MIN + 1;
      maxCode = (1 << codeSize) - 1;
    }
    prefix = k;
  }
  write(prefix);
  write(eoi);
  if (accBits > 0) sink.push(acc & 0xff);
}

function subBlocks(sink, data) {
  for (let i = 0; i < data.length; i += 255) {
    const chunk = data.subarray(i, Math.min(i + 255, data.length));
    sink.push(chunk.length);
    for (let j = 0; j < chunk.length; j += 1) sink.push(chunk[j]);
  }
  sink.push(0);
}

const u16 = (sink, value) => {
  sink.push(value & 0xff);
  sink.push((value >> 8) & 0xff);
};

/**
 * Encode frames into a looping GIF89a blob.
 * @param {Uint8ClampedArray[]} frames RGBA pixel data, all width×height.
 */
export function encodeGif(frames, width, height, fps = 12) {
  return encodeIndexedGif(
    frames.map((rgba) => quantise(rgba, width, height)),
    width,
    height,
    fps
  );
}

/**
 * Encode already-quantised frames. Lets a long clip be quantised frame by frame
 * instead of holding every RGBA buffer at once.
 * @param {Uint8Array[]} frames palette indices, all width×height.
 */
export function encodeIndexedGif(frames, width, height, fps = 12) {
  const parts = [];
  const head = new Bytes(1024);
  'GIF89a'.split('').forEach((c) => head.push(c.charCodeAt(0)));
  u16(head, width);
  u16(head, height);
  head.push(0xf7); // global colour table, 256 entries
  head.push(0); // background index
  head.push(0); // pixel aspect ratio
  for (let i = 0; i < PALETTE.length; i += 1) head.push(PALETTE[i]);
  // Netscape looping extension — loop forever.
  head.push(0x21);
  head.push(0xff);
  head.push(0x0b);
  'NETSCAPE2.0'.split('').forEach((c) => head.push(c.charCodeAt(0)));
  head.push(0x03);
  head.push(0x01);
  u16(head, 0);
  head.push(0x00);
  parts.push(head.bytes());

  const delay = Math.max(2, Math.round(100 / fps));

  frames.forEach((indexed) => {
    const frame = new Bytes(indexed.length >> 1);
    frame.push(0x21); // graphic control extension
    frame.push(0xf9);
    frame.push(0x04);
    frame.push(0x00);
    u16(frame, delay);
    frame.push(0x00);
    frame.push(0x00);
    frame.push(0x2c); // image descriptor
    u16(frame, 0);
    u16(frame, 0);
    u16(frame, width);
    u16(frame, height);
    frame.push(0x00);
    frame.push(8); // LZW minimum code size
    const data = new Bytes(indexed.length);
    lzwEncode(indexed, data);
    subBlocks(frame, data.bytes());
    parts.push(frame.bytes());
  });

  const tail = new Bytes(2);
  tail.push(0x3b);
  parts.push(tail.bytes());

  return new Blob(parts, { type: 'image/gif' });
}