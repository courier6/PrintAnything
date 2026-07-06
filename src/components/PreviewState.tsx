import type { KeyboardEvent } from 'react';
import { INKS } from '../lib/inks';
import { PageCanvas } from './PageCanvas';
import { PrintReminder } from './PrintReminder';

interface Props {
  fileName: string;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  inkIndex: number;
  onSelectInk: (index: number) => void;
  sourceCanvas: HTMLCanvasElement | null;
  recoloredCanvas: HTMLCanvasElement | null;
  holding: boolean;
  onHoldChange: (holding: boolean) => void;
  onPrint: () => void;
  onDownload: () => void;
  busy: 'print' | 'download' | null;
  showReminder: boolean;
  onDismissReminder: () => void;
}

export function PreviewState({
  fileName,
  pageCount,
  currentPage,
  onPageChange,
  inkIndex,
  onSelectInk,
  sourceCanvas,
  recoloredCanvas,
  holding,
  onHoldChange,
  onPrint,
  onDownload,
  busy,
  showReminder,
  onDismissReminder,
}: Props) {
  const pageReady = recoloredCanvas !== null;

  function holdKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      onHoldChange(true);
    }
  }

  function holdKeyUp(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter') onHoldChange(false);
  }

  return (
    <>
      <div className="toolbar">
        <span className="file-chip">
          {fileName} · {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
        <div className="pager">
          <button
            className="pager-btn"
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ‹
          </button>
          <span className="pager-label">
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            className="pager-btn"
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() => onPageChange(currentPage + 1)}
          >
            ›
          </button>
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={onDownload} disabled={busy !== null}>
            {busy === 'download' ? 'Preparing…' : 'Download PDF'}
          </button>
          <button className="btn-primary toolbar-print" onClick={onPrint} disabled={busy !== null}>
            Print
          </button>
        </div>
      </div>

      <div className="preview-grid">
        <div className="preview-stage">
          {showReminder && <PrintReminder onDismiss={onDismissReminder} />}
          <span className="compare-caption">
            {holding ? 'Original — black ink' : 'Re-inked preview — what will print'}
          </span>
          {pageReady ? (
            <div className="page-stack">
              <PageCanvas canvas={recoloredCanvas} className="page-layer" />
              <PageCanvas
                canvas={sourceCanvas}
                className={'page-layer page-original' + (holding ? ' visible' : '')}
              />
            </div>
          ) : (
            <div className="page-placeholder">Recoloring this page…</div>
          )}
          <button
            className="pill-btn"
            disabled={!pageReady}
            aria-pressed={holding}
            onPointerDown={(e) => {
              e.preventDefault();
              onHoldChange(true);
            }}
            onPointerUp={() => onHoldChange(false)}
            onPointerLeave={() => onHoldChange(false)}
            onPointerCancel={() => onHoldChange(false)}
            onKeyDown={holdKeyDown}
            onKeyUp={holdKeyUp}
            onBlur={() => onHoldChange(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            Press and hold to see the original
          </button>
        </div>

        <aside className="sidebar">
          <div>
            <div className="side-label">Ink color</div>
            <div className="swatch-row">
              {INKS.map((ink, i) => (
                <button
                  key={ink.hex}
                  className="swatch"
                  aria-label={ink.name}
                  title={ink.name}
                  aria-pressed={i === inkIndex}
                  style={{
                    background: ink.hex,
                    boxShadow:
                      i === inkIndex
                        ? `0 0 0 2px #ffffff, 0 0 0 4px ${ink.hex}`
                        : '0 0 0 1px rgba(0,0,0,.15)',
                  }}
                  onClick={() => onSelectInk(i)}
                />
              ))}
              <div className="swatch-placeholder" title="More colors in v2" aria-hidden="true" />
            </div>
            <div className="ink-name">{INKS[inkIndex].name}</div>
          </div>

          <p className="side-note">
            Colored content becomes one ink — a red line and a green line of the same darkness
            will look the same.
          </p>

          <div className="help-section">
            <div className="side-label">If it still won't print</div>
            <details className="help-item" open>
              <summary>HP</summary>
              <div className="help-body">
                HP printers may block printing when any cartridge reads empty. In the HP Smart
                app, set the black cartridge to “ignore,” or look for ink backup mode.
              </div>
            </details>
            <details className="help-item">
              <summary>Epson</summary>
              <div className="help-body">
                Press and hold Stop/Cancel while the ink light is on to print in backup mode
                (varies by model).
              </div>
            </details>
            <details className="help-item">
              <summary>Canon</summary>
              <div className="help-body">
                Press and hold Stop for 5+ seconds to disable the ink level check.
              </div>
            </details>
          </div>
        </aside>
      </div>
    </>
  );
}
