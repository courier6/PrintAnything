import { luminanceMap, recolorToCanvas } from './recolor';

interface PageEntry {
  source?: HTMLCanvasElement;
  lum?: Uint8Array;
  width: number;
  height: number;
  recolored?: HTMLCanvasElement;
  recoloredInk?: string;
}

/**
 * In-memory document store: source renders, cached luminance maps, and
 * recolored canvases. Swatch changes only re-run the cheap luminance→ink
 * ramp, never the PDF render. Nothing here ever leaves the device.
 */
export class PageStore {
  private pages: PageEntry[] = [];
  private readyResolvers: Array<() => void> = [];
  private readyPromises: Array<Promise<void>> = [];

  reset(count: number): void {
    this.pages = Array.from({ length: count }, () => ({ width: 0, height: 0 }));
    this.readyResolvers = new Array<() => void>(count);
    this.readyPromises = Array.from(
      { length: count },
      (_, i) =>
        new Promise<void>((resolve) => {
          this.readyResolvers[i] = resolve;
        }),
    );
  }

  get pageCount(): number {
    return this.pages.length;
  }

  setSource(index: number, canvas: HTMLCanvasElement): void {
    const page = this.pages[index];
    if (!page) return;
    page.source = canvas;
    page.width = canvas.width;
    page.height = canvas.height;
    page.lum = luminanceMap(canvas);
    this.readyResolvers[index]?.();
  }

  hasSource(index: number): boolean {
    return !!this.pages[index]?.source;
  }

  getSource(index: number): HTMLCanvasElement | null {
    return this.pages[index]?.source ?? null;
  }

  /** Resolves once the page's source render (and luminance cache) exists. */
  whenSourceReady(index: number): Promise<void> {
    return this.readyPromises[index] ?? Promise.resolve();
  }

  /** Recolors the page at the given ink if stale; returns null until the source exists. */
  ensureRecolored(index: number, inkHex: string): HTMLCanvasElement | null {
    const page = this.pages[index];
    if (!page?.lum) return null;
    if (!page.recolored || page.recoloredInk !== inkHex) {
      page.recolored = recolorToCanvas(page.lum, page.width, page.height, inkHex, page.recolored);
      page.recoloredInk = inkHex;
    }
    return page.recolored;
  }

  /** The recolored canvas only if it's already at the given ink. */
  getRecolored(index: number, inkHex: string): HTMLCanvasElement | null {
    const page = this.pages[index];
    return page?.recolored && page.recoloredInk === inkHex ? page.recolored : null;
  }
}
