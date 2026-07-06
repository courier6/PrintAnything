import { useEffect, useRef } from 'react';

interface Props {
  canvas: HTMLCanvasElement | null;
  className?: string;
}

/** Mounts a live canvas element (owned by the PageStore) into the tree. */
export function PageCanvas({ canvas, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (canvas) {
      if (canvas.parentElement !== el) el.replaceChildren(canvas);
    } else {
      el.replaceChildren();
    }
  }, [canvas]);

  return <div ref={ref} className={className} />;
}
