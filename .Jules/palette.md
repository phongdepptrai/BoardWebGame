## 2024-06-14 - Input Accessibility and Focus Indicators
**Learning:** Inputs using `focus:outline-none` lose critical keyboard accessibility unless paired with a custom focus ring, and inputs without visible labels must have visually hidden labels (`sr-only`) for screen readers.
**Action:** Always add `focus-visible:ring-2 focus-visible:ring-gold/50` when removing default outlines, and ensure all inputs have associated `<label>` elements, using `sr-only` if the label is purely structural.
