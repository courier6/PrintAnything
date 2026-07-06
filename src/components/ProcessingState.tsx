import { PageCanvas } from './PageCanvas';

interface Props {
  firstPage: HTMLCanvasElement | null;
  done: number;
  total: number;
}

export function ProcessingState({ firstPage, done, total }: Props) {
  const pct = total > 0 ? Math.max(4, Math.round((done / total) * 100)) : 4;
  const label =
    total === 0
      ? 'Reading your file…'
      : done >= total
        ? 'Finishing up…'
        : `Recoloring page ${done + 1} of ${total}…`;

  return (
    <div className="processing-area">
      {firstPage && <PageCanvas canvas={firstPage} className="processing-page" />}
      <div className="progress-unit" role="status">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">{label}</div>
        {firstPage && (
          <div className="progress-sub">Here's your first page while the rest finish.</div>
        )}
      </div>
    </div>
  );
}
