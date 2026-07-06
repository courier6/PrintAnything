# Handoff: PrintAnything — single-page "print without black ink" web app

## Overview

PrintAnything is a single-page, client-side web app that rescues people whose printer is out of black ink. The user drops a PDF or image; the app re-renders every page as a duotone — shades of one dark substitute ink (default: dark navy) on white — that the printer can mix from its remaining color cartridges. The user previews the result, optionally picks a different ink color, then prints or downloads.

The committed design is **option 1a** in the bundled design file: a **full-duotone UI** where the entire interface (chrome, buttons, borders, text) is rendered in the currently selected ink color, so switching the ink swatch re-inks the app itself along with the preview. The empty state uses the problem-first headline from option 2c, and the header tagline reads as a continuation of the wordmark.

## About the Design Files

The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the target codebase's environment** (React, Vue, Svelte, vanilla, etc.) using its established patterns — or, if no codebase exists yet, to choose an appropriate lightweight stack (this product needs no backend, no routing, no accounts).

`PrintAnything Directions.dc.html` contains multiple exploration rounds. **Implement only option `1a`** (the card labeled "1a" — its empty state already incorporates the chosen 2c headline and tagline). Options 1b, 1c, 2a, 2b, 2c are rejected/merged explorations; ignore them except as context. The state tabs above the card (Empty / Processing / Preview / Error) are a prototyping device, not product UI — the real app transitions between these states automatically.

## Fidelity

**High-fidelity.** Colors, typography, spacing, copy, and interactions are final. Recreate pixel-perfectly, adapting only where the target platform requires.

## The core mechanic: one CSS custom property

The entire UI derives from a single ink color variable (prototype: `--ink-a`). Every tint is computed from it with `color-mix(in oklab, var(--ink) N%, white)`. Changing the variable re-inks the whole app in one paint. Reuse this exact mechanism:

- Primary text / solid fills / borders of emphasis: `var(--ink)` at 100%
- Body-secondary text: 65–70% mix
- Muted text / labels: 50–55% mix
- Dashed drop-zone border: 38% mix
- Hairline borders / dividers: 18% mix (14% for accordion hairlines)
- Tinted background panels (drop zone, preview backdrop): 4–5% mix
- Paper/page surfaces and the app card: pure `#ffffff`

## Design Tokens

Ink presets (user-selectable; navy is default):
- Dark navy `#1e3a5f`
- Dark teal `#0f4c47`
- Dark maroon `#5e1f2e`
- Dark purple `#44286b`

Original-document black (preview "original" rendering): `#1c1c1c`.

Typography — Helvetica / Arial / sans-serif throughout, plus `ui-monospace, Menlo, monospace` for small tracked labels:
- Wordmark: 20px / 800 / letter-spacing -0.3px, ink 100%
- Header tagline: 17px / 400, ink 75% mix, reads as sentence continuation of the wordmark (see Copy)
- Hero headline (empty state): 38px / 800 / letter-spacing -0.6px / line-height 1.15
- Hero subline: 15.5px / 400 / line-height 1.55, ink 70% mix, max-width 540px, centered
- Primary button: 15px / 700 (toolbar variant 14px), white on ink, no border-radius, padding 12px 24px
- Secondary button: 14px / 700, ink text, 1.5px ink border, white bg
- Mono section labels ("INK COLOR", compare caption): 10.5–11px / 700, uppercase, letter-spacing 0.1em, ink 55–60% mix
- Body/side text: 12.5–13.5px, line-height 1.5–1.55
- Progress label: 14.5px / 700

Shape language: **square corners everywhere** (crisp, paper-like). Exceptions: swatches are circles; the press-and-hold pill button is `border-radius: 999px`.

Shadows: page previews float with `0 12px 36px rgba(20,30,50,.15)`; overlays with `0 12px 32px color-mix(in oklab, var(--ink) 22%, transparent)`.

Spacing: app header padding 18px 26px; content gutter 22–26px; sidebar 300px wide, 24px padding, 22px vertical gaps.

## Screens / Views (one page, four states)

### 1. Empty state (landing)

- **Header** (persists across all states): 14×14px solid ink square + wordmark "PrintAnything" + continuation tagline " — even when the black runs out." (17px, regular, ink 75% mix, thin space before the em-dash). Right-aligned: "Works with PDF · PNG · JPG" (12.5px, ink 55% mix). 1px bottom hairline (18% mix).
- **Drop zone = the whole screen** below the header (min ~440px tall, 22–26px margin): 2px dashed border (38% mix) on a 4% mix background. Centered column, 18px gap:
  - Headline: "Out of black ink? Drop your document here." (38px/800)
  - Subline: "It gets re-inked in a dark color your printer can still print — every page, every photo, still readable." (15.5px, 70% mix)
  - Row (12px gap): solid ink button "Choose a file" + "PDF, PNG, or JPG" (13px, 55% mix)
- Below the zone, centered: "Your file never leaves your device — everything happens in your browser." (12.5px, 50% mix)
- The **entire zone** accepts drag-and-drop; the button opens a file picker. Dropping a file starts processing immediately — no confirm step.

### 2. Processing state

- Centered column on the 4% mix background: the **first recolored page** (290px wide, letter aspect, drop shadow) as soon as it is ready, above a determinate progress unit (340px wide): 6px track (14% mix) with ink fill, label "Recoloring page 3 of 8…" (live numbers), subline "Here's your first page while the rest finish." (12.5px, 55% mix)
- Remaining pages process in the background; transition to Preview as soon as page 1 is interactive (don't block on the full document).

### 3. Preview state

- **Toolbar** under the header (12px 26px padding, bottom hairline): left — filename chip "permission-slip.pdf · 8 pages" (13px, 60% mix); center — pager: ‹ / "Page 1 of 8" (13px/700) / › (28×28px bordered buttons; disabled arrow at 40% mix); right — secondary "Download PDF" + primary "Print".
- **Main area**: 2-column grid, `1fr` preview + 300px sidebar (left hairline).
- **Preview column** (5% mix background, centered): mono caption above the page — "RE-INKED PREVIEW — WHAT WILL PRINT" / while holding: "ORIGINAL — BLACK INK"; the rendered page (380px wide, letter aspect, shadow); below it a pill button "Press and hold to see the original" — pointer-down swaps the page rendering to the original (#1c1c1c black), pointer-up/leave/cancel swaps back. Keyboard: holding Space/Enter on the focused button behaves the same.
- **Sidebar**, top to bottom (22px gaps):
  - "INK COLOR" mono label; row of four 26px circular swatches (10px gap) + one dashed empty circle placeholder (24px, reserved for v2 colors). Selected swatch ring: `0 0 0 2px #fff, 0 0 0 4px <ink hex>`; unselected: `0 0 0 1px rgba(0,0,0,.15)`. Below, the selected color's name, e.g. "Dark navy" (12.5px/700, ink). Clicking a swatch re-inks the UI + visible page instantly; other pages may re-render lazily.
  - Expectation-setter (12.5px, 60% mix): "Colored content becomes one ink — a red line and a green line of the same darkness will look the same."
  - Divider, then "IF IT STILL WON'T PRINT" mono label with a 3-item accordion (HP expanded by default): HP — "HP printers may block printing when any cartridge reads empty. In the HP Smart app, set the black cartridge to 'ignore,' or look for ink backup mode." / Epson — "Press and hold Stop/Cancel while the ink light is on to print in backup mode (varies by model)." / Canon — "Press and hold Stop for 5+ seconds to disable the ink level check." Summaries 13px/700 ink; bodies 12.5px, 65% mix; 14% mix hairlines between items.
- **Print reminder overlay**: clicking Print (a) opens the browser print dialog with the recolored document and (b) shows a dismissible card floating top-center of the preview column (white, 1.5px ink border, 470px, shadow): "**Before you print:** in the print dialog, make sure **Color** is selected — not grayscale or black & white." with a bordered "Got it" button. It persists until dismissed (it must survive the print dialog closing).

### 4. Error state (unsupported file)

- Same layout as Empty (dashed zone stays), with a centered white card (2px ink border, 28px 32px padding, shadow, max-width 440px): title "This file type isn't supported yet." (19px/800, ink); body "PrintAnything works with PDF, PNG, and JPG." (14px, 65% mix); solid ink button "Choose a different file". Every error must include its next step.

## Interactions & Behavior

- Drop/choose file → Processing immediately. Accept `.pdf`, `.png`, `.jpg/.jpeg`; anything else → Error state.
- Processing → Preview as soon as page 1 renders; background pages continue ("Recoloring page N of M…").
- Swatch click → update the single ink variable (instant UI re-ink) + re-render the visible page immediately; queue others.
- Press-and-hold compare → pointerdown/up/leave/cancel + touch equivalents; no toggle latching.
- Print → `window.print()` with the recolored document + reminder overlay.
- Download PDF → client-side PDF of the recolored pages.
- Transitions: minimal; a ~150ms color transition on the page preview when swapping original/re-inked is enough. Respect `prefers-reduced-motion`.
- Nothing persists between sessions — no saved settings, by design.

## State Management

- `appState`: `empty | processing | preview | error`
- `inkIndex`: 0–3 (default 0, dark navy) → drives the CSS custom property
- `currentPage`, `pageCount`, `pagesReady` (per-page render status)
- `holdingOriginal`: boolean (pressed state of the compare button)
- `showPrintReminder`: boolean (set on Print, cleared on "Got it")
- Document data lives entirely in memory (rendered page bitmaps/canvases); files never leave the device.

## Recoloring (behavior spec, not UI)

Render each source page (PDF.js for PDFs; direct decode for images), then map per-pixel luminance onto a white→ink ramp: black → ink at 100%, grays → proportionally lighter ink tints, white/near-white → pure white. All hues collapse to the same ramp (v1 intentionally has zero tuning controls).

## Accessibility floor

- Drop zone keyboard-operable (button is a real `<button>`; zone itself focusable with Enter opening the picker)
- Visible focus states on all controls (2px ink outline, offset 2px, suggested)
- Swatches carry `aria-label`/`title` with the color name; selected name shown as text
- Reminder overlay: `role="status"`; accordion uses native disclosure semantics
- Reduced motion: drop the color transition

## Assets

None required. The document shown in the prototype (`DocPage.dc.html`, a fictional school permission slip) is **sample content standing in for the user's real file** — do not ship it. The brand mark is a plain filled square in the current ink; the wordmark is set in the UI font. No icon font, no images.

## Files

- `PrintAnything Directions.dc.html` — interactive prototype. Implement card **1a** (includes final empty-state and header copy). Other cards are explorations for context only. Open in a browser; use the small tabs above card 1a to view each state, click Print inside Preview to see the reminder overlay, and click swatches to see the full-UI re-ink.
- `DocPage.dc.html` — the sample document page used inside previews (drawn entirely in `currentColor`, which is how the prototype fakes recoloring).
- `recolor-reference.js` — reference implementation of the recoloring algorithm (luminance → white-to-ink ramp, white clamp, gamma-aware mix) plus performance notes. Match this behavior; adapt the code freely.
- `screenshots/` — captures of card 1a in every state (the small tab strip at the very top of each image is a prototyping control, not product UI):
  - `01-empty.png` — landing / drop zone
  - `02-processing.png` — determinate progress with first page already shown
  - `03-preview.png` — preview + ink swatches + help accordion
  - `04-print-reminder.png` — dismissible "select Color" reminder after clicking Print
  - `05-preview-holding-original.png` — press-and-hold compare showing the original black rendering
  - `06-error.png` — unsupported file type
