export function Header() {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-square" aria-hidden="true" />
        <span className="wordmark">PrintAnything</span>
        {/*   = thin space; the tagline reads as a continuation of the wordmark */}
        <span className="tagline">{' '}&mdash; even when the black runs out.</span>
      </div>
      <span className="header-formats">Works with PDF · PNG · JPG</span>
    </header>
  );
}
