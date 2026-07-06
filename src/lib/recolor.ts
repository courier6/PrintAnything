// Duotone recoloring, ported from design_handoff_printanything/recolor-reference.js.
// Per-pixel luminance drives a white→ink ramp; near-white clamps to pure paper
// white so scanned documents don't print a faint tint wash.

const WHITE_CLAMP = 0.94;
const GAMMA = 2.2;

/** One-time pass per page: 8-bit relative luminance for every pixel. */
export function luminanceMap(canvas: HTMLCanvasElement): Uint8Array {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const lum = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lum[p] = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
  }
  return lum;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Gamma-aware lerp keeps mid-grays from looking washed out.
function mix(from: number, to: number, t: number): number {
  return Math.round(
    255 * Math.pow(Math.pow(from / 255, GAMMA) * (1 - t) + Math.pow(to / 255, GAMMA) * t, 1 / GAMMA),
  );
}

const lutCache = new Map<string, Uint8Array>();

/** 256-entry luminance→RGB lookup table for one ink. */
function inkLut(inkHex: string): Uint8Array {
  const cached = lutCache.get(inkHex);
  if (cached) return cached;
  const ink = hexToRgb(inkHex);
  const lut = new Uint8Array(256 * 3);
  for (let v = 0; v < 256; v++) {
    const lum = v / 255;
    if (lum >= WHITE_CLAMP) {
      lut[v * 3] = lut[v * 3 + 1] = lut[v * 3 + 2] = 255;
    } else {
      const t = 1 - lum / WHITE_CLAMP;
      lut[v * 3] = mix(255, ink.r, t);
      lut[v * 3 + 1] = mix(255, ink.g, t);
      lut[v * 3 + 2] = mix(255, ink.b, t);
    }
  }
  lutCache.set(inkHex, lut);
  return lut;
}

/**
 * Re-ink a page from its cached luminance map. Reuses `target` when given so
 * the mounted preview canvas updates in place on swatch changes.
 */
export function recolorToCanvas(
  lum: Uint8Array,
  width: number,
  height: number,
  inkHex: string,
  target?: HTMLCanvasElement,
): HTMLCanvasElement {
  const lut = inkLut(inkHex);
  const canvas = target ?? document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  const img = ctx.createImageData(width, height);
  const d = img.data;
  for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
    const v = lum[p] * 3;
    d[i] = lut[v];
    d[i + 1] = lut[v + 1];
    d[i + 2] = lut[v + 2];
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
