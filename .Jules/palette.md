## 2023-10-27 - Custom Outline/Focus States for Glass Inputs
**Learning:** In the Arcane Parlor design system, `glass-input` elements use `focus:outline-none` which breaks keyboard navigation. The standard replacement is using `focus-visible:ring-2 focus-visible:ring-gold/50` to maintain thematic consistency and accessibility.
**Action:** Always replace `focus:outline-none` with visible focus rings on inputs, checking for the custom `glass-input` style.
