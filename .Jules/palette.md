## 2024-05-20 - Input Accessibility and Focus States
**Learning:** Found that custom `focus:outline-none` styles on inputs without fallback indicators obscure keyboard navigation. Visually hidden labels (`sr-only`) are useful for maintaining minimalist designs while adhering to accessibility guidelines.
**Action:** Always ensure custom inputs pair `focus:outline-none` with visible focus indicators (like `focus-visible:ring`) and provide `sr-only` labels when visual labels are intentionally omitted.
