export interface Ink {
  name: string;
  hex: string;
}

/** User-selectable substitute inks; navy is the default. */
export const INKS: readonly Ink[] = [
  { name: 'Dark navy', hex: '#1e3a5f' },
  { name: 'Dark teal', hex: '#0f4c47' },
  { name: 'Dark maroon', hex: '#5e1f2e' },
  { name: 'Dark purple', hex: '#44286b' },
];
