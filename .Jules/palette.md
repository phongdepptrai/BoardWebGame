## 2024-06-21 - Form Input Accessibility
**Learning:** Text inputs that rely solely on placeholders are inaccessible to screen readers and difficult to navigate. In design systems with custom focus outlines (like `focus:outline-none`), keyboard users lose track of focus without explicit visual indicators.
**Action:** Always associate inputs with a proper `<label>` using `id` and `htmlFor`. If a visible label breaks the layout, use `<label className="sr-only">`. Always pair `focus:outline-none` with explicit focus indicators like `focus-visible:ring-2 focus-visible:ring-gold/50`.
