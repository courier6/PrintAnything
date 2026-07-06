interface Props {
  onDismiss: () => void;
}

export function PrintReminder({ onDismiss }: Props) {
  return (
    <div className="print-reminder" role="status">
      <div className="print-reminder-text">
        <strong>Before you print:</strong> in the print dialog, make sure <strong>Color</strong>{' '}
        is selected — not grayscale or black &amp; white.
      </div>
      <button className="btn-outline-small" onClick={onDismiss}>
        Got it
      </button>
    </div>
  );
}
