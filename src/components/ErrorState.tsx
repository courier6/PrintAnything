import { DropZone } from './DropZone';

export type ErrorKind = 'unsupported' | 'processing';

interface Props {
  kind: ErrorKind;
  onFile: (file: File) => void;
  onChoose: () => void;
  onRetry: () => void;
}

export function ErrorState({ kind, onFile, onChoose, onRetry }: Props) {
  return (
    <div className="state-pad">
      <DropZone onFile={onFile} onChoose={onChoose}>
        <div className="error-card">
          {kind === 'unsupported' ? (
            <>
              <div className="error-title">This file type isn't supported yet.</div>
              <div className="error-body">
                PrintAnything works with PDF, PNG, JPG, and HEIC (iPhone photos).
              </div>
              <div className="error-actions">
                <button className="btn-primary" onClick={onChoose}>
                  Choose a different file
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="error-title">Something went wrong while recoloring.</div>
              <div className="error-body">
                It's usually temporary — try the same file again, or choose a different one.
              </div>
              <div className="error-actions">
                <button className="btn-primary" onClick={onRetry}>
                  Try again
                </button>
                <button className="btn-secondary" onClick={onChoose}>
                  Choose a different file
                </button>
              </div>
            </>
          )}
        </div>
      </DropZone>
    </div>
  );
}
