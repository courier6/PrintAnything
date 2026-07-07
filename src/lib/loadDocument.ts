// pdfjs is loaded on demand so the landing screen doesn't pay for it.
async function getPdfjs() {
  const [pdfjsLib, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjsLib;
}

// ~150 DPI: readable in print, fast enough for per-pixel recoloring.
const RENDER_DPI = 150;
const MAX_IMAGE_DIM = 3500;

export class UnsupportedFileError extends Error {
  constructor() {
    super('Unsupported file type');
    this.name = 'UnsupportedFileError';
  }
}

export interface SourceDocument {
  pageCount: number;
  renderPage(index: number): Promise<HTMLCanvasElement>;
}

export async function loadDocument(file: File): Promise<SourceDocument> {
  const name = file.name.toLowerCase();
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
  const isImage =
    file.type === 'image/png' || file.type === 'image/jpeg' || /\.(png|jpe?g)$/.test(name);
  const isHeic =
    file.type === 'image/heic' || file.type === 'image/heif' || /\.hei[cf]$/.test(name);
  if (isPdf) return loadPdf(file);
  if (isHeic) return loadImage(await decodeHeic(file));
  if (isImage) return loadImage(file);
  throw new UnsupportedFileError();
}

// Browsers (Safari aside) can't decode HEIC natively; the decoder is imported
// only when a HEIC file actually arrives so the common path stays light.
async function decodeHeic(file: File): Promise<Blob> {
  const { heicTo } = await import('heic-to');
  return heicTo({ blob: file, type: 'image/png' });
}

async function loadPdf(file: File): Promise<SourceDocument> {
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return {
    pageCount: pdf.numPages,
    async renderPage(index: number): Promise<HTMLCanvasElement> {
      const page = await pdf.getPage(index + 1);
      const viewport = page.getViewport({ scale: RENDER_DPI / 72 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      // PDF pages may not paint their own background; force paper white.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas;
    },
  };
}

async function loadImage(file: Blob): Promise<SourceDocument> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return {
    pageCount: 1,
    renderPage: () => Promise.resolve(canvas),
  };
}
