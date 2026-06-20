# Accessibility

This project targets WCAG 2.1 AA wherever practical for a small SPA. Concrete
measures, by category:

## Structure & navigation
- A "Skip to main content" link (`.skip-link` in `index.css`) is the first
  focusable element on every page, visually hidden until focused.
- Semantic landmarks: `<header>`, `<nav aria-label="Main navigation">`,
  `<main id="main-content">`, `<footer>`.
- Route changes always land on a heading (`<h1>`) describing the new page.

## Forms
- Every input has a real `<label htmlFor>` association (`NumberField`,
  `ToggleField`, and the auth form fields) — never a placeholder used as a
  label.
- Related fields are grouped with `<fieldset>` + `<legend>` (see
  `FootprintForm.tsx`'s five category sections).
- Hints are wired up with `aria-describedby`, not just visual proximity.
- Diet selection uses real `<input type="radio">` elements (not styled
  `<div>`s), so it's fully keyboard- and screen-reader-operable.
- Form-level errors use `role="alert"` so assistive tech announces them
  immediately.

## Charts
Charts are the classic accessibility blind spot for dashboards — an SVG bar
or line chart conveys nothing to a screen reader by default. Both
`BreakdownChart` and `TrendChart` address this two ways:
1. The chart container has `role="img"` with a full `aria-label` summarizing
   every data point in words (e.g. "Transport: 50.4 kg CO2e per week, Home
   energy: 20.1 kg CO2e per week, ...").
2. A visually-hidden (`sr-only`) real `<table>` with proper `<caption>`,
   `<th scope="col">`, and `<th scope="row">` markup sits alongside every
   chart, giving screen reader users the exact same data in a native,
   navigable format.

## Interactive controls
- The percentile indicator is a real `role="progressbar"` with
  `aria-valuenow/min/max`, not just a colored `<div>`.
- The "Mark complete" button uses `aria-pressed` to reflect its toggled
  state, and is disabled (not just visually changed) once an action is done.
- Focus states are visible everywhere via a global `:focus-visible` rule with
  a 3px high-contrast outline — never `outline: none` without a replacement.

## Motion & color
- `prefers-reduced-motion: reduce` is respected globally (animations and
  transitions collapse to ~0 duration).
- The color palette (`--color-brand-*`, `--color-ink-*`) was chosen for AA
  contrast on body text against the off-white background; status colors
  (easy/medium/hard difficulty badges) always pair color with a text label,
  never color alone.

## Known gaps / next steps
- No automated axe-core CI check is wired up yet; this would be the natural
  next addition for continuous accessibility regression testing.
- Full keyboard-only manual testing across all five form sections has been
  spot-checked but not exhaustively walked field-by-field.
