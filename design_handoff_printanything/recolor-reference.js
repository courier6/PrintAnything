// PrintAnything — reference recoloring algorithm (v1 behavior spec)
// Not production code. Shows the exact intended pixel mapping so the
// implementation matches the design's preview promise.
//
// Input:  a rendered source page (canvas) — from PDF.js or an <img> decode.
// Output: the same page re-inked as a duotone: white paper → chosen ink.
//
// Rules (from the design brief):
// - Per-pixel LUMINANCE drives the mapping; all hues collapse to one ramp.
// - Black (lum 0) → ink at full strength. White (lum 1) → pure white.
// - Grays/photos → proportionally lighter tints of the ink.
// - Near-white backgrounds must come out PURE white (paper), so clamp the
//   top of the ramp — otherwise scanned documents print a faint tint wash.

const INKS = {
  'dark-navy':   '#1e3a5f', // default
  'dark-teal':   '#0f4c47',
  'dark-maroon': '#5e1f2e',
  'dark-purple': '#44286b',
};

function recolorCanvas(srcCanvas, inkHex) {
  const ink = hexToRgb(inkHex);
  const canvas = document.createElement('canvas');
  canvas.width = srcCanvas.width;
  canvas.height = srcCanvas.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(srcCanvas, 0, 0);

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const WHITE_CLAMP = 0.94; // luminance >= this → pure paper white

  for (let i = 0; i < d.length; i += 4) {
    // Relative luminance, 0 (black) … 1 (white)
    const lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;

    if (lum >= WHITE_CLAMP) {
      d[i] = d[i + 1] = d[i + 2] = 255;
    } else {
      // t = ink strength: 1 at black, 0 at the white clamp
      const t = 1 - lum / WHITE_CLAMP;
      // Interpolate white → ink in linear-ish space (gamma 2.2 approx)
      d[i]     = mix(255, ink.r, t);
      d[i + 1] = mix(255, ink.g, t);
      d[i + 2] = mix(255, ink.b, t);
    }
    // alpha unchanged
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function mix(from, to, t) {
  // gamma-aware lerp keeps mid-grays from looking washed out
  const g = 2.2;
  return Math.round(255 * Math.pow(
    Math.pow(from / 255, g) * (1 - t) + Math.pow(to / 255, g) * t, 1 / g));
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 };
}

// Performance notes:
// - Re-render ONLY the visible page synchronously on swatch change; queue the
//   rest (requestIdleCallback / worker). Target < 100ms for the visible page.
// - Cache the grayscale luminance pass per page; swatch changes then only
//   re-run the (cheap) ramp, not the PDF render.
// - For "Download PDF", draw the recolored canvases into a new PDF
//   (e.g. jsPDF) at print resolution (~150–200 DPI minimum).

export { INKS, recolorCanvas };
